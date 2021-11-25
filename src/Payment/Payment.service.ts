import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { DateTime } from 'luxon';

// services
import { RoadmapsModuleProviders } from '../Roadmaps/Roadmaps.types';
import { RoadmapsService } from '../Roadmaps/Roadmaps.service';
import { DiscordService } from '../Discord/Discord.service';
import { CrmService } from '../Crm/Crm.service';

// types
import { HandleRoadmapSaveType } from '../Roadmaps/Roadmaps.types';
import { ISingleOrder } from './Payment.types';
import { IContact } from '../Crm/Crm.types';

// errors
import ErrorHandler from '../Helpers/Error.handler';
import HttpErrorHandler from '../Helpers/Error.handler';
import getGroupForUserBasedOnProductID from '../Helpers/GetGroupForUser';
import getProductType from '../Helpers/GetProductType';

@Injectable()
export class PaymentService {
  private logger: Logger = new Logger(PaymentService.name);

  private readonly _wooCommClient: WooCommerceRestApi;

  constructor(
    @Inject(RoadmapsModuleProviders.ROADMAPS_SERVICE)
    private readonly roadmapService: RoadmapsService,
    private readonly configService: ConfigService,
    private readonly crmService: CrmService,
    private readonly discordService: DiscordService,
  ) {
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

  async handlePaymentSave(orderID: number) {
    const singleOrder = await this._getSingleOrderData(orderID);

    const {
      billing: { email },
    } = singleOrder;

    const contact = await this.crmService.getSingleContact({
      email,
    });

    if (!contact) {
      return await this._createNewContact(singleOrder);
    }

    return await this._handleCreatedContact(singleOrder, contact);
  }

  private async _getSingleOrderData(orderID: number): Promise<ISingleOrder> {
    try {
      const res = (await this._wooCommClient.get(`orders/${orderID}`)) as {
        data: ISingleOrder;
      };

      return res.data;
    } catch (e) {
      this.logger.warn(e.response.data);
      HttpErrorHandler(
        'Wystąpił błąd podczas łączenia się z Wordpressem',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private async _createNewContact(order: ISingleOrder) {
    const {
      customer_note: githubName,
      line_items: productList,
      date_completed,
      billing: { first_name: firstName, last_name: lastName, email },
      coupon_lines: { '0': couponDto },
    } = order;

    const { product_id, quantity, total } = productList[0];

    const { orderType, groupIdForCustomer } =
      getGroupForUserBasedOnProductID(product_id);

    const paymentDate = date_completed
      ? date_completed
      : DateTime.local().toISO();

    if (orderType === 'roadmap') {
      try {
        await this._handleRoadmapSaveIntoDynamo({
          github_name: githubName,
          productData: {
            ...productList[0],
            currency: order.currency,
            date_completed: paymentDate,
          },
          userDetails: {
            ...order.billing,
          },
          couponDetails: couponDto ? { ...couponDto } : null,
        });
        const { id } = (await this.crmService.createNewRoadmapOwner({
          firstName,
          lastName,
          productID: product_id,
          email,
          githubName,
          groupIdForCustomer,
        })) as { id: string };
        return await this.discordService.sendDiscordMessage({
          msgType: 'roadmapBought',
          contactID: id,
          order,
        });
      } catch (e) {
        this.logger.warn(e);
        ErrorHandler(
          'Wystąpił błąd podczas łączenia się z Wordpressem',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    try {
      const { id } = await this.crmService.createNewStudent({
        coupon: couponDto ? couponDto.code : null,
        email,
        firstname: firstName,
        lastname: lastName,
        githubName,
        groupID: groupIdForCustomer,
        paymentDate,
        productPrice: total,
        productQuantity: quantity,
      });

      return await this.discordService.sendDiscordMessage({
        msgType: 'createStudent',
        contactID: id,
        order,
      });
    } catch (e) {
      this.logger.warn(e);
      ErrorHandler(
        'Wystąpił błąd podczas łączenia się z Wordpressem',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async _handleCreatedContact(order: ISingleOrder, contact: IContact) {
    const { id } = contact;

    const {
      customer_note: github_name,
      line_items: { '0': product },
      coupon_lines: { '0': couponDto },
    } = order;

    const { product_id } = product;

    const { productType } = getProductType(product_id);

    if (productType === 'unknown') {
      HttpErrorHandler('Nieznany produkt', HttpStatus.NOT_FOUND);
      return null;
    }

    if (productType === 'roadmap') {
      await this._handleRoadmapSaveIntoDynamo({
        github_name,
        productData: {
          ...product,
          currency: order.currency,
          date_completed: order.date_completed
            ? order.date_completed
            : DateTime.local().toISO(),
        },
        userDetails: {
          ...order.billing,
        },
        couponDetails: couponDto ? { ...couponDto } : null,
      });
    }

    await this.crmService.handleBought({
      contact,
      order,
      productID: product_id,
      productType,
    });
    return await this.discordService.sendDiscordMessage({
      contactID: id,
      order,
      msgType: productType === 'roadmap' ? 'roadmapBought' : 'mentoringReneval',
    });
  }

  private async _handleRoadmapSaveIntoDynamo(
    roadmapData: HandleRoadmapSaveType,
  ) {
    console.log(roadmapData);
    // TODO poprawic i pamiętać o tym, że ktoś może kupić roadmapę pare razy
    //await this.roadmapService.handleRoadmapSave(roadmapData);
  }
}
