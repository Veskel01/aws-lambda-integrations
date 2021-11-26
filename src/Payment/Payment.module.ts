import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PaymentService } from './Payment.service';

// modules
import { CrmModule } from '../Crm/Crm.module';
import { DiscordModule } from '../Discord/Discord.module';
import { WooCommModule } from '../Woocommerce/WooComm.module';

// types
import { PaymentModuleProviders } from './Payment.types';

@Module({
  imports: [HttpModule, CrmModule, DiscordModule, WooCommModule],
  providers: [
    {
      provide: PaymentModuleProviders.PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
  exports: [PaymentModuleProviders.PAYMENT_SERVICE],
})
export class PaymentModule {}
