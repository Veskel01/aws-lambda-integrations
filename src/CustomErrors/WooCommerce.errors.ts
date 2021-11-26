import { HttpException, HttpStatus } from '@nestjs/common';

export class WooCommerceException extends HttpException {
  constructor() {
    super(
      'Wystąpił błąd z zamówieniem z Wordpressa',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
