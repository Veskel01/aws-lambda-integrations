import { GetProductType } from '../Helpers/GetProductType';
import { ISingleOrder } from '../Woocommerce/WooComm.types';

export interface ICrmResponse {
  data: {
    contact: Record<string, unknown> | Record<string, unknown>[];
  };
  error: Record<'type', string> | null;
  result: number;
  status: boolean;
}

export interface ICreateRoadmapOwner {
  email: string;
  groupIdForCustomer: string;
  firstName: string;
  lastName: string;
  githubName: string;
  productID: number;
}

export interface ICreateNewStudent {
  firstname: string;
  lastname: string;
  email: string;
  githubName: string;
  groupID: string;
  coupon: string | null;
  paymentDate: string;
  productQuantity: number;
  productPrice: string;
}

export interface ICreatedContact {
  firstname: string;
  lastname: string;
  emails: string[];
  groups: string[];
  id: string;
  dataset: Record<string, unknown>;
}

export interface IContact {
  id: string;
  contact_id: string;
  type: string;
  url: string;
  firstname: string;
  lastname: string;
  company_name: string;
  note: null | string;
  created: string;
  modified: string;
  email: string;
  phone: string | null;
  cell: string | null;
  fax: string | null;
  www: string | null;
  last_active_date: string;
  addressurl: string | null;
  name: string;
  address_name: string | null;
  address_street: string | null;
  address_street2: string | null;
  address_city: string | null;
  address_postcode: string | null;
  address_region: string | null;
  address_country: string | null;
  address_province_name: string | null;
  phones: Record<string, unknown>[];
  emails: {
    value: string;
    type: string;
    id: number;
  }[];
  instant_messengers: unknown[];
  addresses: unknown[];
  groups: string[];
  groups_id: string[];
  dataset: Record<string, unknown>;
  invited: [
    {
      structure_id: string;
      structure_name: string;
      roles: string[];
    },
    {
      user_id: string;
      user_name: string;
      user_structure_id: string;
      roles: string[];
    },
  ];
  owner_id: string;
  owner_name: string;
  owner_email: string;
  onwer_phone: string | null;
  tags: string[];
  source_id: number;
  source_name: string | null;
  dataset_field_name: {
    '214ca289-e9c0-fd69-324e-cfb568ae3490': 'facebook';
    '0b7e0cb4-e101-c75c-f240-3fad758781ca': 'Day of payment';
    '9bb618f4-0468-f2ab-fd31-7214e678a7bd': 'SALESmanago id';
    '453182a7-a461-d596-084f-d57ee09bb61d': 'Dane z ankiety kontaktowej';
    '914ce3b3-7248-fccc-c003-ac32fa421a82': 'Widział roadmapy';
    '7157a6fa-7ef9-d0a4-206a-1bced6c4e82d': 'Dołączył do newslettera';
    'd0fc1545-813e-8483-4a5b-a4b8f096a177': 'Form of payment';
    '214ca289-e9c0-fd69-324e-cfb568ae3491': 'linkedin';
    '9200f621-27d4-a25f-f301-650b82a5cc9c': 'SALESmanago scoring';
    'bdff0d92-c77e-7a65-f20a-0f7f74f4e5a2': 'TAG POINTS: mentor is good way to learn';
    'cb71b793-b7cc-fefe-603f-663b6df6424a': 'Kupił roadmapę JS/TS Fundamentals';
    '3e6e9b75-27b8-a342-5124-be52ffc79df8': 'TAG POINTS: aware programmer';
    '58cd7a74-fdf8-c37c-63c4-91a8a1338fc4': 'Head Mentor';
    '214ca289-e9c0-fd69-324e-cfb568ae3492': 'goldenline';
    '5177931d-c7ef-1048-1f2a-f44f4bed5e9d': 'Kupił roadmapę Reacta';
    '949487fe-810c-f163-3724-a3eba1130e14': 'Prepaided months';
    '8d17d608-d613-d966-3c87-5cf483d6474e': 'Kupił roadmapę Backendową';
    '214ca289-e9c0-fd69-324e-cfb568ae3493': 'twitter';
    'de854161-84e8-5572-9b90-146732db702c': 'Payment amount';
    'ab487018-abaf-220b-11c9-d6cf9878125d': 'SALESmanago tag';
    'dedf0a66-8c49-0f3e-804a-c5888cdc81fd': 'Leading Mentor';
    '8e87d133-3141-1417-17a5-ca9757b2771f': 'TAG POINTS: practise is important';
    'aed1225e-d7c8-bb81-3ac0-dffac1c0f612': 'Kupił roadmapę Portfolio Builder';
    '9c712af0-50f7-fe96-97a9-dbecf7dac95d': 'Github Name';
    '13f64de8-bf7f-6a84-1f14-9db6c4cd64d7': 'Is payment for this month completed';
    '214ca289-e9c0-fd69-324e-cfb568ae3495': 'instagram';
    '512672be-7189-77a7-6af5-6293a96edbbb': 'Last payment date';
    '3aaf70f9-0224-fa0a-0b3f-3ccde57c150e': 'Discord ID';
    '69e41240-c789-f476-8fca-97df1536c73d': 'Widział mentoring';
    'bbc4f7da-3e3f-4f05-7ea3-396dbf133c00': 'Kupił mentoring';
    'f4ca48f3-0049-24c2-a2b5-592e479194d8': 'funnel';
    '786e19b0-3839-8bdd-6a12-039dd628975d': 'Dedicated Coupon';
    'bc3f21c1-4cb4-5194-29d0-bc73499ee79d': 'properties';
    'd5c9f0c7-492a-b3b6-3c16-6909d3db904c': 'First payment';
    '59901694-8913-0bf6-3827-2dc9d1000aa9': 'note';
    '0db873b5-034a-301a-4939-880a7d7c311b': 'Student took a break';
    '7b713029-44ac-bfd9-fecd-8c3a9a1d3026': 'event';
    '8d7dca95-7ba9-164e-47b2-fdd75591b97c': 'Student will go back from break at';
  };
  salesmanago_id: string | null;
  company: string[];
  relations: {
    has_project_contact: number;
    has_not_project_contact: number;
  };
  creator_name: string;
  creator_email: string;
  modifier_id: string;
  modifier_name: string;
  modifier_email: string;
  adressess: any[];
}

export type PrepareBoughtFieldsType = {
  productType: 'roadmap' | 'mentoring';
  productId: string | string[];
  order: ISingleOrder;
  contact: IContact;
};

export type HandleBoughtType = {
  productType: Exclude<GetProductType, 'unknown'>;
  order: ISingleOrder;
  contact: IContact;
  productID: number;
};

// TODO deal type

export type DealType = {
  id: string;
};
