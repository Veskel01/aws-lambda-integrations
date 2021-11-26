import { Module } from '@nestjs/common';

// imports
import { WooCommModule } from '../Woocommerce/WooComm.module';
import { RoadmapsController } from './Roadmaps.controller';

// providers
import { RoadmapsService } from './Roadmaps.service';

// types
import { RoadmapsModuleProviders } from './Roadmaps.types';

@Module({
  imports: [WooCommModule],
  controllers: [RoadmapsController],
  providers: [
    {
      provide: RoadmapsModuleProviders.MAIN_SERVICE,
      useClass: RoadmapsService,
    },
  ],
  exports: [RoadmapsModuleProviders.MAIN_SERVICE],
})
export class RoadmapsModule {}
