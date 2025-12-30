// src/app/features/thank-you/thank-you.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div class="mb-6">
          <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span class="text-6xl">🎉</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Grazie per il tuo ordine!
          </h1>
          <p class="text-lg md:text-xl text-gray-600 mb-2">
            Il tuo pre-order è stato confermato con successo
          </p>
        </div>

        <div *ngIf="lastOrder" class="bg-gray-50 rounded-xl p-6 mb-6">
          <p class="text-sm text-gray-500 mb-2">CODICE ORDINE</p>
          <p class="text-2xl md:text-3xl font-bold font-mono text-gray-900 mb-4">
            {{ lastOrder.uniqueCode }}
          </p>
          <div class="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <p class="text-sm font-semibold text-green-800 mb-1">IMPORTO PAGATO</p>
            <p class="text-3xl font-bold text-green-600">
              €{{ lastOrder.total.toFixed(2) }}
            </p>
          </div>
        </div>

        <div class="space-y-4 text-left mb-8">
          <div class="flex items-start gap-3">
            <span class="text-2xl">📧</span>
            <div>
              <p class="font-semibold text-gray-900">Conferma via email</p>
              <p class="text-sm text-gray-600">
                Riceverai una email di conferma con tutti i dettagli dell'ordine
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="text-2xl">📱</span>
            <div>
              <p class="font-semibold text-gray-900">Ti contatteremo</p>
              <p class="text-sm text-gray-600">
                Verrai contattato quando la tua felpa sarà pronta per il ritiro
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="text-2xl">⏱️</span>
            <div>
              <p class="font-semibold text-gray-900">Tempi di consegna</p>
              <p class="text-sm text-gray-600">
                Il tuo ordine sarà pronto entro 3 settimane
              </p>
            </div>
          </div>
        </div>

        <div class="border-t pt-6">
          <p class="text-sm text-gray-500 mb-4">
            Hai domande? Contattaci via email o sui social
          </p>
          <button (click)="goHome()"
                  class="w-full md:w-auto px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition">
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  `
})
export class ThankYouComponent implements OnInit {
  lastOrder: any = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.lastOrder = this.orderService.getLastOrder();
  }

  goHome(): void {
    window.location.href = '/';
  }
}
