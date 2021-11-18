import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Product } from '../Payment/Payment.types';
import additionalFieldsConfig from '../utils/AdditionalFieldsId.config';
import { ICreateNewStudent, PrepareBoughtFieldsType } from './Crm.types';
import paymentFieldsIdConfig from '../utils/PaymentsFieldsId.config';
import productFieldsIdConfig from '../utils/ProductFieldsId.config';

@Injectable()
export class CrmHelperService {
  private readonly _headMentor = 'Przemek J (JS)';

  private readonly _formOfPayment = 'Sklep';

  public prepareNewStudentRequestBody({
    firstname,
    lastname,
    groupID,
    coupon,
    email,
    githubName,
    productQuantity,
    paymentDate,
    productPrice,
  }: ICreateNewStudent) {
    const {
      dayOfPaymentFieldID,
      dedicatedCouponFieldID,
      firstPaymentDateFieldID,
      formOfPaymentFieldID,
      lastPaymentDateFieldID,
      prepaidedMonthsFieldID,
      paymentAmountFieldID,
    } = paymentFieldsIdConfig;

    const { sawMentoring, buyMentoring } = productFieldsIdConfig;

    const { githubFieldID, headMentor } = additionalFieldsConfig;

    const dayOfPayment = DateTime.fromISO(paymentDate).toFormat('dd');

    return {
      firstname,
      lastname,
      emails: [email],
      groups: [groupID],
      dataset: {
        [paymentAmountFieldID]: productPrice,
        [githubFieldID]: githubName,
        [dedicatedCouponFieldID]: coupon,
        [firstPaymentDateFieldID]: paymentDate,
        [lastPaymentDateFieldID]: paymentDate,
        [formOfPaymentFieldID]: this._formOfPayment,
        [headMentor]: this._headMentor,
        [prepaidedMonthsFieldID]: productQuantity - 1,
        [dayOfPaymentFieldID]: dayOfPayment,
        [sawMentoring]: true,
        [buyMentoring]: true,
      },
    };
  }

  public prepareFieldsIDforRoadmaps(
    productFieldsID: string | string[],
  ): Record<string, unknown> {
    const { sawRoadmapsFieldID } = productFieldsIdConfig;

    if (Array.isArray(productFieldsID)) {
      const allRoadmapsFieldsChecked = productFieldsID.reduce(
        (acc, curr) => ({ ...acc, [curr]: true }),
        {},
      );

      return {
        [sawRoadmapsFieldID]: true,
        ...allRoadmapsFieldsChecked,
      };
    }

    return {
      [productFieldsID]: true,
      [sawRoadmapsFieldID]: true,
    };
  }

  public prepareFieldsForMentoringBought(
    product: Product,
    dateCompleted: string,
    couponValue: string | null,
    firstPaymentDate: string,
    formOfPayment: string,
  ) {
    const { total, quantity } = product;

    const {
      prepaidedMonthsFieldID,
      paymentAmountFieldID,
      dedicatedCouponFieldID,
      lastPaymentDateFieldID,
      dayOfPaymentFieldID,
      formOfPaymentFieldID,
      firstPaymentDateFieldID,
    } = paymentFieldsIdConfig;

    const { sawMentoring, buyMentoring } = productFieldsIdConfig;

    const { headMentor } = additionalFieldsConfig;

    return {
      [headMentor]: 'Przemek J (JS)',
      [prepaidedMonthsFieldID]: quantity - 1,
      [paymentAmountFieldID]: total,
      [dedicatedCouponFieldID]: couponValue,
      [lastPaymentDateFieldID]: dateCompleted,
      [dayOfPaymentFieldID]: DateTime.local().toFormat('dd'),
      [formOfPaymentFieldID]: formOfPayment
        ? formOfPayment
        : this._formOfPayment,
      [firstPaymentDateFieldID]: firstPaymentDate
        ? firstPaymentDate
        : DateTime.local().toISO(),
      [sawMentoring]: true,
      [buyMentoring]: true,
    };
  }

  public prepareFieldsForBought({
    order,
    productId,
    productType,
    contact,
  }: PrepareBoughtFieldsType) {
    if (productType === 'roadmap') {
      return this.prepareFieldsIDforRoadmaps(productId);
    }

    const { dataset } = contact;

    const { firstPaymentDateFieldID, formOfPaymentFieldID } =
      paymentFieldsIdConfig;

    const firstPayment = dataset[firstPaymentDateFieldID] as string;

    const formOfPayment = dataset[formOfPaymentFieldID] as string;

    const {
      line_items: { '0': product },
      coupon_lines: { '0': coupon },
    } = order;

    return this.prepareFieldsForMentoringBought(
      product,
      DateTime.local().toISO(),
      coupon ? coupon.code : null,
      firstPayment,
      formOfPayment,
    );
  }
}
