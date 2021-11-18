import { Module } from '@nestjs/common';
import { CrmModule } from '../Crm/Crm.module';
import { SummaryService } from './Summary.service';

@Module({
  imports: [CrmModule],
  providers: [SummaryService],
})
export class SummaryModule {}
