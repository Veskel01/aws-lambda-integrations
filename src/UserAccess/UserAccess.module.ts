import { Module } from '@nestjs/common';
import { UserAccessService } from './UserAccess.service';
import { DynamoModule } from '../DynamoDB/Dynamo.module';

// auth
import { AuthenticationModule } from '../Authentication/Authentication.module';

@Module({
  imports: [DynamoModule, AuthenticationModule],
  providers: [UserAccessService],
  exports: [UserAccessService],
})
export class UserAccessModule {}
