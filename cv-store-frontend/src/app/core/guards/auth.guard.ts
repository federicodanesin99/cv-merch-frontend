import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard che protegge routes riservate agli utenti autenticati
 * 
 * Uso:
 * { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Controlla se l'utente è loggato
  if (authService.isAuthenticated()) {
    return true; // Accesso consentito
  }
  
  // Redirect a login con returnUrl
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
