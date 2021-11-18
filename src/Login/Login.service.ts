// imports
import { Inject, Injectable } from '@nestjs/common';

// providers
import { GithubService } from './Github.service';
import { AuthModuleProviders } from '../Authentication/Authentication.types';
import { AuthenticationService } from '../Authentication/Authentication.service';

// errors
import { UserNotExistException } from '../CustomErrors/User.errors';

// types
import { AuthJwtPayload } from '../Authentication/Authentication.types';
import { LoginRequest, LoginModuleProviders } from './Login.types';
import {
  DynamoDbUserType,
  DynamoModuleProviders,
} from '../DynamoDB/Dynamo.types';

// database
import { DynamoService } from '../DynamoDB/Dynamo.service';

@Injectable()
export class LoginService {
  private readonly tableName: string = 'amplify_users';

  constructor(
    @Inject(LoginModuleProviders.GITHUB_SERVICE)
    private readonly githubService: GithubService,
    @Inject(AuthModuleProviders.AUTH_SERVICE)
    private readonly authService: AuthenticationService,
    @Inject(DynamoModuleProviders.DYNAMO_SERVICE)
    private readonly dynamoService: DynamoService,
  ) {}

  async handleLogin({ code }: LoginRequest) {
    const { login: github_name } = await this.githubService.getGithubData(code);

    const { response } = await this.dynamoService.get<DynamoDbUserType>({
      tableName: this.tableName,
      primaryKey: {
        github_name,
      },
    });

    if (!response) {
      throw new UserNotExistException();
    }

    const {
      properties: { isAdmin },
    } = response;

    const jwtPayload: AuthJwtPayload = {
      github_name,
      isAdmin,
    };

    const accessToken = this.authService.generateAccessToken(jwtPayload);

    const refreshToken = await this.authService.generateRefreshToken(
      jwtPayload,
    );

    const accessCookie = this.authService.generateAccessCookie(accessToken);

    const refreshCookie = this.authService.generateRefreshCookie(refreshToken);

    return {
      accessCookie,
      refreshCookie,
    };
  }

  public async handleLogout(authCookie: string): Promise<string[]> {
    const { github_name } = this.authService.decodeAuthCookie(authCookie);

    return await this.authService.generateCookiesForLogout({ github_name });
  }
}
