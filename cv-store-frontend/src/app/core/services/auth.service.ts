import { Injectable, inject, signal } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  User,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  
  // Signal per reactive state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  
  // Observable dell'utente corrente (Firebase lo aggiorna automaticamente!)
  user$ = user(this.auth);
  
  constructor() {
    // Ascolta cambiamenti stato autenticazione
    this.user$.subscribe(user => {
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
      console.log('Auth state changed:', user?.email);
    });
  }
  
  /**
   * REGISTRAZIONE
   * Firebase crea automaticamente l'account e logga l'utente
   */
  async register(email: string, password: string, displayName: string) {
    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );
      
      // Aggiorna nome utente
      await updateProfile(credential.user, { displayName });
      
      // Invia email verifica (opzionale ma consigliato!)
      await sendEmailVerification(credential.user);
      
      console.log('✅ Registrazione completata:', credential.user.email);
      return credential.user;
    } catch (error: any) {
      console.error('❌ Errore registrazione:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * LOGIN
   * Firebase verifica credenziali e crea sessione automaticamente
   */
  async login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );
      
      console.log('✅ Login completato:', credential.user.email);
      return credential.user;
    } catch (error: any) {
      console.error('❌ Errore login:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * LOGOUT
   * Firebase elimina sessione e token
   */
  async logout() {
    try {
      await signOut(this.auth);
      console.log('✅ Logout completato');
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('❌ Errore logout:', error);
      throw error;
    }
  }
  
  /**
   * PASSWORD RESET
   * Firebase invia email con link reset
   */
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('✅ Email reset inviata');
      return true;
    } catch (error: any) {
      console.error('❌ Errore reset password:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * GET TOKEN (per chiamate API backend)
   * Firebase gestisce automaticamente il refresh del token!
   */
  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    try {
      // Firebase restituisce token valido (refresh automatico se scaduto!)
      return await user.getIdToken();
    } catch (error) {
      console.error('❌ Errore get token:', error);
      return null;
    }
  }
  
  /**
   * Gestione errori Firebase (traduzione messaggi)
   */
  private handleError(error: any): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Email già registrata',
      'auth/weak-password': 'Password troppo debole (min 6 caratteri)',
      'auth/invalid-email': 'Email non valida',
      'auth/user-not-found': 'Utente non trovato',
      'auth/wrong-password': 'Password errata',
      'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi',
      'auth/network-request-failed': 'Errore di connessione'
    };
    
    return errorMessages[error.code] || 'Errore imprevisto';
  }
}
