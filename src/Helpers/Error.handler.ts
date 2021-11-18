import { HttpException, HttpStatus } from '@nestjs/common';

const ErrorHandler = (message: string, status: HttpStatus) => {
  throw new HttpException(message, status);
};

export default ErrorHandler;
