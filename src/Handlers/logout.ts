// imports
import { NestFactory } from '@nestjs/core';
import { HttpStatus } from '@nestjs/common';
import Cookies from 'universal-cookie';

// types
import { LoginModuleProviders } from '../Login/Login.types';
import { ProxyHandler } from './Types';

// providers
import { LoginService } from '../Login/Login.service';

// errors
import { AuthTokenNotExistException } from '../CustomErrors/Auth.errors';

// modules
import { AppModule } from '../app.module';

// lambda
import LambdaResponse from '../Lambda/Lambda.response';
import LambdaErrorHandler from '../Lambda/LambdaError.handler';

export const logoutHandler: ProxyHandler = async (event, context, callback) => {
  const path = event.path;

  const app = await NestFactory.createApplicationContext(AppModule);

  const loginService = app.get<LoginService>(
    LoginModuleProviders.LOGIN_SERVICE,
  );

  const { Cookie: requestCookies } = event.headers as { Cookie: string };

  const parsedCookies = new Cookies(requestCookies);

  const authCookie: string | undefined = parsedCookies.get('Authentication');

  try {
    if (!authCookie) {
      throw new AuthTokenNotExistException();
    }

    const logoutCookies = await loginService.handleLogout(authCookie);

    callback(
      null,
      LambdaResponse({
        statusCode: HttpStatus.OK,
        body: '',
        multiValueHeaders: {
          'Set-Cookie': logoutCookies,
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
