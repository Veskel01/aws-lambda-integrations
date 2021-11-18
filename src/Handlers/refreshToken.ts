// imports
import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import Cookies from 'universal-cookie';

// modules
import { AppModule } from '../app.module';

import { ProxyHandler } from './Types';

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

  const { Cookie: requestCookies } = event.headers as { Cookie: string };

  const parsedCookies = new Cookies(requestCookies);

  const refreshToken: string | undefined = parsedCookies.get('Refresh');

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
