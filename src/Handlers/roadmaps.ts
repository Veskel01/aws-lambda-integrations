// nest imports
import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// types
import { ProxyHandler } from './Types';

// modules
import { AppModule } from '../app.module';

// services
import { AuthModuleProviders } from '../Authentication/Authentication.types';
import { AuthenticationService } from '../Authentication/Authentication.service';
import { RoadmapsService } from '../Roadmaps/Roadmaps.service';
import { RoadmapsModuleProviders } from '../Roadmaps/Roadmaps.types';

// utils
import cookiesExtractor from '../Helpers/cookieExtractor';

// Lambda functions
import LambdaResponse from '../Lambda/Lambda.response';
import LambdaErrorHandler from '../Lambda/LambdaError.handler';

export const handler: ProxyHandler = async (event, context, callback) => {
  const path = event.path;

  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get<AuthenticationService>(
    AuthModuleProviders.AUTH_SERVICE,
  );

  const roadmapsService = app.get<RoadmapsService>(
    RoadmapsModuleProviders.MAIN_SERVICE,
  );

  const authToken: string | undefined = cookiesExtractor(
    event,
    'Authentication',
  );

  try {
    const { access_type } = await authService.verifyAuthentication({
      authToken,
    });

    const responseData = await roadmapsService.getListOfPurcharsedRoadmaps({
      monthsBack: 3,
      per_page: 100,
      productID: [1783, 1740, 1741, 1742, 1743],
      status: 'completed',
    });

    callback(
      null,
      LambdaResponse({
        statusCode: HttpStatus.OK,
        body: responseData,
      }),
    );
  } catch (e) {
    return LambdaErrorHandler({
      message: e.message,
      path,
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  }
};
