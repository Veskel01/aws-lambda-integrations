import { HttpException, HttpStatus } from '@nestjs/common';

export class DynamoDbException extends HttpException {
  constructor() {
    super('Wystąpił błąd z łączeniem z AWS', HttpStatus.SERVICE_UNAVAILABLE);
  }
}
