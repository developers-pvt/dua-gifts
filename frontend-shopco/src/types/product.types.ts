export type Discount = {
  amount: number;
  percentage: number;
};

export type Product = {
  id: number | string;
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  currency?: string;
  discount: Discount;
  rating: number;
  category?: string;
  description?: string;
  variants?: any[];
};
