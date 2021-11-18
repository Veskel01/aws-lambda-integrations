// imports
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// providers
import { GithubService } from './Github.service';
import { LoginService } from './Login.service';

// providers name
import { LoginModuleProviders } from './Login.types';

// imports
import { AuthenticationModule } from '../Authentication/Authentication.module';
import { DynamoModule } from '../DynamoDB/Dynamo.module';

@Module({
  imports: [HttpModule, AuthenticationModule, DynamoModule],
  providers: [
    {
      provide: LoginModuleProviders.LOGIN_SERVICE,
      useClass: LoginService,
    },
    {
      provide: LoginModuleProviders.GITHUB_SERVICE,
      useClass: GithubService,
    },
  ],
  exports: [LoginModuleProviders.LOGIN_SERVICE],
})
export class LoginModule {}
