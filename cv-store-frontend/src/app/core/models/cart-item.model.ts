import { Product } from './product.model';

export interface CartItem {
  product: Product;
  color: string;
  size: string;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  bundleDiscount: number;
  promoDiscount: number;
  total: number;
  hasBundleDiscount: boolean;
}
