import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DateTime } from 'luxon';

// services
import { DiscordService } from '../Discord/Discord.service';
import { CrmService } from '../Crm/Crm.service';
import { WooCommService } from '../Woocommerce/WooComm.service';
import { WooCommProviders } from '../Woocommerce/WooComm.types';

// types
import { ISingleOrder } from '../Woocommerce/WooComm.types';
import { IContact } from '../Crm/Crm.types';

// errors
import ErrorHandler from '../Helpers/Error.handler';
import HttpErrorHandler from '../Helpers/Error.handler';
import getGroupForUserBasedOnProductID from '../Helpers/GetGroupForUser';
import getProductType from '../Helpers/GetProductType';

@Injectable()
export class PaymentService {
  private logger: Logger = new Logger(PaymentService.name);

  constructor(
    @Inject(WooCommProviders.MAIN_SERVICE)
    private readonly wooCommService: WooCommService,
    private readonly configService: ConfigService,
    private readonly crmService: CrmService,
    private readonly discordService: DiscordService,
  ) {}

  async handlePaymentSave(orderID: number) {
    const { data: singleOrder } = await this.wooCommService.getSingleOrder(
      orderID,
    );

    const {
      billing: { email },
    } = singleOrder;

    const contact = await this.crmService.getSingleContact({ email });

    if (!contact) {
      return await this._createNewContact(singleOrder);
    }

    return await this._handleCreatedContact(singleOrder, contact);
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
        const { id } = await this.crmService.createNewRoadmapOwner({
          firstName,
          lastName,
          productID: product_id,
          email,
          githubName,
          groupIdForCustomer,
        });
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
      line_items: { '0': product },
    } = order;

    const { product_id } = product;

    const { productType } = getProductType(product_id);

    if (productType === 'unknown') {
      HttpErrorHandler('Nieznany produkt', HttpStatus.NOT_FOUND);
      return null;
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
}
