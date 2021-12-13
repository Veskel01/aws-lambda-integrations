export const enum RoadmapsModuleProviders {
  MAIN_SERVICE = 'roadmaps_main_service',
}

export type PurcharsedRoadmapsType = {
  first_name: string;
  last_name: string;
  email: string;
  monthsDiff: number;
  currency: string;
  currency_symbol: string;
  boughtDate: string;
  products: Array<{
    name: string;
    total: number;
    quantity: number;
    product_id: number;
  }>;
};
