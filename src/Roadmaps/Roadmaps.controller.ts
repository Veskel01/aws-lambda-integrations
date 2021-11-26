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
  test() {
    return this.roadmapService.test();
  }
}
