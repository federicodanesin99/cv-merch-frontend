import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SidebarMenuComponent } from '../sidebar-menu/sidebar-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SidebarMenuComponent],
  template: `
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-3 md:py-4">
        <div class="flex justify-between items-center">
          
          <!-- Left: Hamburger Menu -->
          <button 
            (click)="toggleMenu()"
            class="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Center: Logo -->
          <div class="absolute left-1/2 transform -translate-x-1/2 cursor-pointer" 
               (click)="goToHome()">
            <img 
              [src]="logoUrl" 
              alt="CLASSE VENETA" 
              class="h-10 md:h-12 w-auto object-contain" />
          </div>

          <!-- Right: Cart Icon -->
          <button (click)="goToCart()"
                  class="relative cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z">
              </path>
            </svg>
            <span *ngIf="cartItemCount > 0" 
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ cartItemCount }}
            </span>
          </button>

        </div>
      </div>
    </header>

    <!-- Sidebar Menu Component -->
    <app-sidebar-menu 
      [isOpen]="isMenuOpen"
      (closeMenu)="closeMenu()">
    </app-sidebar-menu>
  `,
  styles: []
})
export class HeaderComponent implements OnInit {
  cartItemCount = 0;
  isMenuOpen = false;
  
  // URL del logo
  logoUrl = 'https://res.cloudinary.com/dr90huuw3/image/upload/v1767734845/Logo_Felpe_Classe_Veneta_per_sitoweb-06_fxk7zr.png';

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}