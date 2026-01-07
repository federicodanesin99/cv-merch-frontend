import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, COLOR_MAP } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-card bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Coming Soon Badge -->
      <div *ngIf="product.isComingSoon" 
           class="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 z-10">
        <span class="text-sm font-bold">🚀 PROSSIMAMENTE</span>
      </div>

      <!-- Carousel -->
      <div class="carousel-container relative bg-gray-100" [class.mt-10]="product.isComingSoon">
        <div *ngIf="currentImages.length > 0" class="relative">
          <!-- Overlay blur per coming soon -->
          <div *ngIf="product.isComingSoon" 
               class="absolute inset-0 bg-white bg-opacity-40 backdrop-blur-sm z-5 flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-2">⏰</div>
              <p class="text-lg font-bold text-gray-800">In arrivo</p>
            </div>
          </div>

          <div class="image-carousel flex overflow-x-auto snap-x" #carousel>
            <img *ngFor="let url of currentImages"
                 [src]="url" 
                 [alt]="product.name"
                 (click)="!product.isComingSoon && onImageClick(url)"
                 [class.cursor-pointer]="!product.isComingSoon"
                 class="w-full h-64 md:h-80 object-cover flex-shrink-0 snap-center">
          </div>
          
          <button *ngIf="currentImages.length > 1 && !product.isComingSoon" 
                  (click)="scrollCarousel(-1)"
                  class="carousel-btn left">
            &#8249;
          </button>
          <button *ngIf="currentImages.length > 1 && !product.isComingSoon" 
                  (click)="scrollCarousel(1)"
                  class="carousel-btn right">
            &#8250;
          </button>
        </div>
        
        <div *ngIf="currentImages.length === 0" 
             class="bg-gray-200 h-64 md:h-80 flex items-center justify-center">
          <span class="text-gray-400 text-6xl">📦</span>
        </div>

        <!-- Color badge -->
        <div *ngIf="!product.isComingSoon" 
             class="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          {{ selectedColor }}
        </div>

        <!-- Discount badge -->
        <div *ngIf="showDiscount && !product.isComingSoon" 
             class="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
          -{{ discountAmount }}€
        </div>
      </div>

      <!-- Product details -->
      <div class="p-4 md:p-6">
        <h3 class="text-lg md:text-xl font-bold mb-1">{{ product.name }}</h3>
        <p *ngIf="product.description" class="text-sm text-gray-600 mb-3">
          {{ product.description }}
        </p>

        <!-- Price (nascosto se coming soon) -->
        <div *ngIf="!product.isComingSoon" class="flex items-center gap-3 mb-4">
          <p *ngIf="showDiscount" class="text-lg text-gray-400 line-through">
            €{{ product.basePrice?.toFixed(2) }}
          </p>
          <p [class]="showDiscount ? 'text-2xl md:text-3xl font-bold text-red-600' : 'text-2xl md:text-3xl font-bold text-gray-900'">
            €{{ product.price.toFixed(2) }}
          </p>
        </div>

        <!-- ========== COMING SOON SECTION ========== -->
        <div *ngIf="product.isComingSoon">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
            <p class="text-center text-sm text-purple-800 font-semibold mb-3">
              🔔 Vuoi essere avvisato quando sarà disponibile?
            </p>

            <!-- Se già registrato -->
            <div *ngIf="hasRegisteredInterest" 
                 class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p class="text-green-700 font-semibold text-sm mb-1">✅ Sei nella lista!</p>
              <p class="text-green-600 text-xs">Ti avviseremo via email</p>
            </div>

            <!-- Form registrazione interesse -->
            <div *ngIf="!hasRegisteredInterest && !showInterestForm" class="text-center">
              <button 
                (click)="openInterestForm()"
                class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition">
                🔔 Avvisami quando disponibile
              </button>
            </div>

            <!-- Form espanso -->
            <div *ngIf="showInterestForm && !hasRegisteredInterest" class="space-y-3">
              <!-- Preferenze -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">
                  Colore preferito (opzionale)
                </label>
                <select [(ngModel)]="interestData.preferredColor"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Nessuna preferenza</option>
                  <option *ngFor="let color of product.colors" [value]="color">
                    {{ color }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">
                  Taglia preferita (opzionale)
                </label>
                <select [(ngModel)]="interestData.preferredSize"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Nessuna preferenza</option>
                  <option *ngFor="let size of product.sizes" [value]="size">
                    {{ size }}
                  </option>
                </select>
              </div>

              <!-- Errori -->
              <div *ngIf="interestError" 
                   class="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                {{ interestError }}
              </div>

              <!-- Bottoni -->
              <div class="flex gap-2">
                <button 
                  (click)="cancelInterestForm()"
                  class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition text-sm">
                  Annulla
                </button>
                <button 
                  (click)="registerInterest()"
                  [disabled]="isRegisteringInterest"
                  class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition text-sm disabled:opacity-50">
                  <span *ngIf="!isRegisteringInterest">Conferma</span>
                  <span *ngIf="isRegisteringInterest" class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Invio...
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Info aggiuntive -->
          <div class="text-center text-xs text-gray-500 italic">
            📅 Data di disponibilità: Da definire
          </div>
        </div>

        <!-- ========== NORMALE PRODUCT SECTION ========== -->
        <div *ngIf="!product.isComingSoon">
          <!-- Color selector -->
          <div class="mb-4">
            <label class="block text-xs md:text-sm font-semibold mb-3">Colore</label>
            <div class="flex gap-2 flex-wrap pb-6">
              <div *ngFor="let color of product.colors"
                   [class]="'color-swatch ' + (color === selectedColor ? 'selected' : '')"
                   [style.background-color]="getColorHex(color)"
                   [attr.data-color]="color"
                   (click)="selectColor(color)">
              </div>
            </div>
          </div>

          <!-- Size selector -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs md:text-sm font-semibold">Taglia</label>
              <button *ngIf="product.sizeGuide" 
                      (click)="showSizeGuide.emit(product.sizeGuide)"
                      class="text-xs text-blue-600 hover:underline">
                📏 Guida taglie
              </button>
            </div>
            <div class="flex gap-2 flex-wrap">
              <button *ngFor="let size of product.sizes"
                      [class]="'size-btn px-3 md:px-4 py-2 border rounded ' + (size === selectedSize ? 'selected' : '')"
                      (click)="selectSize(size)">
                {{ size }}
              </button>
            </div>
          </div>

          <!-- Quantity and Add to cart -->
          <div class="flex items-center gap-3 md:gap-4">
            <input type="number" 
                   [(ngModel)]="quantity"
                   [min]="1" 
                   [max]="10"
                   class="w-16 md:w-20 px-2 py-2 border rounded text-center text-sm">
            <button (click)="onAddToCart()"
                    [disabled]="isAdding"
                    [class]="'flex-1 py-2 md:py-3 rounded font-semibold transition text-sm md:text-base ' + 
                            (isAdding ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-800')">
              {{ isAdding ? '✓ Aggiunto!' : 'Aggiungi al carrello' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      transition: all 0.3s ease;
      position: relative;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
    
    .color-swatch {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    
    .color-swatch.selected {
      border-color: #000;
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px #000;
    }
    
    .size-btn {
      transition: all 0.2s;
      touch-action: manipulation;
    }
    
    .size-btn.selected {
      background: #000;
      color: #fff;
      font-weight: 600;
    }

    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .carousel-btn:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    .carousel-btn.left {
      left: 8px;
    }

    .carousel-btn.right {
      right: 8px;
    }

    .image-carousel {
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    
    .image-carousel img {
      scroll-snap-align: center;
    }

    @media (max-width: 768px) {
      .color-swatch {
        width: 36px;
        height: 36px;
      }
    }
  `]
})
export class ProductCardComponent {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<{
    product: Product;
    color: string;
    size: string;
    quantity: number;
  }>();
  @Output() imageClick = new EventEmitter<string>();
  @Output() showSizeGuide = new EventEmitter<string>();

  selectedColor = '';
  selectedSize = '';
  quantity = 1;
  isAdding = false;
  currentImages: string[] = [];

  // Coming Soon state
  showInterestForm = false;
  hasRegisteredInterest = false;
  isRegisteringInterest = false;
  interestError = '';
  interestData = {
    preferredColor: '',
    preferredSize: ''
  };

  ngOnInit(): void {
    if (this.product) {
      this.selectedColor = this.product.colors[0];
      this.selectedSize = this.product.sizes[0];
      this.updateImages();

      // Controlla se utente ha già registrato interesse
      if (this.product.isComingSoon) {
        this.checkExistingInterest();
      }
    }
  }

  get showDiscount(): boolean {
    return !!this.product.basePrice && this.product.price < this.product.basePrice;
  }

  get discountAmount(): number {
    if (!this.product.basePrice) return 0;
    return Math.round(this.product.basePrice - this.product.price);
  }

  getColorHex(colorName: string): string {
    return COLOR_MAP[colorName] || '#666666';
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.updateImages();
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  private updateImages(): void {
    this.currentImages = this.productService.getImagesForColor(
      this.product, 
      this.selectedColor
    );
  }

  scrollCarousel(direction: number): void {
    const carousel = document.querySelector(`#carousel-${this.product.id}`) as HTMLElement;
    if (carousel) {
      const scrollAmount = carousel.clientWidth;
      carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  onAddToCart(): void {
    this.addToCart.emit({
      product: this.product,
      color: this.selectedColor,
      size: this.selectedSize,
      quantity: this.quantity
    });

    this.isAdding = true;
    setTimeout(() => {
      this.isAdding = false;
    }, 1500);
  }

  onImageClick(url: string): void {
    this.imageClick.emit(url);
  }

  // ========== COMING SOON METHODS ==========

  openInterestForm(): void {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      // Redirect a login con returnUrl
      this.router.navigate(['/auth/login'], {
        queryParams: { 
          returnUrl: `/products`,
          message: 'Accedi per registrare il tuo interesse'
        }
      });
      return;
    }

    this.showInterestForm = true;
  }

  cancelInterestForm(): void {
    this.showInterestForm = false;
    this.interestError = '';
    this.interestData = {
      preferredColor: '',
      preferredSize: ''
    };
  }

  async registerInterest(): Promise<void> {
    const user = this.authService.getCurrentUser();
    
    if (!user || !user.email) {
      this.interestError = 'Devi essere autenticato';
      return;
    }

    this.isRegisteringInterest = true;
    this.interestError = '';

    try {
      const response = await this.productService.registerProductInterest(
        this.product.id,
        {
          userEmail: user.email,
          userName: user.displayName || user.email.split('@')[0],
          preferredColor: this.interestData.preferredColor || undefined,
          preferredSize: this.interestData.preferredSize || undefined
        }
      );

      console.log('✅ Interesse registrato:', response);
      
      this.hasRegisteredInterest = true;
      this.showInterestForm = false;
      
      // Mostra messaggio successo
      alert('✅ Perfetto! Ti avviseremo via email quando il prodotto sarà disponibile.');
      
    } catch (error: any) {
      console.error('❌ Errore registrazione interesse:', error);
      this.interestError = error.message || 'Errore durante la registrazione';
    } finally {
      this.isRegisteringInterest = false;
    }
  }

  private async checkExistingInterest(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.email) return;

    try {
      const hasInterest = await this.productService.checkProductInterest(
        this.product.id,
        user.email
      );
      this.hasRegisteredInterest = hasInterest;
    } catch (error) {
      console.error('Errore controllo interesse:', error);
    }
  }
}
