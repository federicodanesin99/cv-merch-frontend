#!/bin/bash

# Fix property initialization per tutti i componenti
# Esegui dalla root: bash fix-components-init.sh

set -e

echo "🔧 Fix inizializzazione proprietà componenti..."
echo "=============================================="
echo ""

# FIX: app.component.ts - Sposta inizializzazione proprietà nel constructor
echo "1️⃣ Fix app.component.ts..."
cat > src/app/app.component.ts << 'EOF'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountdownComponent } from './shared/components/countdown/countdown.component';
import { ProductCardComponent } from './features/products/product-card/product-card.component';
import { CartSummaryComponent } from './features/cart/cart-summary/cart-summary.component';
import { CheckoutModalComponent } from './features/checkout/checkout-modal/checkout-modal.component';
import { ProductService } from './core/services/product.service';
import { CartService } from './core/services/cart.service';
import { Product } from './core/models/product.model';
import { CartItem } from './core/models/cart-item.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CountdownComponent,
    ProductCardComponent,
    CartSummaryComponent,
    CheckoutModalComponent
  ],
  template: `
    <app-countdown></app-countdown>

    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <div class="flex items-center space-x-2 md:space-x-3">
          <img src="assets/images/logo.png" alt="Logo" class="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover" />
          <div>
            <h1 class="text-base md:text-xl font-bold">CLASSE VENETA</h1>
            <p class="text-xs text-gray-500 hidden md:block">Merchandise Store</p>
          </div>
        </div>
        <button (click)="toggleCart()"
                class="relative cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z">
            </path>
          </svg>
          <span *ngIf="cartItemCount > 0" 
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {{ cartItemCount }}
          </span>
        </button>
      </div>
    </header>

    <section class="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-8 md:py-16">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <h2 class="text-2xl md:text-5xl font-bold mb-2 md:mb-4">Pre-Order Esclusivo</h2>
        <p class="text-lg md:text-xl mb-1 md:mb-2">
          Prezzi di lancio fino a <span class="text-yellow-400 font-bold">-20%</span>
        </p>
        <p class="text md:text mb-1 md:mb-2">
          Disponibili per 1 settimana
        </p>
        <p class="text-sm md:text-base text-gray-300">Ordina ora, ricevi entro 3 settimane</p>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 py-6 md:py-12">
      <div *ngIf="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
        <p class="text-gray-600 font-semibold mb-2">Caricamento prodotti...</p>
        <p class="text-sm text-gray-400" *ngIf="loadAttempts > 1">
          Tentativo {{ loadAttempts }}/3
        </p>
      </div>

      <div *ngIf="loadError && !isLoading" class="col-span-full text-center py-12 bg-white rounded-lg shadow-lg p-8">
        <div class="text-6xl mb-4">😕</div>
        <p class="text-red-600 font-bold text-xl mb-2">Impossibile caricare i prodotti</p>
        <button (click)="reloadProducts()" 
                class="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold">
          🔄 Ricarica la pagina
        </button>
      </div>

      <div *ngIf="!isLoading && !loadError" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <app-product-card *ngFor="let product of products$ | async"
                          [product]="product"
                          (addToCart)="onAddToCart($event)"
                          (imageClick)="onImageClick($event)"
                          (showSizeGuide)="onShowSizeGuide($event)">
        </app-product-card>
      </div>
    </section>

    <app-cart-summary (checkout)="openCheckout()"></app-cart-summary>

    <app-checkout-modal [isOpen]="isCheckoutOpen"
                        [promoCodesVisible]="promoCodesVisible"
                        (close)="closeCheckout()"
                        (orderSuccess)="onOrderSuccess($event)">
    </app-checkout-modal>

    <div *ngIf="isSizeGuideOpen" 
         (click)="closeSizeGuide()"
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Guida alle Taglie</h3>
          <button (click)="closeSizeGuide()" 
                  class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        <div class="text-sm text-gray-700" [innerHTML]="sizeGuideContent"></div>
      </div>
    </div>

    <div *ngIf="isZoomOpen" 
         (click)="closeImageZoom()"
         class="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center p-5">
      <button (click)="closeImageZoom()" 
              class="absolute top-5 right-5 bg-white text-black w-10 h-10 rounded-full text-xl font-bold">
        ✕
      </button>
      <img [src]="zoomedImage" alt="Zoom" class="max-w-full max-h-[90vh] object-contain">
    </div>

    <div *ngIf="isUniqueCodeModalOpen" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6 text-center">
        <div class="mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">✅</span>
          </div>
          <h3 class="text-xl md:text-2xl font-bold mb-2">Ordine Confermato!</h3>
          <p class="text-sm text-gray-600 mb-4">
            Ecco il tuo codice ordine univoco:
          </p>
        </div>

        <div class="bg-gray-100 rounded-lg p-4 mb-4">
          <p class="text-xs text-gray-500 mb-2">CODICE ORDINE</p>
          <p class="text-2xl md:text-3xl font-bold font-mono tracking-wider mb-3">
            {{ uniqueCode }}
          </p>
          <button (click)="copyUniqueCode()"
                  class="w-full bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2">
            <span>{{ copyIcon }}</span>
            <span>{{ copyText }}</span>
          </button>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
          <p class="text-xs font-semibold text-yellow-800 mb-1">⚠️ IMPORTANTE</p>
          <p class="text-xs text-yellow-700">
            Incolla questo codice nella <strong>causale/descrizione</strong> del pagamento PayPal o Revolut!
          </p>
        </div>

        <div class="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
          <p class="text-xs font-semibold text-green-800 mb-2">💶 IMPORTO DA PAGARE</p>
          <p class="text-4xl md:text-5xl font-bold text-green-600 mb-2">
            €{{ orderTotal.toFixed(2) }}
          </p>
          <p class="text-xs text-green-700 font-medium">
            Inserisci <strong>esattamente</strong> questo importo nel pagamento
          </p>
        </div>

        <button (click)="proceedToPayment()"
                class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition">
          Vai al Pagamento →
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding-bottom: 80px;
    }
  `]
})
export class AppComponent implements OnInit {
  products$!: Observable<Product[]>;
  isLoading$!: Observable<boolean>;
  loadAttempts$!: Observable<number>;
  
