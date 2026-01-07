import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
              </path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold mb-2">Bentornato!</h1>
          <p class="text-gray-600">Accedi al tuo account CLASSE VENETA</p>
        </div>

        <!-- Google Sign-In Button -->
        <button 
          type="button"
          (click)="onGoogleLogin()"
          [disabled]="isLoading || isGoogleLoading"
          class="w-full mb-6 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:active:scale-100 flex items-center justify-center gap-3">
          <svg *ngIf="!isGoogleLoading" class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <svg *ngIf="isGoogleLoading" class="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isGoogleLoading ? 'Accesso in corso...' : 'Continua con Google' }}</span>
        </button>

        <!-- Divider -->
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">oppure con email</span>
          </div>
        </div>

        <!-- Form Email/Password -->
        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Email <span class="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              [(ngModel)]="email"
              name="email"
              required
              email
              placeholder="tua@email.com"
              [disabled]="isLoading || isGoogleLoading"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed">
          </div>

          <!-- Password -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-semibold">
                Password <span class="text-red-500">*</span>
              </label>
              <button 
                type="button"
                (click)="openResetModal()"
                [disabled]="isLoading || isGoogleLoading"
                class="text-xs text-gray-600 hover:text-black underline disabled:opacity-50">
                Password dimenticata?
              </button>
            </div>
            <input 
              type="password" 
              [(ngModel)]="password"
              name="password"
              required
              minlength="6"
              placeholder="••••••••"
              [disabled]="isLoading || isGoogleLoading"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed">
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" 
               class="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3 animate-shake">
            <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
            <div class="flex-1">
              <p class="text-sm font-semibold text-red-800">Errore di autenticazione</p>
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            [disabled]="isLoading || isGoogleLoading || loginForm.invalid"
            class="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:active:scale-100">
            <span *ngIf="!isLoading" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1">
                </path>
              </svg>
              Accedi
            </span>
            <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Accesso in corso...
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Non hai un account?</span>
          </div>
        </div>

        <!-- Links -->
        <div class="space-y-3">
          <a routerLink="/auth/register"
             class="block w-full text-center px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-black hover:bg-gray-50 transition">
            Crea un account
          </a>
          
          <a routerLink="/products" 
             class="block text-center text-sm text-gray-600 hover:text-black transition">
            ← Torna al negozio
          </a>
        </div>

        <!-- Help Text -->
        <div class="mt-6 text-center text-xs text-gray-500">
          Accedendo accetti i nostri 
          <a href="#" class="underline hover:text-black">Termini di Servizio</a> e la 
          <a href="#" class="underline hover:text-black">Privacy Policy</a>
        </div>
      </div>
    </section>

    <!-- Password Reset Modal (stesso di prima) -->
    <div *ngIf="isResetModalOpen" 
         (click)="closeResetModal()"
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div (click)="$event.stopPropagation()" 
           class="bg-white rounded-lg max-w-md w-full p-6">
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Recupera Password</h3>
          <button (click)="closeResetModal()" 
                  class="text-gray-400 hover:text-gray-600 text-2xl">
            ✕
          </button>
        </div>

        <!-- Modal Content -->
        <div class="mb-6">
          <p class="text-sm text-gray-600 mb-4">
            Inserisci la tua email e ti invieremo un link per reimpostare la password.
          </p>

          <form (ngSubmit)="onResetPassword()" #resetForm="ngForm">
            <div class="mb-4">
              <label class="block text-sm font-semibold mb-2">Email</label>
              <input 
                type="email" 
                [(ngModel)]="resetEmail"
                name="resetEmail"
                required
                email
                placeholder="tua@email.com"
                [disabled]="isResetting"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100">
            </div>

            <!-- Reset Error -->
            <div *ngIf="resetErrorMessage" 
                 class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
              {{ resetErrorMessage }}
            </div>

            <!-- Reset Success -->
            <div *ngIf="resetSuccessMessage" 
                 class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700 flex items-start gap-2">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>{{ resetSuccessMessage }}</span>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
              <button 
                type="button"
                (click)="closeResetModal()"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
                Annulla
              </button>
              <button 
                type="submit"
                [disabled]="isResetting || resetForm.invalid || !!resetSuccessMessage"
                class="flex-1 bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isResetting">Invia Email</span>
                <span *ngIf="isResetting" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Invio...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
    
    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  // Login state
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  isGoogleLoading = false;

  // Reset password state
  isResetModalOpen = false;
  resetEmail = '';
  resetErrorMessage = '';
  resetSuccessMessage = '';
  isResetting = false;

  // Login con Google
  async onGoogleLogin(): Promise<void> {
    this.errorMessage = '';
    this.isGoogleLoading = true;
    this.cdr.detectChanges();

    console.log('🔐 Tentativo login Google');

    // Salva returnUrl prima del redirect (per mobile)
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cart';
    sessionStorage.setItem('authReturnUrl', returnUrl);

    try {
      const user = await this.authService.loginWithGoogle();
      
      if (user.email) { // Se non è un redirect in corso
        console.log('✅ Google login riuscito:', user.email);
        console.log('📍 Redirect a:', returnUrl);
        await this.router.navigateByUrl(returnUrl);
      }
      
    } catch (error: any) {
      console.error('❌ Errore Google login:', error);
      
      // Non mostrare errore se è un redirect in corso
      if (error.message !== 'REDIRECT_IN_PROGRESS') {
        this.errorMessage = error || 'Errore durante il login con Google. Riprova.';
      }
      
    } finally {
      this.isGoogleLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Login con email/password (esistente)
  async onLogin(): Promise<void> {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Compila tutti i campi obbligatori';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La password deve essere di almeno 6 caratteri';
      return;
    }

    console.log('🔐 Tentativo login:', this.email);
    
    this.isLoading = true;
    this.cdr.detectChanges();

    const timeoutId = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.errorMessage = 'Richiesta scaduta. Controlla la connessione e riprova.';
        this.cdr.detectChanges();
        console.error('⏱️ Timeout login');
      }
    }, 10000);

    try {
      const user = await this.authService.login(this.email, this.password);
      clearTimeout(timeoutId);
      
      console.log('✅ Login riuscito:', user.email);
      
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cart';
      console.log('📍 Redirect a:', returnUrl);
      
      await this.router.navigateByUrl(returnUrl);
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('❌ Errore login:', error);
      this.errorMessage = error || 'Errore durante il login. Riprova.';
      
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
      console.log('✅ Stato resettato');
    }
  }

  // Password Reset Modal
  openResetModal(): void {
    this.isResetModalOpen = true;
    this.resetEmail = this.email;
    this.resetErrorMessage = '';
    this.resetSuccessMessage = '';
    document.body.style.overflow = 'hidden';
  }

  closeResetModal(): void {
    this.isResetModalOpen = false;
    this.resetEmail = '';
    this.resetErrorMessage = '';
    this.resetSuccessMessage = '';
    document.body.style.overflow = 'auto';
  }

  async onResetPassword(): Promise<void> {
    this.resetErrorMessage = '';
    this.resetSuccessMessage = '';

    if (!this.resetEmail) {
      this.resetErrorMessage = 'Inserisci la tua email';
      return;
    }

    console.log('📧 Richiesta reset password per:', this.resetEmail);

    this.isResetting = true;
    this.cdr.detectChanges();

    try {
      await this.authService.resetPassword(this.resetEmail);
      
      console.log('✅ Email reset inviata');
      this.resetSuccessMessage = `Email inviata a ${this.resetEmail}. Controlla la tua casella di posta.`;
      
      setTimeout(() => {
        this.closeResetModal();
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Errore reset password:', error);
      this.resetErrorMessage = error || 'Errore durante il reset. Riprova.';
      
    } finally {
      this.isResetting = false;
      this.cdr.detectChanges();
    }
  }
}
