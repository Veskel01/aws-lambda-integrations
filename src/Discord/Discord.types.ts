import { ISingleOrder } from '../Payment/Payment.types';

export type CouponType = {
  id: number;
  code: string;
  discount: string;
  discount_tax: string;
  meta_data: any[];
};

export interface ISendDiscordMsg {
  msgType:
    | 'firstMentoringPurchase'
    | 'firstRoadmapPurchase'
    | 'mentoringReneval'
    | 'createStudent'
    | 'roadmapBought';
  contactID: string;
  order: ISingleOrder;
}