  isLoading = false;
  loadAttempts = 0;
  loadError = false;
  
  isCheckoutOpen = false;
  isSizeGuideOpen = false;
  isZoomOpen = false;
  isUniqueCodeModalOpen = false;
  
  sizeGuideContent = '';
  zoomedImage = '';
  uniqueCode = '';
  orderTotal = 0;
  paymentUrl = '';
  promoCodesVisible = true;
  
  copyIcon = '📋';
  copyText = 'Copia Codice';
  cartItemCount = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {
    // Inizializza gli observables nel constructor
    this.products$ = this.productService.products$;
    this.isLoading$ = this.productService.loading$;
    this.loadAttempts$ = this.productService.loadAttempts$;
  }

  async ngOnInit(): Promise<void> {
    this.isLoading$.subscribe(loading => this.isLoading = loading);
    this.loadAttempts$.subscribe(attempts => this.loadAttempts = attempts);
    
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });

    this.productService.promoCodesVisible$.subscribe(visible => {
      this.promoCodesVisible = visible;
    });

    this.productService.bundleDiscount$.subscribe(discount => {
      this.cartService.setBundleDiscount(discount);
    });

    await this.productService.prewarmBackend();
    this.productService.loadProducts();
  }

  reloadProducts(): void {
    window.location.reload();
  }

  onAddToCart(event: { product: Product; color: string; size: string; quantity: number }): void {
    const cartItem: CartItem = {
      product: event.product,
      color: event.color,
      size: event.size,
      quantity: event.quantity
    };
    this.cartService.addToCart(cartItem);
  }

  toggleCart(): void {
    if (this.cartItemCount > 0) {
      this.openCheckout();
    }
  }

  openCheckout(): void {
    this.isCheckoutOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeCheckout(): void {
    this.isCheckoutOpen = false;
    document.body.style.overflow = 'auto';
  }

  onShowSizeGuide(guide: string): void {
    this.sizeGuideContent = guide.replace(/\n/g, '<br>');
    this.isSizeGuideOpen = true;
  }

  closeSizeGuide(): void {
    this.isSizeGuideOpen = false;
  }

  onImageClick(url: string): void {
    this.zoomedImage = url;
    this.isZoomOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeImageZoom(): void {
    this.isZoomOpen = false;
    document.body.style.overflow = 'auto';
  }

  onOrderSuccess(response: { uniqueCode: string; total: number; paymentUrl: string }): void {
    this.uniqueCode = response.uniqueCode;
    this.orderTotal = response.total;
    this.paymentUrl = response.paymentUrl;
    
    this.closeCheckout();
    this.isUniqueCodeModalOpen = true;
  }

  copyUniqueCode(): void {
    navigator.clipboard.writeText(this.uniqueCode).then(() => {
      this.copyIcon = '✅';
      this.copyText = 'Copiato!';
      
      setTimeout(() => {
        this.copyIcon = '📋';
        this.copyText = 'Copia Codice';
      }, 2000);
    }).catch(() => {
      alert('Errore nella copia. Seleziona e copia manualmente.');
    });
  }

  proceedToPayment(): void {
    this.cartService.clearCart();
    window.open(this.paymentUrl, '_blank');
    window.location.href = '/grazie';
  }
}
EOF

# FIX: cart-summary.component.ts
echo "2️⃣ Fix cart-summary.component.ts..."
cat > src/app/features/cart/cart-summary/cart-summary.component.ts << 'EOF'
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
EOF

echo ""
echo "✅ Tutti i componenti corretti!"
echo ""
echo "🚀 Ora esegui: ng serve"
