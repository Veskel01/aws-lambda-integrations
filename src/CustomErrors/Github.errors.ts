import { HttpException, HttpStatus } from '@nestjs/common';

export class GithubRequestException extends HttpException {
  constructor() {
    super(
      'Wystąpił błąd przy zapytaniu Github',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class GithubBadVerificationCodeException extends HttpException {
  constructor() {
    super(
      'Podany kod weryfikacyjny jest nieprawidłowy',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
