// imports
import { Product, ISingleOrder } from '../Payment/Payment.types';

export const enum RoadmapsModuleProviders {
  ROADMAPS_SERVICE = 'roadmaps_service',
}

type RoadmapProductType = Pick<Product, 'name' | 'id' | 'total'> &
  Pick<ISingleOrder, 'currency' | 'date_completed'>;
// TODO
export type HandleRoadmapSaveType = {
  github_name: string;
  productData: RoadmapProductType;
  userDetails: Pick<
    ISingleOrder['billing'],
    'first_name' | 'last_name' | ('email' & ISingleOrder[])
  >;
  couponDetails: Pick<
    ISingleOrder['coupon_lines'][0],
    'code' | 'discount'
  > | null;
};

export type RoadmapTableDataType = {
  github_name: string;
  product_data: {
    name: string;
    id: number;
    total: string;
    currency: string;
  };
  user_data: {
    first_name: string;
    last_name: string;
    email: string;
  };
  coupon_detais: { code: string; discount: string };
  other_details: {
    date_of_bought: string;
  };
};

export type RoadmapOwnerDataUpdateType = {
  github_name: string;
  product: RoadmapProductType;
};
