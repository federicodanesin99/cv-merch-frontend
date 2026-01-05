import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Observable } from 'rxjs';
import { CartItem } from '../../core/models/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="max-w-6xl mx-auto px-4 py-6 md:py-12">
      <h2 class="text-3xl font-bold mb-8">Il tuo Carrello</h2>
      
      <!-- Carrello vuoto -->
      <div *ngIf="(cartItems$ | async)?.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🛒</div>
        <p class="text-gray-600 text-lg mb-6">Il tuo carrello è vuoto</p>
        <a routerLink="/products" 
           class="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Scopri i Prodotti →
        </a>
      </div>

      <!-- Lista prodotti -->
      <div *ngIf="(cartItems$ | async)?.length ?? 0 > 0" class="space-y-4">
        <div *ngFor="let item of cartItems$ | async; let i = index"
             class="bg-white border rounded-lg p-4 md:p-6 shadow-sm">
          <div class="flex gap-4">
            <!-- Immagine prodotto -->
            <img [src]="item.product.images[0]" 
                 [alt]="item.product.name"
                 class="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg">
            
            <!-- Dettagli -->
            <div class="flex-1">
              <h3 class="font-bold text-lg mb-2">{{ item.product.name }}</h3>
              <p class="text-sm text-gray-600 mb-1">Colore: {{ item.color }}</p>
              <p class="text-sm text-gray-600 mb-1">Taglia: {{ item.size }}</p>
              <p class="text-sm text-gray-600 mb-3">Quantità: {{ item.quantity }}</p>
              
              <div class="flex items-center justify-between">
                <span class="text-xl font-bold">
                  €{{ (item.product.price * item.quantity).toFixed(2) }}
                </span>
                <button (click)="removeItem(i)"
                        class="text-red-600 hover:text-red-800 text-sm font-semibold">
                  🗑️ Rimuovi
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Riepilogo -->
        <div class="bg-gray-50 rounded-lg p-6 mt-8">
          <h3 class="font-bold text-xl mb-4">Riepilogo Ordine</h3>
          
          <div class="space-y-2 mb-4">
            <div class="flex justify-between">
              <span>Subtotale</span>
              <span>€{{ totals.subtotal.toFixed(2) }}</span>
            </div>
            
            <div *ngIf="totals.bundleDiscount > 0" 
                 class="flex justify-between text-green-600">
              <span>Sconto Bundle ({{ bundleDiscountPercent }}%)</span>
              <span>-€{{ totals.bundleDiscount.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="flex justify-between text-2xl font-bold pt-4 border-t mb-6">
            <span>Totale</span>
            <span>€{{ totals.total.toFixed(2) }}</span>
          </div>

          <!-- Bottoni azione -->
          <div class="space-y-3">
            <button (click)="goToCheckout()"
                    class="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition">
              Procedi al Checkout →
            </button>
            <a routerLink="/products"
               class="block text-center w-full py-4 border-2 border-gray-300 rounded-lg font-semibold hover:border-black transition">
              ← Continua gli Acquisti
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private router = inject(Router);

  cartItems$!: Observable<CartItem[]>;
  bundleDiscountPercent = 5;

  ngOnInit(): void {
    this.cartItems$ = this.cartService.cartItems$;
    
    this.productService.bundleDiscount$.subscribe(discount => {
      this.bundleDiscountPercent = discount;
    });
  }

  get totals() {
    return this.cartService.getTotals();
  }

  removeItem(index: number): void {
    if (confirm('Rimuovere questo articolo dal carrello?')) {
      this.cartService.removeFromCart(index);
    }
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
