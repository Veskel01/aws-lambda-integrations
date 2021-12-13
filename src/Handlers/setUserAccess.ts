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
import cookiesExtractor from '../Helpers/cookieExtractor';
import validate from '../Helpers/validator';
import { UserAccessDto } from '../Models/Validators/UserAccess.validator';

export const handler: ProxyHandler = async (event, context, callback) => {
  const path = event.path;

  const appContext = await NestFactory.createApplicationContext(AppModule);

  const requestData = JSON.parse(event.body) as UserAccessRequestBody;

  const authToken = cookiesExtractor(event, 'Authentication');

  const userAccessService = appContext.get(UserAccessService);

  try {
    await validate(UserAccessDto, requestData);

    const { accessKeys, githubName, isAdmin } = requestData;
    const status = await userAccessService.addUserAccess({
      githubName,
      access_type: accessKeys,
      isAdmin,
      accessToken: authToken,
    });

    callback(
      null,
      LambdaResponse({
        statusCode: HttpStatus.OK,
        body: status,
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
