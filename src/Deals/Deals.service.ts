import { Inject, Injectable } from '@nestjs/common';

// imports
import { WooCommService } from '../Woocommerce/WooComm.service';
import { CrmService } from '../Crm/Crm.service';
import { WooCommProviders } from '../Woocommerce/WooComm.types';

@Injectable()
export class DealsService {
  constructor(
    @Inject(WooCommProviders.MAIN_SERVICE)
    private readonly wooCommService: WooCommService,
  ) {}

  async test() {
    return 'Hello World';
  }
}
