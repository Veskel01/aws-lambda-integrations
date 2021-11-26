import { Module } from '@nestjs/common';

// imports
import { CrmModule } from '../Crm/Crm.module';
import { DealsController } from './Deals.controller';

// provider
import { DealsService } from './Deals.service';

// types
import { DealsModuleProviders } from './Deals.types';

// modules
import { WooCommModule } from '../Woocommerce/WooComm.module';
@Module({
  imports: [CrmModule, WooCommModule],
  controllers: [DealsController],
  providers: [
    {
      provide: DealsModuleProviders.DEALS_SERVICE,
      useClass: DealsService,
    },
  ],
  exports: [DealsModuleProviders.DEALS_SERVICE],
})
export class DealsModule {}
