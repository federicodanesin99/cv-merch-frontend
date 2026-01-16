export interface OrderRequest {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'paypal' | 'revolut';
  promoCode: string | null;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

export interface OrderResponse {
  uniqueCode: string;
  total: number;
  paymentUrl: string;
}

export interface PromoCodeValidation {
  valid: boolean;
  code: string;
  discount: number;
  message: string;
  codes?: string[];
  overallDiscount?: number;
}
