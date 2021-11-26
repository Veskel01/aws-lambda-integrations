import { Inject, Injectable } from '@nestjs/common';
import { from, map, of, mergeMap, BehaviorSubject } from 'rxjs';

// imports
import { WooCommService } from '../Woocommerce/WooComm.service';
import { WooCommProviders } from '../Woocommerce/WooComm.types';

@Injectable()
export class RoadmapsService {
  constructor(
    @Inject(WooCommProviders.MAIN_SERVICE)
    private readonly wooCommService: WooCommService,
  ) {}

  public productList$ = new BehaviorSubject<any>([]);

  test() {
    // TODO
    from(
      this.wooCommService.getListOfProductsFromGivenMonths({
        monthsBack: 3,
        productID: 1784,
        status: 'completed',
        per_page: 100,
      }),
    ).pipe(
      map((orders) =>
        from(orders).pipe(map(({ line_items }) => line_items[0])),
      ),
    );
  }
}
