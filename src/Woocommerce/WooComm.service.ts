// main imports
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// types
import { ISingleOrder, GetListOfOrdersType } from './WooComm.types';

import { DateTime } from 'luxon';

// errors
import { WooCommerceException } from '../CustomErrors/WooCommerce.errors';

@Injectable()
export class WooCommService {
  private readonly _wooCommClient: WooCommerceRestApi;

  private readonly logger: Logger = new Logger();

  constructor(private readonly configService: ConfigService) {
    const wooCommerceUrl = configService.get('WOOCOMMERCE_API_URL');

    const consumerKey = configService.get('WOOCOMMERCE_CONSUMER_KEY');

    const consumerSecret = configService.get('WOOCOMMERCE_CONSUMER_SECRET');

    this._wooCommClient = new WooCommerceRestApi({
      url: wooCommerceUrl,
      consumerKey,
      consumerSecret,
      version: 'wc/v3',
    });
  }

  public async getSingleOrder(
    orderID: number,
  ): Promise<{ data: ISingleOrder }> {
    try {
      const res = await this._wooCommClient.get(`orders/${orderID}`);

      return res;
    } catch (e) {
      this.logger.warn(e.response.data);
      throw new WooCommerceException();
    }
  }

  public async getListOfProductsFromGivenMonths({
    monthsBack,
    productID,
    ...reqParams
  }: GetListOfOrdersType) {
    try {
      const response = (await this._wooCommClient.get(`orders`, {
        after: DateTime.now().minus({ months: monthsBack }).toISO(),
        product: productID,
        ...reqParams,
      })) as {
        data: ISingleOrder[];
      };

      return response.data;
    } catch (e) {
      throw new WooCommerceException();
    }
  }
}
