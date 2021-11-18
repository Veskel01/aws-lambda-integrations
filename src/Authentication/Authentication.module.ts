import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthenticationService } from './Authentication.service';

// types
import { AuthModuleProviders } from './Authentication.types';

// imports
import { DynamoModule } from '../DynamoDB/Dynamo.module';

@Module({
  imports: [
    DynamoModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');

        const expirationTime = configService.get<number>('JWT_EXPIRATION_TIME');

        return {
          secret,
          signOptions: {
            expiresIn: `${expirationTime}s`,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: AuthModuleProviders.AUTH_JWT_SERVICE,
      useExisting: JwtService,
    },
    {
      provide: AuthModuleProviders.AUTH_SERVICE,
      useClass: AuthenticationService,
    },
  ],
  exports: [AuthModuleProviders.AUTH_SERVICE],
})
export class AuthenticationModule {}
