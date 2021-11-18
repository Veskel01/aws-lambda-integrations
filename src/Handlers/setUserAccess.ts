import { NestFactory } from '@nestjs/core';

// error
import LambdaErrorHandler from '../Lambda/LambdaError.handler';

// module
import { UserAccessService } from '../UserAccess/UserAccess.service';
import { AppModule } from '../app.module';
import { HttpStatus } from '@nestjs/common';
import LambdaResponse from '../Lambda/Lambda.response';
import { UserAccessRequestBody } from './Types';

// types
import { ProxyHandler } from './Types';
import cookiesExtractor from 'src/Helpers/cookieExtractor';

export const handler: ProxyHandler = async (event) => {
  const path = event.path;

  const appContext = await NestFactory.createApplicationContext(AppModule);

  const requestData = JSON.parse(event.body) as UserAccessRequestBody;

  if (
    !requestData.accessKeys ||
    !requestData.githubName ||
    !requestData.isAdmin
  ) {
    return LambdaErrorHandler({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Nieprawidłowe Zapytanie',
      path,
    });
  }

  const authToken = cookiesExtractor(event, 'Authentication');

  const { accessKeys, githubName, isAdmin } = requestData;

  const userAccessService = appContext.get(UserAccessService);

  try {
    const status = await userAccessService.addUserAccess({
      githubName,
      access_type: accessKeys,
      isAdmin,
      accessToken: authToken,
    });

    return LambdaResponse({
      statusCode: HttpStatus.OK,
      body: status,
    });
  } catch (e) {
    return LambdaErrorHandler({
      message: e.message,
      path: event.path,
      statusCode: e.status,
    });
  }
};
