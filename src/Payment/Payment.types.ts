export const enum PaymentModuleProviders {
  PAYMENT_SERVICE = 'payment_service',
}

export interface IPaymentDto {
  action: string;
  arg: number;
}
