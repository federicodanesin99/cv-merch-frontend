import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative overflow-hidden" [style.minHeight]="minHeight">
      <!-- Video Background -->
      <video 
        *ngIf="videoUrl"
        autoplay 
        loop 
        muted 
        playsinline
        class="absolute inset-0 w-full h-full object-cover">
        <source [src]="videoUrl" type="video/mp4">
        Il tuo browser non supporta i video HTML5.
      </video>

      <!-- Overlay scuro (opzionale) -->
      <div 
        *ngIf="videoUrl"
        class="absolute inset-0 bg-black"
        [style.opacity]="overlayOpacity">
      </div>

      <!-- Contenuto -->
      <div class="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-16 text-center" [class]="textColorClass">
        <h2 class="text-2xl md:text-5xl font-bold mb-2 md:mb-4">
          {{ title }}
        </h2>
        <p class="text-lg md:text-xl mb-1 md:mb-2">
          {{ subtitle }}
          <span *ngIf="discount" class="text-yellow-400 font-bold">{{ discount }}</span>
        </p>
        <p *ngIf="duration" class="text md:text mb-1 md:mb-2">
          {{ duration }}
        </p>
        <p *ngIf="description" class="text-sm md:text-base opacity-90">
          {{ description }}
        </p>
      </div>
    </section>
  `,
  styles: []
})
export class HeroComponent {
  @Input() title = 'Pre-Order Esclusivo';
  @Input() subtitle = 'Prezzi di lancio fino a';
  @Input() discount = '-20%';
  @Input() duration = 'Disponibili per 1 settimana';
  @Input() description = 'Ordina ora, ricevi entro 3 settimane';
  @Input() backgroundClass = 'bg-gradient-to-r from-gray-900 to-gray-700';
  @Input() textColorClass = 'text-white';
  
  // Video settings
  @Input() videoUrl = '';
  @Input() overlayOpacity = '0.5'; // 0 = trasparente, 1 = nero completo
  @Input() minHeight = '400px';
}