import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CrmService } from './Crm.service';
import { CrmHelperService } from './CrmHelper.service';

@Module({
  imports: [HttpModule],
  providers: [CrmService, CrmHelperService],
  exports: [CrmService],
})
export class CrmModule {}
