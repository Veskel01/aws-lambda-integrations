import { Controller, Get, Inject } from '@nestjs/common';
import { RoadmapsService } from './Roadmaps.service';
import { RoadmapsModuleProviders } from './Roadmaps.types';

@Controller('roadmaps')
export class RoadmapsController {
  constructor(
    @Inject(RoadmapsModuleProviders.MAIN_SERVICE)
    private readonly roadmapService: RoadmapsService,
  ) {}

  @Get()
  async test() {
    return await this.roadmapService.getListOfPurcharsedRoadmaps({
      monthsBack: 3,
      per_page: 100,
      productID: [1783, 1740, 1741, 1742, 1743],
      status: 'completed',
    });
  }
}
