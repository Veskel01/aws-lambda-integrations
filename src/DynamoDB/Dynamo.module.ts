import { Module } from '@nestjs/common';

// provides
import { DynamoService } from './Dynamo.service';

// types
import { DynamoModuleProviders } from './Dynamo.types';

@Module({
  providers: [
    {
      provide: DynamoModuleProviders.DYNAMO_SERVICE,
      useClass: DynamoService,
    },
  ],
  exports: [DynamoModuleProviders.DYNAMO_SERVICE],
})
export class DynamoModule {}
