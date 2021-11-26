import { Module } from '@nestjs/common';
import { WooCommService } from './WooComm.service';

// types
import { WooCommProviders } from './WooComm.types';

@Module({
  providers: [
    {
      provide: WooCommProviders.MAIN_SERVICE,
      useClass: WooCommService,
    },
  ],
  exports: [WooCommProviders.MAIN_SERVICE],
})
export class WooCommModule {}
