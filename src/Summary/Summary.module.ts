import { Module } from '@nestjs/common';
import { CrmModule } from '../Crm/Crm.module';
import { SummaryService } from './Summary.service';

// types
import { SummaryModuleProviders } from './Summary.types';

@Module({
  imports: [CrmModule],
  providers: [
    {
      provide: SummaryModuleProviders.SUMMARY_SERVICE,
      useClass: SummaryService,
    },
  ],
  exports: [SummaryModuleProviders.SUMMARY_SERVICE],
})
export class SummaryModule {}
