import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PaymentService } from './Payment.service';

// modules
import { CrmModule } from '../Crm/Crm.module';
import { DiscordModule } from '../Discord/Discord.module';
import { RoadmapsModule } from '../Roadmaps/Roadmaps.module';

@Module({
  imports: [HttpModule, CrmModule, DiscordModule, RoadmapsModule],
  providers: [PaymentService],
})
export class PaymentModule {}
