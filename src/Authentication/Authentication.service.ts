import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

// utils
import * as bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';

// types
import { AuthModuleProviders, AuthJwtPayload } from './Authentication.types';
import {
  DynamoDbUserType,
  DynamoModuleProviders,
} from '../DynamoDB/Dynamo.types';
import { TokenExpiredError } from 'jsonwebtoken';

// db
import { DynamoService } from '../DynamoDB/Dynamo.service';

// errors
import { DynamoDbException } from '../CustomErrors/Dynamo.errors';
import { UserNotExistException } from '../CustomErrors/User.errors';
import {
  AuthTokenExpiredException,
  AuthTokenNotExistException,
  RefreshTokenExpiredException,
  RefreshTokenNotExistException,
  RefreshTokenNotMatchException,
} from '../CustomErrors/Auth.errors';

@Injectable()
export class AuthenticationService {
  private readonly tableName: string = 'amplify_users';

  private readonly authCookieName = 'Authentication';
  private readonly refreshCookieName = 'Refresh';
  private readonly cookieSettings = 'HttpOnly;SameSite=None;Secure;Path=/';

  constructor(
    @Inject(AuthModuleProviders.AUTH_JWT_SERVICE)
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(DynamoModuleProviders.DYNAMO_SERVICE)
    private readonly dynamoService: DynamoService,
  ) {}

  public decodeAuthCookie(authCookie: string) {
    return this.jwtService.decode(authCookie) as AuthJwtPayload;
  }

  public generateAccessCookie(accessToken: string) {
    const expirationTime = this.configService.get<number>(
      'JWT_EXPIRATION_TIME',
    );
    return `${this.authCookieName}=${accessToken};${this.cookieSettings}; Max-Age=${expirationTime}`;
  }

  public generateRefreshCookie(accessToken: string) {
    const expirationTime = this.configService.get<number>(
      'JWT_REFRESH_EXPIRATION_TIME',
    );
    return `${this.refreshCookieName}=${accessToken};${this.cookieSettings}; Max-Age=${expirationTime}`;
  }

  public async generateCookiesForLogout({
    github_name,
  }: {
    github_name: string;
  }): Promise<string[]> {
    try {
      await this.dynamoService.update<DynamoDbUserType>({
        tableName: this.tableName,
        primaryKey: {
          github_name,
        },
        ReturnValues: 'ALL_NEW',
        UpdateExpression: 'set properties.refresh_token = :refreshToken',
        ExpressionAttributeValues: {
          ':refreshToken': null,
        },
      });

      const refreshCookie = `${this.refreshCookieName}=${this.cookieSettings}; Max-Age=0`;
      const authCookie = `${this.authCookieName}=${this.cookieSettings}; Max-Age=0`;

      return [refreshCookie, authCookie];
    } catch (e) {
      // TODO
      console.log(e);
    }
  }

  public generateAccessToken(payload: AuthJwtPayload): string {
    return this.jwtService.sign(payload);
  }

  public async generateRefreshToken({
    github_name,
    isAdmin,
  }: AuthJwtPayload): Promise<string> {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const expirationTime = this.configService.get<number>(
      'JWT_REFRESH_EXPIRATION_TIME',
    );

    const refreshToken = this.jwtService.sign(
      { github_name, isAdmin },
      {
        secret,
        expiresIn: `${expirationTime}s`,
      },
    );

    await this.setUserRefreshToken({
      githubName: github_name,
      refreshToken,
    });

    return refreshToken;
  }

  private async setUserRefreshToken({
    githubName,
    refreshToken,
  }: {
    refreshToken: string;
    githubName: string;
  }) {
    try {
      const salt = await bcrypt.genSalt(10);

      return await this.dynamoService.update<DynamoDbUserType>({
        primaryKey: {
          github_name: githubName,
        },
        tableName: this.tableName,
        UpdateExpression:
          'set properties.last_login_date = :date, properties.refresh_token = :token',
        ExpressionAttributeValues: {
          ':date': DateTime.local().toISO(),
          ':token': await bcrypt.hash(refreshToken, salt),
        },
        ReturnValues: 'ALL_NEW',
      });
    } catch (e) {
      throw new DynamoDbException();
    }
  }

  async verifyAuthentication({ authToken }: { authToken: string | undefined }) {
    if (!authToken) {
      throw new AuthTokenNotExistException();
    }

    try {
      const { github_name }: AuthJwtPayload = this.jwtService.verify(
        authToken,
        {
          ignoreExpiration: false,
        },
      );

      const { response } = await this.dynamoService.get<DynamoDbUserType>({
        primaryKey: {
          github_name,
        },
        tableName: this.tableName,
      });

      if (!response) {
        throw new UserNotExistException();
      }

      const {
        properties: { access_type, isAdmin },
      } = response;

      return { access_type, isAdmin };
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new AuthTokenExpiredException();
      }
      throw e;
    }
  }

  async verifyRefreshToken({
    token,
  }: {
    token: string | undefined;
  }): Promise<{ accessCookie: string }> {
    const secret = this.configService.get('JWT_REFRESH_SECRET');

    const authTokenSecret = this.configService.get('JWT_ACCESS_SECRET');

    if (!token) {
      throw new RefreshTokenNotExistException();
    }

    try {
      const { github_name }: AuthJwtPayload = this.jwtService.verify(token, {
        secret,
      });

      const { response } = await this.dynamoService.get<DynamoDbUserType>({
        primaryKey: { github_name },
        tableName: this.tableName,
      });

      if (!response) {
        throw new RefreshTokenNotExistException();
      }

      await this.dynamoService.update<DynamoDbUserType>({
        tableName: this.tableName,
        primaryKey: { github_name },
        UpdateExpression:
          'set properties.last_token_refresh_date = :lastRefreshDate',
        ExpressionAttributeValues: {
          ':lastRefreshDate': DateTime.local().toISO(),
        },
        ReturnValues: 'NONE',
      });

      const {
        properties: { refresh_token, isAdmin },
      } = response;

      const tokenMatches = await bcrypt.compare(token, refresh_token);

      if (!tokenMatches) {
        throw new RefreshTokenNotMatchException();
      }

      const payload: AuthJwtPayload = { github_name, isAdmin };

      const accessToken = this.jwtService.sign(payload, {
        secret: authTokenSecret,
      });

      const accessCookie = this.generateAccessCookie(accessToken);
      return {
        accessCookie,
      };
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new RefreshTokenExpiredException();
      }
      throw e;
    }
  }
}
