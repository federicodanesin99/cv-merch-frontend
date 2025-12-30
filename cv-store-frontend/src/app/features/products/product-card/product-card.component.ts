import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, COLOR_MAP } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-card bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Carousel -->
      <div class="carousel-container relative bg-gray-100">
        <div *ngIf="currentImages.length > 0" class="relative">
          <div class="image-carousel flex overflow-x-auto snap-x" #carousel>
            <img *ngFor="let url of currentImages"
                 [src]="url" 
                 [alt]="product.name"
                 (click)="onImageClick(url)"
                 class="w-full h-64 md:h-80 object-cover flex-shrink-0 snap-center cursor-pointer">
          </div>
          
          <button *ngIf="currentImages.length > 1" 
                  (click)="scrollCarousel(-1)"
                  class="carousel-btn left">
            &#8249;
          </button>
          <button *ngIf="currentImages.length > 1" 
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
        <div class="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          {{ selectedColor }}
        </div>

        <!-- Discount badge -->
        <div *ngIf="showDiscount" 
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

        <!-- Price -->
        <div class="flex items-center gap-3 mb-4">
          <p *ngIf="showDiscount" class="text-lg text-gray-400 line-through">
            €{{ product.basePrice?.toFixed(2) }}
          </p>
          <p [class]="showDiscount ? 'text-2xl md:text-3xl font-bold text-red-600' : 'text-2xl md:text-3xl font-bold text-gray-900'">
            €{{ product.price.toFixed(2) }}
          </p>
        </div>

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
  `,
  styles: [`
    .product-card {
      transition: all 0.3s ease;
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

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    if (this.product) {
      this.selectedColor = this.product.colors[0];
      this.selectedSize = this.product.sizes[0];
      this.updateImages();
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

    // Visual feedback
    this.isAdding = true;
    setTimeout(() => {
      this.isAdding = false;
    }, 1500);
  }

  onImageClick(url: string): void {
    this.imageClick.emit(url);
  }
}
