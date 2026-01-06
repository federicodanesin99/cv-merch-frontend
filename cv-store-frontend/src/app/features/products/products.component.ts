import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CountdownComponent } from '../../shared/components/countdown/countdown.component';
import { CartSummaryComponent } from '../cart/cart-summary/cart-summary.component';
import { SizeGuideModalComponent } from '../../shared/components/size-guide-modal/size-guide-modal.component';
import { ImageZoomModalComponent } from '../../shared/components/image-zoom-modal/image-zoom-modal.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { CartItem } from '../../core/models/cart-item.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
      
      <!-- Header con Filtri Categorie -->
      <div class="mb-8">
        <!-- Filtri Categorie -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-8" *ngIf="(categories$ | async)?.length">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Filtra per Categoria:</h3>
          <div class="flex flex-wrap gap-2">
            <button
              (click)="filterByCategory(null)"
              [class.bg-black]="selectedCategory === null"
              [class.text-white]="selectedCategory === null"
              [class.bg-gray-100]="selectedCategory !== null"
              [class.text-gray-700]="selectedCategory !== null"
              class="px-4 py-2 rounded-lg font-medium text-sm transition hover:bg-gray-200">
              Tutti ({{ allProductsCount }})
            </button>
            
            <button
              *ngFor="let category of categories$ | async"
              (click)="filterByCategory(category)"
              [class.bg-black]="selectedCategory === category"
              [class.text-white]="selectedCategory === category"
              [class.bg-gray-100]="selectedCategory !== category"
              [class.text-gray-700]="selectedCategory !== category"
              class="px-4 py-2 rounded-lg font-medium text-sm transition hover:bg-gray-200 capitalize">
              {{ category }} ({{ getProductCountByCategory(category) }})
            </button>
          </div>
        </div>

        <!-- Titolo Categoria Corrente - GRANDE -->
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-6xl font-bold mb-3 capitalize">
            {{ selectedCategory || 'Tutti i Prodotti' }}
          </h1>
          <p class="text-lg md:text-xl text-gray-600">
            <span *ngIf="selectedCategory">
              {{ getProductCountByCategory(selectedCategory) }} prodotti disponibili
            </span>
            <span *ngIf="!selectedCategory">
              {{ allProductsCount }} prodotti disponibili
            </span>
          </p>
        </div>
      </div>

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

      <!-- Products Grid - Con Categorie quando "Tutti" -->
      <div *ngIf="!(isLoading$ | async) && !loadError && (filteredProducts$ | async)?.length">
        
        <!-- Visualizzazione CON separatori categoria (quando mostri "Tutti") -->
        <ng-container *ngIf="selectedCategory === null">
          <div *ngFor="let categoryGroup of groupedProducts$ | async">
            <!-- Header Categoria -->
            <div class="mb-6 mt-12 first:mt-0">
              <div class="flex items-center gap-4">
                <div class="flex-1 h-px bg-gray-300"></div>
                <h2 class="text-2xl md:text-3xl font-bold uppercase tracking-wider px-4">
                  {{ categoryGroup.category || 'Senza Categoria' }}
                </h2>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>
              <p class="text-center text-gray-500 text-sm mt-2">
                {{ categoryGroup.products.length }} prodotti
              </p>
            </div>
            
            <!-- Grid prodotti della categoria -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <app-product-card 
                *ngFor="let product of categoryGroup.products"
                [product]="product"
                (addToCart)="onAddToCart($event)"
                (imageClick)="onImageClick($event)"
                (showSizeGuide)="onShowSizeGuide($event)">
              </app-product-card>
            </div>
          </div>
        </ng-container>

        <!-- Visualizzazione SENZA separatori (quando filtri per categoria) -->
        <div *ngIf="selectedCategory !== null" 
             class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <app-product-card 
            *ngFor="let product of filteredProducts$ | async"
            [product]="product"
            (addToCart)="onAddToCart($event)"
            (imageClick)="onImageClick($event)"
            (showSizeGuide)="onShowSizeGuide($event)">
          </app-product-card>
        </div>
      </div>

      <!-- Nessun Prodotto -->
      <div *ngIf="!(isLoading$ | async) && !loadError && (filteredProducts$ | async)?.length === 0"
           class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-gray-500 text-lg mb-4">
          Nessun prodotto trovato
          <span *ngIf="selectedCategory" class="capitalize"> in "{{ selectedCategory }}"</span>
        </p>
        <button
          *ngIf="selectedCategory"
          (click)="filterByCategory(null)"
          class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Vedi Tutti i Prodotti
        </button>
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

    <!-- CartSummary Footer -->
    <app-cart-summary (checkout)="goToCart()"></app-cart-summary>
  `,
  styles: []
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  products$!: Observable<Product[]>;
  filteredProducts$!: Observable<Product[]>;
  groupedProducts$!: Observable<{ category: string; products: Product[] }[]>;
  categories$!: Observable<string[]>;
  isLoading$!: Observable<boolean>;
  loadAttempts$!: Observable<number>;
  
  loadError = false;
  selectedCategory: string | null = null;
  allProductsCount = 0;

  // Modals state
  isSizeGuideOpen = false;
  isZoomOpen = false;
  sizeGuideContent = '';
  zoomedImage = '';

  async ngOnInit(): Promise<void> {
    // Inizializza observables
    this.products$ = this.productService.products$;
    this.categories$ = this.productService.getCategories();
    this.isLoading$ = this.productService.loading$;
    this.loadAttempts$ = this.productService.loadAttempts$;

    // Inizializza filteredProducts con tutti i prodotti
    this.filteredProducts$ = this.products$;

    // Crea observable per prodotti raggruppati per categoria
    this.groupedProducts$ = this.products$.pipe(
      map(products => {
        // Raggruppa prodotti per categoria
        const grouped = new Map<string, Product[]>();
        
        products.forEach(product => {
          const category = product.category || 'Senza Categoria';
          if (!grouped.has(category)) {
            grouped.set(category, []);
          }
          grouped.get(category)!.push(product);
        });

        // Converti in array e ordina per categoria
        return Array.from(grouped.entries())
          .map(([category, products]) => ({ category, products }))
          .sort((a, b) => a.category.localeCompare(b.category));
      })
    );

    // Prewarm e carica prodotti
    await this.productService.prewarmBackend();
    this.productService.loadProducts();

    // Conta prodotti totali
    this.products$.subscribe(products => {
      this.allProductsCount = products.length;
    });

    // Controlla query params per categoria
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.filterByCategory(params['category']);
      }
    });
  }

  filterByCategory(category: string | null): void {
    this.selectedCategory = category;
    
    if (category === null) {
      // Mostra tutti i prodotti
      this.filteredProducts$ = this.products$;
      
      // Rimuovi query param
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {}
      });
    } else {
      // Filtra per categoria
      this.filteredProducts$ = this.products$.pipe(
        map(products => 
          products.filter(p => p.category?.toLowerCase() === category.toLowerCase())
        )
      );
      
      // Aggiungi query param
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { category }
      });
    }
  }

  getProductCountByCategory(category: string): number {
    return this.productService.getProductCountByCategory(category);
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
