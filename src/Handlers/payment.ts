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

// Helpers
import validate from '../Helpers/validator';
import { PaymentDto } from '../models/Validators/Payment.validator';

export const handler: ProxyHandler = async (event, context, callback) => {
  const { body, requestContext } = event;

  const { path } = requestContext;

  const appContext = await NestFactory.createApplicationContext(AppModule);

  const paymentService = appContext.get<PaymentService>(
    PaymentModuleProviders.PAYMENT_SERVICE,
  );

  try {
    const parsedBody = JSON.parse(body) as PaymentPayload;

    await validate(PaymentDto, parsedBody);

    const { arg: orderID } = parsedBody;

    const response = await paymentService.handlePaymentSave(orderID);

    callback(
      null,
      LambdaResponse({
        statusCode: HttpStatus.OK,
        body: response,
      }),
    );
  } catch (e) {
    return LambdaErrorHandler({
      path,
      message: e.message,
      statusCode: e.status,
    });
  }
};
