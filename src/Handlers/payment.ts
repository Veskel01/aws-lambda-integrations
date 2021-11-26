import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

// lambda
import LambdaResponse from '../Lambda/Lambda.response';
import LambdaErrorHandler from '../Lambda/LambdaError.handler';

// providers
import { PaymentService } from '../Payment/Payment.service';
import { PaymentModuleProviders } from '../Payment/Payment.types';

// types
import { PaymentPayload } from './Types';
import { ProxyHandler } from './Types';

export const handler: ProxyHandler = async (event, context, callback) => {
  const { body, httpMethod, requestContext } = event;

  const { path } = requestContext;

  const appContext = await NestFactory.createApplicationContext(AppModule);

  const paymentService = appContext.get<PaymentService>(
    PaymentModuleProviders.PAYMENT_SERVICE,
  );

  if (body && httpMethod === 'POST') {
    const { arg: orderID } = JSON.parse(body) as PaymentPayload;

    if (orderID) {
      try {
        const response = await paymentService.handlePaymentSave(orderID);

        callback(
          null,
          LambdaResponse({
            statusCode: HttpStatus.OK,
            body: response,
          }),
        );

        // return LambdaResponse({
        //   statusCode: HttpStatus.OK,
        //   body: response,
        // });
      } catch (e) {
        return LambdaErrorHandler({
          path,
          message: e.message,
          statusCode: e.status,
        });
      }
    }
    return LambdaErrorHandler({
      path,
      message: 'Brak numeru zamówienia',
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
};
