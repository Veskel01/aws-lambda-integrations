import { Module } from '@nestjs/common';

// imports
import { DynamoModule } from '../DynamoDB/Dynamo.module';

// service
import { RoadmapsService } from './Roadmaps.service';

// types
import { RoadmapsModuleProviders } from './Roadmaps.types';

@Module({
  imports: [DynamoModule],
  providers: [
    {
      provide: RoadmapsModuleProviders.ROADMAPS_SERVICE,
      useClass: RoadmapsService,
    },
  ],
  exports: [RoadmapsModuleProviders.ROADMAPS_SERVICE],
})
export class RoadmapsModule {}
