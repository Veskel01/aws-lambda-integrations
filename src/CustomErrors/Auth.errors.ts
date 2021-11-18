import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthTokenExpiredException extends HttpException {
  constructor() {
    super('Podany token weryfikacyjyn wygasł', HttpStatus.UNAUTHORIZED);
  }
}

export class AuthTokenNotExistException extends HttpException {
  constructor() {
    super('Brak tokena uwierzytelniającego', HttpStatus.UNAUTHORIZED);
  }
}

export class RefreshTokenNotExistException extends HttpException {
  constructor() {
    super('Nieprawidłowe uwierzytelnianie', HttpStatus.FORBIDDEN);
  }
}

export class RefreshTokenExpiredException extends HttpException {
  constructor() {
    super('Token odświeżający wygasł', HttpStatus.FORBIDDEN);
  }
}

export class RefreshTokenNotMatchException extends HttpException {
  constructor() {
    super('Nieprawidłowy token odświeżający', HttpStatus.FORBIDDEN);
  }
}
