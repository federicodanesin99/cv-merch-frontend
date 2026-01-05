import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CountdownComponent } from '../../shared/components/countdown/countdown.component';
import { CartSummaryComponent } from '../cart/cart-summary/cart-summary.component'; // ⭐ AGGIUNGI
import { SizeGuideModalComponent } from '../../shared/components/size-guide-modal/size-guide-modal.component';
import { ImageZoomModalComponent } from '../../shared/components/image-zoom-modal/image-zoom-modal.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { CartItem } from '../../core/models/cart-item.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    CountdownComponent,
    CartSummaryComponent, 
    SizeGuideModalComponent,
    ImageZoomModalComponent,
    ProductCardComponent
  ],
  template: `
    <!-- Countdown Timer -->
    <app-countdown></app-countdown>


    <!-- Products Section -->
    <section class="max-w-6xl mx-auto px-4 py-6 md:py-12">
      <!-- Loading State -->
      <div *ngIf="isLoading$ | async" class="text-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
        <p class="text-gray-600 font-semibold mb-2">Caricamento prodotti...</p>
        <p class="text-sm text-gray-400" *ngIf="loadAttempts$ | async as attempts">
          Tentativo {{ attempts }}/3
        </p>
      </div>

      <!-- Error State -->
      <div *ngIf="loadError" class="text-center py-12 bg-white rounded-lg shadow-lg p-8">
        <div class="text-6xl mb-4">😕</div>
        <p class="text-red-600 font-bold text-xl mb-2">Impossibile caricare i prodotti</p>
        <button (click)="reloadProducts()" 
                class="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold">
          🔄 Ricarica la pagina
        </button>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!(isLoading$ | async) && !loadError" 
           class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <app-product-card 
          *ngFor="let product of products$ | async"
          [product]="product"
          (addToCart)="onAddToCart($event)"
          (imageClick)="onImageClick($event)"
          (showSizeGuide)="onShowSizeGuide($event)">
        </app-product-card>
      </div>
    </section>

    <!-- Modals -->
    <app-size-guide-modal 
      [isOpen]="isSizeGuideOpen"
      [content]="sizeGuideContent"
      (close)="closeSizeGuide()">
    </app-size-guide-modal>

    <app-image-zoom-modal
      [isOpen]="isZoomOpen"
      [imageUrl]="zoomedImage"
      (close)="closeImageZoom()">
    </app-image-zoom-modal>

    <!-- CartSummary Footer - SOLO qui! -->
    <app-cart-summary (checkout)="goToCart()"></app-cart-summary>
  `,
  styles: []
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);

  products$!: Observable<Product[]>;
  isLoading$!: Observable<boolean>;
  loadAttempts$!: Observable<number>;
  loadError = false;

  // Modals state
  isSizeGuideOpen = false;
  isZoomOpen = false;
  sizeGuideContent = '';
  zoomedImage = '';

  async ngOnInit(): Promise<void> {
    this.products$ = this.productService.products$;
    this.isLoading$ = this.productService.loading$;
    this.loadAttempts$ = this.productService.loadAttempts$;

    await this.productService.prewarmBackend();
    this.productService.loadProducts();
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
  }

  closeImageZoom(): void {
    this.isZoomOpen = false;
  }

  reloadProducts(): void {
    window.location.reload();
  }
  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
