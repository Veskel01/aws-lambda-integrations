import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
// imports
import { WooCommService } from '../Woocommerce/WooComm.service';
import {
  GetListOfOrdersType,
  ISingleOrder,
  WooCommProviders,
} from '../Woocommerce/WooComm.types';
import { PurcharsedRoadmapsType } from './Roadmaps.types';

@Injectable()
export class RoadmapsService {
  constructor(
    @Inject(WooCommProviders.MAIN_SERVICE)
    private readonly wooCommService: WooCommService,
  ) {}

  private prepareValueToReturn(orders: ISingleOrder[]) {
    return orders.reduce((acc, curr) => {
      const {
        line_items,
        billing: { first_name, email, last_name },
        currency,
        date_completed,
        currency_symbol,
      } = curr;

      const singleProduct = line_items.map(
        ({ total, quantity, product_id, name }) => ({
          name,
          total: +total,
          quantity,
          product_id,
        }),
      );

      const monthsDiff: number =
        DateTime.now().month -
        DateTime.fromISO(date_completed || DateTime.now().toISO()).month;

      acc.push({
        first_name,
        last_name,
        email,
        currency,
        monthsDiff,
        currency_symbol,
        boughtDate: date_completed,
        products: singleProduct,
      });
      return acc;
    }, [] as PurcharsedRoadmapsType[]);
  }

  async getListOfPurcharsedRoadmaps(
    args: GetListOfOrdersType,
  ): Promise<PurcharsedRoadmapsType[]> {
    if (Array.isArray(args.productID)) {
      const { productID, ...rest } = args;

      const preparedRequestBody = productID.map((productID) => ({
        productID,
        ...rest,
      }));

      const responses = await Promise.all(
        preparedRequestBody.map((requestData) =>
          this.wooCommService.getListOfProductsFromGivenMonths(requestData),
        ),
      );

      return this.prepareValueToReturn(responses.flat(1));
    }

    const orders = await this.wooCommService.getListOfProductsFromGivenMonths(
      args,
    );

    return this.prepareValueToReturn(orders);
  }
}
