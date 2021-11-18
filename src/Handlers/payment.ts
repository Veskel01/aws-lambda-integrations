import { NestFactory } from '@nestjs/core';
import { PaymentService } from '../Payment/Payment.service';
import { AppModule } from '../app.module';
import { PaymentPayload } from './Types';
import LambdaErrorHandler from 'src/Lambda/LambdaError.handler';

// types
import { ProxyHandler } from './Types';

export const handler: ProxyHandler = async (event) => {
  const { body, httpMethod, requestContext } = event;

  const { path } = requestContext;

  const appContext = await NestFactory.createApplicationContext(AppModule);

  const paymentService = appContext.get(PaymentService);

  if (body && httpMethod === 'POST') {
    const { arg: orderID } = JSON.parse(body) as PaymentPayload;

    if (orderID) {
      try {
        return {
          statusCode: 200,
          body: JSON.stringify(await paymentService.handlePaymentSave(orderID)),
        };
      } catch (e) {
        return LambdaErrorHandler({
          path,
          message: e.message,
          statusCode: e.status,
        });
      }
    }
  }
};
