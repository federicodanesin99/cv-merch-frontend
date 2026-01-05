import { Component, Input, Output, EventEmitter, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-unique-code-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6 text-center">
        <!-- Success Icon -->
        <div class="mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">✅</span>
          </div>
          <h3 class="text-xl md:text-2xl font-bold mb-2">Ordine Confermato!</h3>
          <p class="text-sm text-gray-600 mb-4">
            Ecco il tuo codice ordine univoco:
          </p>
        </div>

        <!-- Unique Code Display -->
        <div class="bg-gray-100 rounded-lg p-4 mb-4">
          <p class="text-xs text-gray-500 mb-2">CODICE ORDINE</p>
          <p class="text-2xl md:text-3xl font-bold font-mono tracking-wider mb-3">
            {{ uniqueCode }}
          </p>
          <button (click)="copyCode()"
                  class="w-full bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2">
            <span>{{ copyIcon }}</span>
            <span>{{ copyText }}</span>
          </button>
        </div>

        <!-- Important Notice -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
          <p class="text-xs font-semibold text-yellow-800 mb-1">⚠️ IMPORTANTE</p>
          <p class="text-xs text-yellow-700">
            Incolla questo codice nella <strong>causale/descrizione</strong> del pagamento PayPal o Revolut!
          </p>
        </div>

        <!-- Total Amount -->
        <div class="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
          <p class="text-xs font-semibold text-green-800 mb-2">💶 IMPORTO DA PAGARE</p>
          <p class="text-4xl md:text-5xl font-bold text-green-600 mb-2">
            €{{ total.toFixed(2) }}
          </p>
          <p class="text-xs text-green-700 font-medium">
            Inserisci <strong>esattamente</strong> questo importo nel pagamento
          </p>
        </div>

        <!-- Payment Button -->
        <button (click)="proceedToPayment()"
                class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition">
          Vai al Pagamento →
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class UniqueCodeModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() uniqueCode = '';
  @Input() total = 0;
  @Input() paymentUrl = '';
  @Output() close = new EventEmitter<void>();

  private router = inject(Router);
  private cartService = inject(CartService);

  copyIcon = '📋';
  copyText = 'Copia Codice';

  ngOnChanges(): void {
    // Blocca scroll quando aperto
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  copyCode(): void {
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
    // Svuota il carrello
    this.cartService.clearCart();

    // Apri pagamento in nuova tab
    if (this.paymentUrl) {
      window.open(this.paymentUrl, '_blank');
    }

    // Redirect a pagina grazie
    this.router.navigate(['/grazie']);
  }
}
