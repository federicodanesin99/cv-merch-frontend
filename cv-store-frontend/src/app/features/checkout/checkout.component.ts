import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService, PromoService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { UniqueCodeModalComponent } from '../../shared/components/unique-code-modal/unique-code-modal.component';
import { Observable } from 'rxjs';
import { CartItem } from '../../core/models/cart-item.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, UniqueCodeModalComponent],
  template: `
    <section class="max-w-2xl mx-auto px-4 py-6 md:py-12 pb-32">
      <h2 class="text-2xl md:text-3xl font-bold mb-6">Completa l'ordine</h2>

      <!-- Order Summary -->
      <div class="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
        <h3 class="font-semibold mb-4">Il tuo ordine</h3>
        <div class="space-y-2 mb-4">
          <div *ngFor="let item of cartItems$ | async; let i = index"
               class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
            <span class="flex-1">{{ item.quantity }}x {{ item.product.name }} - {{ item.color }} ({{ item.size }})</span>
            <span class="font-medium mr-2">€{{ (item.product.price * item.quantity).toFixed(2) }}</span>
            <button (click)="removeItem(i)" 
                    class="text-red-600 hover:text-red-800 font-bold">✕</button>
          </div>
        </div>

        <!-- Promo Code -->
        <div *ngIf="promoCodesVisible" class="mb-4">
          <label class="block text-sm font-medium mb-2">Hai un codice promozionale?</label>
          <div class="flex gap-2">
            <input 
              type="text" 
              [(ngModel)]="promoCode"
              placeholder="CODICE SCONTO"
              class="flex-1 px-3 py-2 border rounded-lg text-sm uppercase"
              maxlength="20"
            >
            <button 
              (click)="applyPromoCode()" 
              [disabled]="isValidatingPromo"
              class="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-black transition disabled:opacity-50">
              {{ isValidatingPromo ? '...' : 'Applica' }}
            </button>
          </div>
          <p *ngIf="promoMessage" 
             [class]="promoMessageClass"
             class="text-xs mt-1">
            {{ promoMessage }}
          </p>
        </div>

        <!-- Totals -->
        <div class="border-t pt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Subtotale</span>
            <span>€{{ totals.subtotal.toFixed(2) }}</span>
          </div>
          
          <div *ngIf="totals.bundleDiscount > 0" 
               class="flex justify-between text-green-600">
            <span>Sconto Bundle ({{ bundleDiscountPercent }}%)</span>
            <span>-€{{ totals.bundleDiscount.toFixed(2) }}</span>
          </div>
          
          <div *ngIf="totals.promoDiscount > 0 && appliedPromo" 
               class="flex justify-between text-green-600">
            <span>Codice {{ appliedPromo.code }}</span>
            <span>-€{{ totals.promoDiscount.toFixed(2) }}</span>
          </div>
          
          <div class="flex justify-between text-xl font-bold pt-2 border-t">
            <span>Totale</span>
            <span>€{{ totals.total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
        <h3 class="font-semibold mb-4">I tuoi dati</h3>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              [(ngModel)]="customerFirstName"
              required 
              placeholder="Nome *" 
              class="px-3 py-2 border rounded-lg text-sm">
            <input 
              type="text" 
              [(ngModel)]="customerLastName"
              required 
              placeholder="Cognome *" 
              class="px-3 py-2 border rounded-lg text-sm">
          </div>
          <input 
            type="email" 
            [(ngModel)]="customerEmail"
            required 
            placeholder="Email *" 
            class="w-full px-3 py-2 border rounded-lg text-sm">
          <div>
            <input 
              type="tel" 
              [(ngModel)]="customerPhone"
              required 
              placeholder="Telefono *" 
              class="w-full px-3 py-2 border rounded-lg text-sm">
            <p class="text-xs text-gray-500 mt-1">📞 Ti contatteremo quando il prodotto sarà pronto!</p>
          </div>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
        <h3 class="font-semibold mb-4">Metodo di pagamento</h3>
        <div class="grid grid-cols-2 gap-3">
          <label class="border-2 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition"
                 [class.border-blue-500]="paymentMethod === 'paypal'">
            <input 
              type="radio" 
              [(ngModel)]="paymentMethod"
              name="payment" 
              value="paypal" 
              class="mr-2">
            <span class="font-semibold text-sm">PayPal</span>
          </label>
          <label class="border-2 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition"
                 [class.border-blue-500]="paymentMethod === 'revolut'">
            <input 
              type="radio" 
              [(ngModel)]="paymentMethod"
              name="payment" 
              value="revolut" 
              class="mr-2">
            <span class="font-semibold text-sm">Revolut</span>
          </label>
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        (click)="handleCheckout()"
        [disabled]="isSubmitting"
        [class.opacity-50]="isSubmitting"
        [class.cursor-not-allowed]="isSubmitting"
        class="w-full bg-black text-white py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition">
        {{ isSubmitting ? 'Invio in corso...' : 'Conferma e vai al pagamento' }}
      </button>
    </section>

    <!-- Unique Code Modal -->
    <app-unique-code-modal
      [isOpen]="isUniqueCodeModalOpen"
      [uniqueCode]="uniqueCode"
      [total]="orderTotal"
      [paymentUrl]="paymentUrl"
      (close)="closeUniqueCodeModal()">
    </app-unique-code-modal>
  `,
  styles: []
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private promoService = inject(PromoService);
  private productService = inject(ProductService);
  private router = inject(Router);

  cartItems$!: Observable<CartItem[]>;
  appliedPromo$!: Observable<any>;
  
  // Customer info
  customerFirstName = '';
  customerLastName = '';
  customerEmail = '';
  customerPhone = '';
  paymentMethod: 'paypal' | 'revolut' = 'paypal';
  
  // Promo
  promoCode = '';
  promoMessage = '';
  promoMessageClass = '';
  appliedPromo: any = null;
  promoCodesVisible = true;
  bundleDiscountPercent = 5;
  isValidatingPromo = false;
  
  // Modal state
  isUniqueCodeModalOpen = false;
  uniqueCode = '';
  orderTotal = 0;
  paymentUrl = '';
  
  // Submit state
  isSubmitting = false;

  ngOnInit(): void {
    this.cartItems$ = this.cartService.cartItems$;
    this.appliedPromo$ = this.cartService.appliedPromo$;
    
    this.appliedPromo$.subscribe(promo => {
      this.appliedPromo = promo;
    });

    this.productService.promoCodesVisible$.subscribe(visible => {
      this.promoCodesVisible = visible;
    });

    this.productService.bundleDiscount$.subscribe(discount => {
      this.bundleDiscountPercent = discount;
    });

    // Redirect se carrello vuoto
    this.cartItems$.subscribe(items => {
      if (items.length === 0) {
        this.router.navigate(['/products']);
      }
    });
  }

  get totals() {
    return this.cartService.getTotals();
  }

  removeItem(index: number): void {
    if (confirm('Rimuovere questo articolo?')) {
      this.cartService.removeFromCart(index);
      this.appliedPromo = null;
      this.promoCode = '';
      this.promoMessage = '';
    }
  }

  applyPromoCode(): void {
    const code = this.promoCode.trim().toUpperCase();
    
    if (!code) {
      this.promoMessage = 'Inserisci un codice';
      this.promoMessageClass = 'text-red-600';
      return;
    }

    if (!this.customerEmail) {
      this.promoMessage = 'Inserisci prima la tua email';
      this.promoMessageClass = 'text-red-600';
      return;
    }

    this.isValidatingPromo = true;
    const totals = this.cartService.getTotals();
    const afterBundle = totals.subtotal - totals.bundleDiscount;

    this.promoService.validatePromoCode(code, this.customerEmail, afterBundle)
      .subscribe({
        next: (result) => {
          this.isValidatingPromo = false;
          
          if (result.valid) {
            this.appliedPromo = result;
            this.cartService.applyPromo(result);
            this.promoMessage = result.message || 'Codice applicato!';
            this.promoMessageClass = 'text-green-600';
          } else {
            this.promoMessage = result.message || 'Codice non valido';
            this.promoMessageClass = 'text-red-600';
            this.appliedPromo = null;
            this.cartService.clearPromo();
          }
        },
        error: (error) => {
          this.isValidatingPromo = false;
          this.promoMessage = 'Errore nella validazione';
          this.promoMessageClass = 'text-red-600';
          console.error('Promo validation error:', error);
        }
      });
  }

  handleCheckout(): void {
    if (this.isSubmitting) return;

    // Validazione
    if (!this.customerFirstName || !this.customerLastName || !this.customerEmail || !this.customerPhone) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    this.isSubmitting = true;

    const fullName = `${this.customerFirstName} ${this.customerLastName}`;
    
    // Get cart items synchronously
    let items: CartItem[] = [];
    this.cartItems$.subscribe(cartItems => items = cartItems).unsubscribe();

    const orderData: any = {
        customerEmail: this.customerEmail,
        customerName: fullName,
        customerPhone: this.customerPhone,
        paymentMethod: this.paymentMethod, // Ora è tipizzato correttamente
        promoCode: this.appliedPromo ? this.appliedPromo.code : null,
        items: items.map(item => ({
            productId: item.product.id,
            color: item.color,
            size: item.size,
            quantity: item.quantity
        }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        // Salva ordine in sessionStorage
        this.orderService.saveLastOrder(response);
        
        // Mostra modal con codice univoco
        this.uniqueCode = response.uniqueCode;
        this.orderTotal = response.total;
        this.paymentUrl = response.paymentUrl;
        this.isUniqueCodeModalOpen = true;
      },
      error: (error) => {
        this.isSubmitting = false;
        alert(error.error?.error || 'Errore durante la creazione dell\'ordine. Riprova.');
        console.error('Order creation error:', error);
      }
    });
  }

  closeUniqueCodeModal(): void {
    this.isUniqueCodeModalOpen = false;
  }
}
