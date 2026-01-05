import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <img src="logo.png" alt="Logo" class="w-16 h-16 mx-auto mb-4 rounded-full">
          <h1 class="text-3xl font-bold text-gray-900">Crea Account</h1>
          <p class="text-gray-600 mt-2">Registrati per iniziare</p>
        </div>

        <div *ngIf="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ successMessage }}
        </div>

        <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ errorMessage }}
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
            <input 
              type="text" 
              formControlName="displayName"
              placeholder="Mario Rossi"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              formControlName="email"
              placeholder="tua@email.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <p class="text-xs text-gray-500 mt-1">Minimo 6 caratteri</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Conferma Password</label>
            <input 
              type="password" 
              formControlName="confirmPassword"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <p *ngIf="passwordMismatch" class="text-red-500 text-xs mt-1">
              Le password non coincidono
            </p>
          </div>

          <button 
            type="submit"
            [disabled]="registerForm.invalid || passwordMismatch || isLoading"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50">
            <span *ngIf="!isLoading">Registrati</span>
            <span *ngIf="isLoading">Registrazione in corso...</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Hai già un account? 
            <a routerLink="/login" class="text-blue-600 hover:text-blue-700 font-semibold">
              Accedi
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  registerForm = this.fb.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });
  
  get passwordMismatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    return password !== confirm && !!confirm;
  }
  
  async onSubmit() {
    if (this.registerForm.invalid || this.passwordMismatch) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const { email, password, displayName } = this.registerForm.value;
    
    try {
      await this.authService.register(email!, password!, displayName!);
      
      this.successMessage = '✅ Account creato! Controlla la tua email per verificare l\'account.';
      
      setTimeout(() => {
        this.router.navigate(['/account']);
      }, 2000);
    } catch (error: any) {
      this.errorMessage = error;
    } finally {
      this.isLoading = false;
    }
  }
}
