// imports
import { NestFactory } from '@nestjs/core';
import { APIGatewayProxyHandler } from 'aws-lambda';

// lambda
import LambdaResponse from '../Lambda/Lambda.response';
import LambdaErrorHandler from '../Lambda/LambdaError.handler';

// modules
import { AppModule } from '../app.module';

// providers
import { SummaryService } from '../Summary/Summary.service';

// helpers
import cookieExtractor from '../Helpers/cookieExtractor';

// authentication
import { AuthenticationService } from '../Authentication/Authentication.service';
import { AuthModuleProviders } from '../Authentication/Authentication.types';

export const handler: APIGatewayProxyHandler = async (event) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const path = event.path;

  const summaryService = appContext.get(SummaryService);

  const authService = appContext.get<AuthenticationService>(
    AuthModuleProviders.AUTH_SERVICE,
  );

  const authToken: string | undefined = cookieExtractor(
    event,
    'Authentication',
  );

  try {
    const { access_type, isAdmin } = await authService.verifyAuthentication({
      authToken,
    });

    const result = await summaryService.handleRequest({
      accessType: access_type,
    });

    return LambdaResponse({
      statusCode: 200,
      body: {
        isAdmin,
        ...result,
      },
    });
  } catch (e) {
    return LambdaErrorHandler({
      message: e.message,
      path,
      statusCode: e.status,
    });
  }
};
