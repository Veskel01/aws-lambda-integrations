import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CrmModule } from './Crm/Crm.module';

// modules
import { PaymentModule } from './Payment/Payment.module';
import { LoginModule } from './Login/Login.module';
import { SummaryModule } from './Summary/Summary.module';
import { UserAccessModule } from './UserAccess/UserAccess.module';

@Module({
  imports: [
    CrmModule,
    PaymentModule,
    SummaryModule,
    UserAccessModule,
    LoginModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}