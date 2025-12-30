import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { OrderService, PromoService } from '../../../core/services/order.service';
import { OrderRequest } from '../../../core/models/order.model';
import { CartItem, CartTotals } from '../../../core/models/cart-item.model';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div *ngIf="isOpen" 
         (click)="onBackdropClick($event)"
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
           (click)="$event.stopPropagation()">
        <div class="p-4 md:p-6">
          <div class="flex justify-between items-center mb-4 md:mb-6">
            <h3 class="text-xl md:text-2xl font-bold">Completa l'ordine</h3>
            <button (click)="close.emit()" 
                    class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>

          <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
            <div class="mb-4 md:mb-6">
              <h4 class="font-semibold mb-3 text-sm md:text-base">Il tuo ordine</h4>
              <div class="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
                <div *ngFor="let item of cartItems$ | async; let i = index"
                     class="flex justify-between items-center text-sm">
                  <span class="flex-1">
                    {{ item.quantity }}x {{ item.product.name }} - {{ item.color }} ({{ item.size }})
                  </span>
                  <span class="font-medium mr-2">
                    €{{ (item.product.price * item.quantity).toFixed(2) }}
                  </span>
                  <button type="button" 
                          (click)="removeItem(i)" 
                          class="text-red-600 hover:text-red-800 font-bold">✕</button>
                </div>
              </div>

              <div *ngIf="promoCodesVisible" class="mt-4">
                <label class="block text-sm font-medium mb-2">
                  Hai un codice promozionale?
                </label>
                <div class="flex gap-2">
                  <input type="text" 
                         [(ngModel)]="promoCodeInput"
                         [ngModelOptions]="{standalone: true}"
                         placeholder="CODICE SCONTO"
                         class="flex-1 px-3 py-2 border rounded-lg text-sm uppercase"
                         maxlength="20">
                  <button type="button"
                          (click)="applyPromo()" 
                          [disabled]="isApplyingPromo"
                          class="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-black transition">
                    {{ isApplyingPromo ? '...' : 'Applica' }}
                  </button>
                </div>
                <p *ngIf="promoMessage" 
                   [class]="'text-xs mt-1 ' + (promoError ? 'text-red-600' : 'text-green-600')">
                  {{ promoMessage }}
                </p>
              </div>

              <div class="mt-4 space-y-1 text-sm">
                <div class="flex justify-between">
                  <span>Subtotale</span>
                  <span>€{{ totals.subtotal.toFixed(2) }}</span>
                </div>
                
                <div *ngIf="totals.bundleDiscount > 0" 
                     class="flex justify-between text-green-600">
                  <span>Sconto Bundle {{ bundleDiscountPercent }}%</span>
                  <span>-€{{ totals.bundleDiscount.toFixed(2) }}</span>
                </div>
                
                <div *ngIf="totals.promoDiscount > 0 && appliedPromo" 
                     class="flex justify-between text-green-600">
                  <span>Codice {{ appliedPromo.code }}</span>
                  <span>-€{{ totals.promoDiscount.toFixed(2) }}</span>
                </div>
                
                <div class="flex justify-between text-base md:text-lg font-bold pt-2 border-t">
                  <span>Totale</span>
                  <span>€{{ totals.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="mb-4 md:mb-6 space-y-3">
              <h4 class="font-semibold text-sm md:text-base">I tuoi dati</h4>
              
              <div class="grid grid-cols-2 gap-3">
                <input type="text" 
                       formControlName="firstname"
                       placeholder="Nome *" 
                       class="px-3 py-2 border rounded-lg text-sm">
                
                <input type="text" 
                       formControlName="lastname"
                       placeholder="Cognome *" 
                       class="px-3 py-2 border rounded-lg text-sm">
              </div>
              
              <input type="email" 
                     formControlName="email"
                     placeholder="Email *" 
                     class="w-full px-3 py-2 border rounded-lg text-sm">
              
              <div>
                <input type="tel" 
                       formControlName="phone"
                       placeholder="Telefono *" 
                       class="w-full px-3 py-2 border rounded-lg text-sm">
                <p class="text-xs text-gray-500 mt-1">
                  📞 Ti contatteremo quando la tua felpa sarà pronta!
                </p>
              </div>
            </div>

            <div class="mb-4 md:mb-6">
              <h4 class="font-semibold mb-3 text-sm md:text-base">Metodo di pagamento</h4>
              <div class="grid grid-cols-2 gap-3 md:gap-4">
                <label class="border-2 border-gray-200 rounded-lg p-3 md:p-4 cursor-pointer hover:border-blue-500 transition">
                  <input type="radio" 
                         formControlName="payment"
                         value="paypal" 
                         class="mr-2">
                  <span class="font-semibold text-sm md:text-base">PayPal</span>
                </label>
                
                <label class="border-2 border-gray-200 rounded-lg p-3 md:p-4 cursor-pointer hover:border-blue-500 transition">
                  <input type="radio" 
                         formControlName="payment"
                         value="revolut" 
                         class="mr-2">
                  <span class="font-semibold text-sm md:text-base">Revolut</span>
                </label>
              </div>
            </div>

            <button type="submit"
                    [disabled]="isSubmitting || checkoutForm.invalid"
                    class="w-full py-3 md:py-4 rounded-lg font-semibold text-sm md:text-lg bg-black text-white hover:bg-gray-800 transition">
              {{ isSubmitting ? 'Invio in corso...' : 'Conferma e vai al pagamento' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CheckoutModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() promoCodesVisible = true;
  @Output() close = new EventEmitter<void>();
  @Output() orderSuccess = new EventEmitter<{ uniqueCode: string; total: number; paymentUrl: string }>();

  checkoutForm!: FormGroup;
  cartItems$!: Observable<CartItem[]>;
  appliedPromo$!: Observable<any>;
  
  promoCodeInput = '';
  promoMessage = '';
  promoError = false;
  isApplyingPromo = false;
  isSubmitting = false;
  bundleDiscountPercent = 5;
  appliedPromo: any = null;
  totals: CartTotals = { subtotal: 0, bundleDiscount: 0, promoDiscount: 0, total: 0, hasBundleDiscount: false };

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private promoService: PromoService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.appliedPromo$ = this.cartService.appliedPromo$;
    
    // Aggiorna totals quando cambia il carrello
    this.updateTotals();
    this.cartService.cartItems$.subscribe(() => {
      this.updateTotals();
    });
    this.cartService.appliedPromo$.subscribe(() => {
      this.updateTotals();
    });
  }

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      payment: ['paypal', Validators.required]
    });

    this.appliedPromo$.subscribe(promo => {
      this.appliedPromo = promo;
    });
  }

  private updateTotals(): void {
    this.totals = this.cartService.getTotals();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.close.emit();
    }
  }

  removeItem(index: number): void {
    if (confirm('Rimuovere questo articolo?')) {
      this.cartService.removeFromCart(index);
      if (this.cartService.getItemCount() === 0) {
        this.close.emit();
      }
    }
  }

  applyPromo(): void {
    const code = this.promoCodeInput.trim().toUpperCase();
    const email = this.checkoutForm.get('email')?.value;

    if (!code) {
      this.promoMessage = 'Inserisci un codice';
      this.promoError = true;
      return;
    }

    if (!email) {
      this.promoMessage = 'Inserisci prima la tua email';
      this.promoError = true;
      return;
    }

    const afterBundle = this.totals.subtotal - this.totals.bundleDiscount;
    
    this.isApplyingPromo = true;
    this.promoService.validatePromoCode(code, email, afterBundle).subscribe({
      next: (data) => {
        if (data.valid) {
          this.cartService.applyPromo(data);
          this.promoMessage = data.message;
          this.promoError = false;
        } else {
          this.promoMessage = 'Codice non valido';
          this.promoError = true;
          this.cartService.clearPromo();
        }
        this.isApplyingPromo = false;
      },
      error: () => {
        this.promoMessage = 'Errore nella validazione';
        this.promoError = true;
        this.isApplyingPromo = false;
      }
    });
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.isSubmitting) {
      return;
    }

    const formValue = this.checkoutForm.value;
    const fullName = `${formValue.firstname} ${formValue.lastname}`;
    const cartItems = this.cartService.getCartItems();
    
    const orderRequest: OrderRequest = {
      customerEmail: formValue.email,
      customerName: fullName,
      customerPhone: formValue.phone,
      paymentMethod: formValue.payment,
      promoCode: this.appliedPromo ? this.appliedPromo.code : null,
      items: cartItems.map((item: CartItem) => ({
        productId: item.product.id,
        color: item.color,
        size: item.size,
        quantity: item.quantity
      }))
    };

    this.isSubmitting = true;
    
    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.orderService.saveLastOrder(response);
        this.orderSuccess.emit(response);
        this.isSubmitting = false;
      },
      error: (err) => {
        alert('Errore durante la creazione dell\'ordine. Riprova.');
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }
}
