import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center space-x-2 md:space-x-3 cursor-pointer" 
            (click)="goToHome()"> <!-- ⭐ Cambiato da goToProducts -->
        <img src="logo.png" alt="Logo" 
            class="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover" />
        <div>
            <h1 class="text-base md:text-xl font-bold">CLASSE VENETA</h1>
            <p class="text-xs text-gray-500 hidden md:block">Merchandise Store</p>
        </div>
        </div>
        
        <!-- Right side: Login + Cart -->
        <div class="flex items-center gap-2 md:gap-4">
          <!-- Login/User Button -->
          <div *ngIf="user$ | async as user; else loginButton">
            <!-- User logged in -->
            <div class="flex items-center gap-2">
              <div class="hidden md:block text-right">
                <p class="text-xs text-gray-600">Ciao!</p>
                <p class="text-sm font-semibold">{{ user.email?.split('@')[0] }}</p>
              </div>
              <button (click)="logout()"
                      class="px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition">
                Esci
              </button>
            </div>
          </div>
          <ng-template #loginButton>
            <!-- Not logged in -->
            <button (click)="goToLogin()"
                    class="px-3 md:px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
              Login
            </button>
          </ng-template>

          <!-- Cart Icon -->
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
  `,
  styles: []
})
export class HeaderComponent implements OnInit {
  cartItemCount = 0;
  user$!: Observable<any>;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user$ = this.authService.user$;
    
    this.cartService.cartItems$.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  logout(): void {
    if (confirm('Vuoi davvero uscire?')) {
      this.authService.logout();
      this.router.navigate(['/products']);
    }
  }
  goToHome(): void {
    this.router.navigate(['/']); 
  }
}