import { NestFactory } from '@nestjs/core';

// types
import { ProxyHandler } from './Types';

// types
import { LoginRequest, LoginModuleProviders } from '../Login/Login.types';
import { LoginDto } from '../models/Validators/Login.validator';

// modules
import { AppModule } from '../app.module';
import { LoginService } from '../Login/Login.service';

// lambda
import LambdaResponse from '../Lambda/Lambda.response';
import LambdaErrorHandler from '../Lambda/LambdaError.handler';

// Helpers
import validate from '../Helpers/validator';

export const handler: ProxyHandler = async (event, context, callback) => {
  const path = event.path;

  const app = await NestFactory.createApplicationContext(AppModule);

  const loginService = app.get<LoginService>(
    LoginModuleProviders.LOGIN_SERVICE,
  );

  try {
    const { body } = event;

    const parsedBody = JSON.parse(body) as LoginRequest;

    await validate(LoginDto, parsedBody);

    const { code } = parsedBody;

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
