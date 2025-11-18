export type Option = {
  _id: string;                    // required for /cart/items
  name: string;
  price: number;
  vipPrice:number;
  isDefault?: boolean;
  quantity?: number;
  img?: string;
  sale?: { start?: string; end?: string; price?: number | null };
};

export type Category = { _id: string; name: string };

export type Product = {
  _id: string;
  name: string;                   // plain string
  img?: string;
  desc?: string;                  // plain string
  category?: Category | string;
  options: Option[];
};
