import { Module } from '@nestjs/common';
import { UserAccessService } from './UserAccess.service';
import { LoginModule } from '../Login/Login.module';
import { DynamoModule } from '../DynamoDB/Dynamo.module';

// auth
import { AuthenticationModule } from '../Authentication/Authentication.module';

@Module({
  imports: [DynamoModule, AuthenticationModule, LoginModule],
  providers: [UserAccessService],
  exports: [UserAccessService],
})
export class UserAccessModule {}
