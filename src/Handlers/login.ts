import { NestFactory } from '@nestjs/core';

// types
import { ProxyHandler } from './Types';

// types
import { LoginRequest, LoginModuleProviders } from '../Login/Login.types';

// modules
import { AppModule } from '../app.module';
import { HttpStatus } from '@nestjs/common';
import { LoginService } from '../Login/Login.service';

// lambda
import LambdaResponse from '../Lambda/Lambda.response';
import LambdaErrorHandler from '../Lambda/LambdaError.handler';

export const handler: ProxyHandler = async (event, context, callback) => {
  const path = event.path;

  const app = await NestFactory.createApplicationContext(AppModule);

  const loginService = app.get<LoginService>(
    LoginModuleProviders.LOGIN_SERVICE,
  );

  const body = JSON.parse(event.body) as LoginRequest;

  if (!body || !body.code) {
    return LambdaErrorHandler({
      message: 'Nieprawidłowe dane zapytania',
      path,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }

  const { code } = body;

  try {
    const { accessCookie, refreshCookie } = await loginService.handleLogin({
      code,
    });

    callback(
      null,
      LambdaResponse({
        statusCode: 200,
        body: null,
        headers: {
          'Set-Cookie': accessCookie,
          'set-Cookie': refreshCookie,
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
