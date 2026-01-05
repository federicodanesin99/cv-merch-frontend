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
  }
  
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
  
  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('❌ Errore get token:', error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }
  
  private handleError(error: any): string {
    console.error('🔥 Firebase Error:', error.code, error.message);
    
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Email già registrata',
      'auth/weak-password': 'Password troppo debole (min 6 caratteri)',
      'auth/invalid-email': 'Email non valida',
      'auth/user-not-found': 'Utente non trovato',
      'auth/wrong-password': 'Password errata',
      'auth/invalid-credential': 'Email o password non corretti',
      'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi',
      'auth/network-request-failed': 'Errore di connessione'
    };
    
    return errorMessages[error.code] || `Errore: ${error.message}`;
  }
}