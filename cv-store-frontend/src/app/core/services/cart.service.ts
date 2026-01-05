import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  
  private appliedPromoSubject = new BehaviorSubject<any>(null);
  public appliedPromo$ = this.appliedPromoSubject.asObservable();
  
  private bundleDiscountPercent = 5;

  constructor(private authService: AuthService) {
    // Carica carrello al login
    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadCartFromStorage(user.uid);
      } else {
        // Logout: svuota carrello
        this.cartItemsSubject.next([]);
        this.appliedPromoSubject.next(null);
      }
    });
  }

  addToCart(item: CartItem): void {
    const currentItems = this.cartItemsSubject.value;
    currentItems.push(item);
    this.cartItemsSubject.next(currentItems);
    this.saveCartToStorage();
  }

  removeFromCart(index: number): void {
    const currentItems = this.cartItemsSubject.value;
    currentItems.splice(index, 1);
    this.cartItemsSubject.next(currentItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.appliedPromoSubject.next(null);
    this.saveCartToStorage();
  }

  getItemCount(): number {
    return this.cartItemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  setBundleDiscount(percent: number): void {
    this.bundleDiscountPercent = percent;
  }

  getTotals() {
  const items = this.cartItemsSubject.value;
  let subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Bundle discount
  const sizeCounts: { [key: string]: number } = {};
  items.forEach(item => {
    sizeCounts[item.size] = (sizeCounts[item.size] || 0) + item.quantity;
  });
  const hasBundle = Object.values(sizeCounts).some(count => count >= 2);
  const bundleDiscount = hasBundle ? subtotal * (this.bundleDiscountPercent / 100) : 0;
  
  // Promo discount
  const promo = this.appliedPromoSubject.value;
  const promoDiscount = promo ? promo.discount : 0;
  
  const total = subtotal - bundleDiscount - promoDiscount;

  return {
    subtotal,
    bundleDiscount,
    promoDiscount,
    hasBundleDiscount: hasBundle,  // ⭐ AGGIUNGI QUESTA RIGA
    total: Math.max(0, total)
  };
}

  applyPromo(promo: any): void {
    this.appliedPromoSubject.next(promo);
  }

  clearPromo(): void {
    this.appliedPromoSubject.next(null);
  }

  // Persistenza localStorage
  private saveCartToStorage(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      const key = `cart_${userId}`;
      localStorage.setItem(key, JSON.stringify(this.cartItemsSubject.value));
    }
  }

  private loadCartFromStorage(userId: string): void {
    const key = `cart_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const items = JSON.parse(stored);
        this.cartItemsSubject.next(items);
        console.log('✅ Carrello ripristinato:', items.length, 'items');
      } catch (e) {
        console.error('❌ Errore caricamento carrello:', e);
      }
    }
  }
}