import { Injectable } from '@nestjs/common';

// imports
import { CrmService } from '../Crm/Crm.service';

@Injectable()
export class DealsService {
  constructor(private readonly crmService: CrmService) {}

  async test() {
    await this.crmService.getAllDeals();
  }
}
