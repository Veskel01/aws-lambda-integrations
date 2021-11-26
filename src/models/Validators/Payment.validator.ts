import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  @IsNotEmpty()
  action: string;
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  arg: number;
}
