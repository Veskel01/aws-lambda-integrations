import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor() {
    super('Wprowadzono niepoprawne dane', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
