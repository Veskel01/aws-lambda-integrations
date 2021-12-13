import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import {
  UserExistException,
  UserInsufficientPermissionsException,
} from '../CustomErrors/User.errors';

// types
import {
  DynamoDbUserType,
  DynamoModuleProviders,
} from '../DynamoDB/Dynamo.types';
import { AddUserAccess, AccessKeysType } from './UserAccess.types';
// db
import { DynamoService } from '../DynamoDB/Dynamo.service';

// imports
import { AuthModuleProviders } from '../Authentication/Authentication.types';
import { AuthenticationService } from '../Authentication/Authentication.service';
import { LoginModuleProviders } from '../Login/Login.types';
import { GithubService } from '../Login/Github.service';

@Injectable()
export class UserAccessService {
  private readonly dynamoTableName: string = 'amplify_users';

  constructor(
    @Inject(AuthModuleProviders.AUTH_SERVICE)
    private readonly authService: AuthenticationService,
    @Inject(DynamoModuleProviders.DYNAMO_SERVICE)
    private readonly dynamoService: DynamoService,
    @Inject(LoginModuleProviders.GITHUB_SERVICE)
    private readonly githubService: GithubService,
  ) {}

  private async checkIfUserExist({ githubName }: { githubName: string }) {
    try {
      const { response } = await this.dynamoService.get<DynamoDbUserType>({
        tableName: this.dynamoTableName,
        primaryKey: {
          github_name: githubName,
        },
      });

      if (response) throw new UserExistException();
    } catch (e) {
      if (e instanceof UserExistException) {
        throw e;
      }
      throw new UnauthorizedException('Brak uprawnień');
    }
  }

  public async addUserAccess({
    githubName,
    access_type: accessKeys,
    isAdmin: isAdminProp,
    accessToken,
  }: AddUserAccess) {
    try {
      const userID = uuid();

      const [{ isAdmin }] = await Promise.all([
        this.authService.verifyAuthentication({
          authToken: accessToken,
        }),
        this.githubService.checkIfGithubUserExist(githubName),
      ]);

      if (!isAdmin) {
        throw new UserInsufficientPermissionsException();
      }

      const accessType: AccessKeysType[] =
        accessKeys.indexOf('full_access') !== -1
          ? ['full_access']
          : [...accessKeys];

      await this.checkIfUserExist({
        githubName,
      });
      await this.dynamoService.insert({
        tableName: this.dynamoTableName,
        primaryKey: {
          github_name: githubName,
        },
        data: {
          properties: {
            isAdmin: isAdminProp,
            id: userID,
            access_type: accessType,
            created_at: DateTime.local().toISO(),
            last_login_date: null,
          },
        },
      });

      return 'success';
    } catch (e) {
      throw e;
    }
  }
}
