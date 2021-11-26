import { Controller, Get, Inject } from '@nestjs/common';
import { DealsService } from './Deals.service';
import { DealsModuleProviders } from './Deals.types';

@Controller('deals')
export class DealsController {
  constructor(
    @Inject(DealsModuleProviders.DEALS_SERVICE)
    private readonly dealsService: DealsService,
  ) {}

  @Get()
  async test() {
    return await this.dealsService.test();
  }
}
