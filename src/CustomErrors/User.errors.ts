import { HttpException, HttpStatus } from '@nestjs/common';

export class UserExistException extends HttpException {
  constructor() {
    super('Podany użytkownik już uzyskał dostęp', HttpStatus.CONFLICT);
  }
}

export class UserNotExistException extends HttpException {
  constructor() {
    super('Podany użytkownik nie został zarejestrowany', HttpStatus.NOT_FOUND);
  }
}

export class UserInsufficientPermissionsException extends HttpException {
  constructor() {
    super('Brak odpowiednich uprawnień', HttpStatus.FORBIDDEN);
  }
}
