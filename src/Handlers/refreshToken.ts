// imports
import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

// modules
import { AppModule } from '../app.module';

import { ProxyHandler } from './Types';

// helpers
import cookieExtractor from '../Helpers/cookieExtractor';

// lambda
import LambdaErrorHandler from '../Lambda/LambdaError.handler';
import LambdaResponse from '../Lambda/Lambda.response';

// authentication
import { AuthenticationService } from '../Authentication/Authentication.service';
import { AuthModuleProviders } from '../Authentication/Authentication.types';

export const refreshTokenHandler: ProxyHandler = async (
  event,
  context,
  callback,
) => {
  const path = event.path;

  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get<AuthenticationService>(
    AuthModuleProviders.AUTH_SERVICE,
  );

  const refreshToken = cookieExtractor(event, 'Refresh');

  try {
    const { accessCookie } = await authService.verifyRefreshToken({
      token: refreshToken,
    });
    callback(
      null,
      LambdaResponse({
        body: null,
        statusCode: HttpStatus.OK,
        headers: {
          'Set-Cookie': accessCookie,
        },
      }),
    );
  } catch (e) {
    return LambdaErrorHandler({
      message: e.message,
      path,
      statusCode: e.status,
    });
  }
};
