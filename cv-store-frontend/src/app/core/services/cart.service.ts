import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, CartTotals } from '../models/cart-item.model';
import { PromoCodeValidation } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private appliedPromoSubject = new BehaviorSubject<PromoCodeValidation | null>(null);
  private bundleDiscountPercentage = 5;

  cartItems$ = this.cartItemsSubject.asObservable();
  appliedPromo$ = this.appliedPromoSubject.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('cv_cart');
    if (savedCart) {
      try {
        this.cartItemsSubject.next(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart');
      }
    }
  }

  setBundleDiscount(percentage: number): void {
    this.bundleDiscountPercentage = percentage;
  }

  addToCart(item: CartItem): void {
    const currentCart = this.cartItemsSubject.value;
    const existingIndex = currentCart.findIndex(
      i => i.product.id === item.product.id && 
           i.color === item.color && 
           i.size === item.size
    );

    if (existingIndex >= 0) {
      currentCart[existingIndex].quantity += item.quantity;
    } else {
      currentCart.push(item);
    }

    this.updateCart(currentCart);
  }

  removeFromCart(index: number): void {
    const currentCart = this.cartItemsSubject.value;
    currentCart.splice(index, 1);
    this.appliedPromoSubject.next(null);
    this.updateCart(currentCart);
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.appliedPromoSubject.next(null);
    localStorage.removeItem('cv_cart');
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  private updateCart(cart: CartItem[]): void {
    this.cartItemsSubject.next(cart);
    localStorage.setItem('cv_cart', JSON.stringify(cart));
  }

  getTotals(): CartTotals {
    const cart = this.cartItemsSubject.value;
    const appliedPromo = this.appliedPromoSubject.value;

    const subtotal = cart.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    const sizeCounts: { [size: string]: number } = {};
    cart.forEach(item => {
      sizeCounts[item.size] = (sizeCounts[item.size] || 0) + item.quantity;
    });
    
    const hasBundleDiscount = Object.values(sizeCounts).some(count => count >= 2);
    const bundleDiscount = hasBundleDiscount 
      ? subtotal * (this.bundleDiscountPercentage / 100) 
      : 0;

    const afterBundle = subtotal - bundleDiscount;
    const promoDiscount = appliedPromo ? appliedPromo.discount : 0;
    const total = afterBundle - promoDiscount;

    return {
      subtotal,
      bundleDiscount,
      promoDiscount,
      total,
      hasBundleDiscount
    };
  }

  getItemCount(): number {
    return this.cartItemsSubject.value.reduce(
      (sum, item) => sum + item.quantity, 0
    );
  }

  applyPromo(promo: PromoCodeValidation): void {
    this.appliedPromoSubject.next(promo);
  }

  clearPromo(): void {
    this.appliedPromoSubject.next(null);
  }
}
