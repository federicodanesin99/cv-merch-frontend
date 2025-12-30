import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { Observable } from 'rxjs';
import { CartItem } from '../../../core/models/cart-item.model';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="(cartItems$ | async)?.length ?? 0 > 0" 
         [class]="'cart-footer fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40 ' + (isMinimized ? 'minimized' : '')">
      <div class="max-w-6xl mx-auto px-4 py-3 md:py-4">
        <button (click)="toggleMinimize()"
                class="absolute -top-8 right-4 bg-black text-white px-3 py-1 rounded-t-lg text-xs font-semibold hover:bg-gray-800 transition">
          <span>{{ isMinimized ? '▲' : '▼' }}</span>
        </button>

        <div id="cart-content">
          <div class="flex flex-col gap-3">
            <div class="max-h-40 overflow-y-auto space-y-2">
              <div *ngFor="let item of cartItems$ | async; let i = index"
                   class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                <span class="flex-1">
                  {{ item.quantity }}x {{ item.product.name }} - {{ item.color }} ({{ item.size }})
                </span>
                <span class="font-medium mr-2">
                  €{{ (item.product.price * item.quantity).toFixed(2) }}
                </span>
                <button (click)="removeItem(i)" 
                        class="text-red-600 hover:text-red-800 font-bold">✕</button>
              </div>
            </div>

            <div class="border-t pt-3 space-y-1">
              <div class="flex justify-between text-sm">
                <span>Subtotale</span>
                <span>€{{ totals.subtotal.toFixed(2) }}</span>
              </div>
              
              <div *ngIf="totals.bundleDiscount > 0" 
                   class="flex justify-between text-sm text-green-600">
                <span>Sconto Bundle {{ bundleDiscountPercent }}%</span>
                <span>-€{{ totals.bundleDiscount.toFixed(2) }}</span>
              </div>
              
              <div *ngIf="totals.promoDiscount > 0 && appliedPromo" 
                   class="flex justify-between text-sm text-green-600">
                <span>Codice {{ appliedPromo.code }}</span>
                <span>-€{{ totals.promoDiscount.toFixed(2) }}</span>
              </div>
              
              <div class="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Totale</span>
                <span>€{{ totals.total.toFixed(2) }}</span>
              </div>
            </div>

            <button (click)="checkout.emit()"
                    class="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition w-full text-sm md:text-base">
              Procedi al Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-footer {
      transition: all 0.3s ease;
    }
    
    .cart-footer.minimized {
      transform: translateY(100%);
    }
  `]
})
export class CartSummaryComponent {
  @Output() checkout = new EventEmitter<void>();
  
  cartItems$!: Observable<CartItem[]>;
  appliedPromo$!: Observable<any>;
  
  isMinimized = false;
  bundleDiscountPercent = 5;
  appliedPromo: any = null;

  constructor(private cartService: CartService) {
    this.cartItems$ = this.cartService.cartItems$;
    this.appliedPromo$ = this.cartService.appliedPromo$;
    
    this.appliedPromo$.subscribe(promo => {
      this.appliedPromo = promo;
    });
  }

  get totals() {
    return this.cartService.getTotals();
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  removeItem(index: number): void {
    if (confirm('Rimuovere questo articolo dal carrello?')) {
      this.cartService.removeFromCart(index);
    }
  }
}
