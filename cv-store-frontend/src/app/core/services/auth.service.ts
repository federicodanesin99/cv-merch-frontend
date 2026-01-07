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
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  user$ = user(this.auth);
  
  constructor() {
    console.log('🔥 AuthService initialized');
    console.log('🔥 Firebase Auth object:', this.auth);
    
    // Ascolta cambiamenti stato autenticazione
    this.user$.subscribe(user => {
      console.log('🔥 Auth state changed:', {
        user: user,
        email: user?.email,
        uid: user?.uid,
        isNull: user === null,
        isUndefined: user === undefined
      });
      
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
    });

    // Gestisci risultato redirect OAuth (per mobile/popup bloccati)
    this.handleRedirectResult();
  }
  
  // ==================== REGISTRAZIONE ====================
  async register(email: string, password: string, displayName: string) {
    console.log('📝 Registrazione:', email);
    
    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );
      
      console.log('✅ Utente creato:', credential.user.uid);
      
      await updateProfile(credential.user, { displayName });
      console.log('✅ Profilo aggiornato');
      
      await sendEmailVerification(credential.user);
      console.log('✅ Email verifica inviata');
      
      return credential.user;
    } catch (error: any) {
      console.error('❌ Errore registrazione:', error);
      throw this.handleError(error);
    }
  }
  
  // ==================== LOGIN EMAIL/PASSWORD ====================
  async login(email: string, password: string) {
    console.log('🔐 Tentativo login:', email);
    console.log('🔐 Auth disponibile:', !!this.auth);
    
    try {
      const credential = await signInWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );
      
      console.log('✅ Login Firebase completato:', {
        uid: credential.user.uid,
        email: credential.user.email
      });
      
      return credential.user;
      
    } catch (error: any) {
      console.error('❌ Errore login Firebase:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      throw this.handleError(error);
    }
  }

  // ==================== LOGIN GOOGLE (POPUP) ====================
  async loginWithGoogle(): Promise<User> {
    console.log('🔐 Tentativo login Google (popup)');
    
    try {
      const provider = new GoogleAuthProvider();
      
      // Aggiungi scopes
      provider.addScope('profile');
      provider.addScope('email');
      
      // Forza selezione account Google
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const credential = await signInWithPopup(this.auth, provider);
      
      console.log('✅ Google login completato:', {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName
      });
      
      return credential.user;
      
    } catch (error: any) {
      console.error('❌ Errore Google login:', {
        code: error.code,
        message: error.message
      });
      
      // Se popup bloccato, prova con redirect
      if (error.code === 'auth/popup-blocked') {
        console.warn('⚠️ Popup bloccato, tento redirect...');
        return this.loginWithGoogleRedirect();
      }
      
      throw this.handleError(error);
    }
  }

  // ==================== LOGIN GOOGLE (REDIRECT - FALLBACK) ====================
  async loginWithGoogleRedirect(): Promise<User> {
    console.log('🔐 Tentativo login Google (redirect)');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithRedirect(this.auth, provider);
      
      // Il risultato verrà gestito da handleRedirectResult()
      // Lancia un errore speciale per indicare che il redirect è in corso
      throw new Error('REDIRECT_IN_PROGRESS');
      
    } catch (error: any) {
      if (error.message === 'REDIRECT_IN_PROGRESS') {
        throw error; // Rilancia senza gestire
      }
      
      console.error('❌ Errore Google redirect:', error);
      throw this.handleError(error);
    }
  }

  // ==================== GESTIONE REDIRECT RESULT ====================
  private async handleRedirectResult(): Promise<void> {
    try {
      const result = await getRedirectResult(this.auth);
      
      if (result?.user) {
        console.log('✅ Redirect OAuth completato:', {
          uid: result.user.uid,
          email: result.user.email,
          provider: result.providerId
        });
        
        // Recupera returnUrl salvato prima del redirect
        const returnUrl = sessionStorage.getItem('authReturnUrl') || '/cart';
        sessionStorage.removeItem('authReturnUrl');
        
        console.log('📍 Redirect post-OAuth a:', returnUrl);
        this.router.navigateByUrl(returnUrl);
      }
    } catch (error: any) {
      console.error('❌ Errore redirect OAuth result:', error);
      // Non lanciare l'errore, solo logga
    }
  }
  
  // ==================== LOGOUT ====================
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
  
  // ==================== RESET PASSWORD ====================
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('✅ Email reset inviata a:', email);
      return true;
    } catch (error: any) {
      console.error('❌ Errore reset password:', error);
      throw this.handleError(error);
    }
  }
  
  // ==================== TOKEN ====================
  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('⚠️ Nessun utente autenticato per ottenere token');
      return null;
    }
    
    try {
      const token = await user.getIdToken();
      console.log('✅ Token ottenuto');
      return token;
    } catch (error) {
      console.error('❌ Errore get token:', error);
      return null;
    }
  }

  // ==================== GETTERS ====================
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  getCurrentUserEmail(): string | null {
    return this.auth.currentUser?.email || null;
  }

  getCurrentUserDisplayName(): string | null {
    return this.auth.currentUser?.displayName || null;
  }
  
  // ==================== ERROR HANDLER ====================
  private handleError(error: any): string {
    console.error('🔥 Firebase Error:', error.code, error.message);
    
    const errorMessages: { [key: string]: string } = {
      // Email/Password errors
      'auth/email-already-in-use': 'Email già registrata',
      'auth/weak-password': 'Password troppo debole (min 6 caratteri)',
      'auth/invalid-email': 'Email non valida',
      'auth/user-not-found': 'Utente non trovato',
      'auth/wrong-password': 'Password errata',
      'auth/invalid-credential': 'Email o password non corretti',
      'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi',
      'auth/network-request-failed': 'Errore di connessione',
      'auth/user-disabled': 'Account disabilitato',
      
      // Google OAuth errors
      'auth/popup-blocked': 'Popup bloccato dal browser. Riprova o abilita i popup.',
      'auth/popup-closed-by-user': 'Login annullato',
      'auth/cancelled-popup-request': 'Richiesta popup annullata',
      'auth/account-exists-with-different-credential': 'Esiste già un account con questa email',
      'auth/credential-already-in-use': 'Credenziali già in uso',
      'auth/operation-not-allowed': 'Operazione non consentita',
      
      // Generic
      'auth/internal-error': 'Errore interno. Riprova più tardi'
    };
    
    return errorMessages[error.code] || `Errore: ${error.message}`;
  }
}
