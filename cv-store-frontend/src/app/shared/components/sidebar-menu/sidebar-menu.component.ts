import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Sidebar Menu -->
    <div 
      *ngIf="isOpen"
      class="fixed inset-0 z-50"
      (click)="close()">
      
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Sidebar -->
      <aside 
        (click)="$event.stopPropagation()"
        class="absolute top-0 left-0 w-80 h-full bg-white shadow-xl transform transition-transform overflow-y-auto">
        
        <!-- Header sidebar -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold">Menu</h3>
          <button 
            (click)="close()"
            class="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Menu items -->
        <nav class="p-4">
          <ul class="space-y-2">
            <!-- Home -->
            <li>
              <a 
                routerLink="/" 
                (click)="close()"
                class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span class="font-semibold">Home</span>
              </a>
            </li>

            <!-- Prodotti con sottomenu -->
            <li>
              <button 
                (click)="toggleProducts()"
                class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition">
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <span class="font-semibold">Prodotti</span>
                </div>
                <svg 
                  class="w-4 h-4 transition-transform"
                  [class.rotate-180]="isProductsOpen"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Sottomenu categorie -->
              <ul 
                *ngIf="isProductsOpen"
                class="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
                
                <!-- Tutti i prodotti -->
                <li>
                  <a 
                    routerLink="/products"
                    (click)="close()"
                    class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
                    <span>Tutti i Prodotti</span>
                    <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {{ totalProducts }}
                    </span>
                  </a>
                </li>

                <!-- Categorie dinamiche -->
                <li *ngFor="let category of categories$ | async">
                  <a 
                    [routerLink]="['/products']"
                    [queryParams]="{category: category}"
                    (click)="close()"
                    class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm capitalize">
                    <span>{{ category }}</span>
                    <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {{ getProductCount(category) }}
                    </span>
                  </a>
                </li>
              </ul>
            </li>

            <!-- Carrello -->
            <li>
              <a 
                routerLink="/cart" 
                (click)="close()"
                class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span class="font-semibold">Carrello</span>
                <span 
                  *ngIf="cartItemCount > 0"
                  class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {{ cartItemCount }}
                </span>
              </a>
            </li>

            <!-- Divider -->
            <li class="border-t border-gray-200 my-4"></li>

            <!-- Chi Siamo -->
            <li>
              <a 
                routerLink="/about" 
                (click)="close()"
                class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Chi Siamo</span>
              </a>
            </li>

            <!-- Contatti -->
            <li>
              <a 
                routerLink="/contact" 
                (click)="close()"
                class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>Contatti</span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- Footer sidebar (se loggato) -->
        <div 
          *ngIf="user$ | async as user"
          class="sticky bottom-0 p-4 border-t border-gray-200 bg-gray-50">
          <div class="mb-3">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                {{ user.email?.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-500">Loggato come:</p>
                <p class="text-sm font-semibold truncate">{{ user.email }}</p>
              </div>
            </div>
          </div>
          <button 
            (click)="handleLogout()"
            class="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .rotate-180 {
      transform: rotate(180deg);
    }
  `]
})
export class SidebarMenuComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  cartItemCount = 0;
  totalProducts = 0;
  user$!: Observable<any>;
  categories$!: Observable<string[]>;
  isProductsOpen = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user$ = this.authService.user$;
    this.categories$ = this.productService.getCategories();
    
    // Subscribe al cart
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });

    // Subscribe ai prodotti per contare il totale
    this.productService.getProducts().subscribe(products => {
      this.totalProducts = products.length;
    });
  }

  toggleProducts(): void {
    this.isProductsOpen = !this.isProductsOpen;
  }

  getProductCount(category: string): number {
    return this.productService.getProductCountByCategory(category);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
    this.close();
  }

  close(): void {
    this.closeMenu.emit();
    // Reset submenu quando chiudi
    this.isProductsOpen = false;
  }

  handleLogout(): void {
    if (confirm('Vuoi davvero uscire?')) {
      this.authService.logout();
      this.router.navigate(['/products']);
      this.close();
    }
  }
}
