import { GetProductType } from '../Helpers/GetProductType';

export interface IPaymentDto {
  action: string;
  arg: number;
}

export type Product = {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: string[];
  meta_data: string[];
  sku: string;
  price: number;
  parent_name: string | null;
};

export interface ISingleOrder {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  created_via: string;
  version: string;
  currency: string;
  status: string;
  date_created: string;
  date_modified_gmt: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  customer_note: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string;
  date_paid_gmt: string;
  date_completed: string;
  date_completed_gmt: string;
  cart_hash: string;
  meta_data: string[];
  line_items: Product[];
  tax_lines: any[];
  shipping_lines: [
    {
      id: number;
      method_title: string;
      method_id: string;
      instance_id: string;
      total: string;
      total_tax: string;
      taxes: string[];
      meta_data: string[];
    },
  ];
  coupon_lines: [
    {
      id: number;
      code: string;
      discount: string;
      discount_tax: string;
      meta_data: any[];
    },
  ];
  currency_symbol: string;
}
