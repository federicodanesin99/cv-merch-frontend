import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer, Observable, map } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product, ProductsResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private categoriesSubject = new BehaviorSubject<string[]>([]);
  private bundleDiscountSubject = new BehaviorSubject<number>(5);
  private promoCodesVisibleSubject = new BehaviorSubject<boolean>(true);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadAttemptsSubject = new BehaviorSubject<number>(0);
  private isInitialized = false;

  products$ = this.productsSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();
  bundleDiscount$ = this.bundleDiscountSubject.asObservable();
  promoCodesVisible$ = this.promoCodesVisibleSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  loadAttempts$ = this.loadAttemptsSubject.asObservable();

  private readonly MAX_RETRIES = 3;

  constructor(private http: HttpClient) {
    this.initialize();
  }

  private initialize(): void {
    if (!this.isInitialized) {
      console.log('🚀 ProductService initialized - Loading products...');
      this.loadProducts();
      this.isInitialized = true;
    }
  }

  async prewarmBackend(): Promise<void> {
    try {
      console.log('🔥 Pre-warming backend...');
      await this.http.get(`${environment.apiUrl}/health`).toPromise();
      console.log('✅ Backend warm!');
    } catch (err) {
      console.log('⚠️ Prewarm failed');
    }
  }

  loadProducts(): void {
    if (this.loadingSubject.value) {
      console.log('⚠️ Load already in progress, skipping...');
      return;
    }

    this.loadingSubject.next(true);
    const currentAttempt = this.loadAttemptsSubject.value + 1;
    this.loadAttemptsSubject.next(currentAttempt);

    console.log('📦 Loading products from API...');

    this.http.get<ProductsResponse>(`${environment.apiUrl}/api/products`).pipe(
      retry({
        count: this.MAX_RETRIES,
        delay: () => timer(3000)
      }),
      tap(response => {
        console.log('✅ Products loaded:', response.products.length);
        
        this.productsSubject.next(response.products);
        this.bundleDiscountSubject.next(response.bundleDiscount);
        this.promoCodesVisibleSubject.next(response.promoCodesVisible);
        
        if (response.categories) {
          this.categoriesSubject.next(response.categories);
          console.log('✅ Categories from backend:', response.categories);
        } else {
          const categories = this.extractCategories(response.products);
          this.categoriesSubject.next(categories);
          console.log('✅ Categories extracted from products:', categories);
        }
        
        this.loadAttemptsSubject.next(0);
      }),
      catchError(err => {
        console.error('❌ Error loading products:', err);
        this.loadAttemptsSubject.next(0);
        throw err;
      })
    ).subscribe({
      next: () => this.loadingSubject.next(false),
      error: () => this.loadingSubject.next(false)
    });
  }

  private extractCategories(products: Product[]): string[] {
    const categoriesSet = new Set<string>();
    
    products.forEach(product => {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    });
    
    return Array.from(categoriesSet).sort();
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getCategories(): Observable<string[]> {
    return this.categories$;
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products => 
        products.filter(p => p.category?.toLowerCase() === category.toLowerCase())
      )
    );
  }

  getProductCountByCategory(category: string): number {
    const products = this.productsSubject.value;
    return products.filter(p => p.category?.toLowerCase() === category.toLowerCase()).length;
  }

  getImagesForColor(product: Product, color: string): string[] {
    if (!product.images || product.images.length === 0) return [];
    const colorImages = product.images.find(img => img.color === color);
    return colorImages ? colorImages.urls : [];
  }

  // ========== COMING SOON / PRODUCT INTEREST ==========

  /**
   * Registra interesse utente per prodotto coming soon
   */
  async registerProductInterest(
    productId: string, 
    data: {
      userEmail: string;
      userName: string;
      preferredColor?: string;
      preferredSize?: string;
    }
  ): Promise<any> {
    try {
      const response = await this.http.post(
        `${environment.apiUrl}/api/products/${productId}/register-interest`,
        data
      ).toPromise();

      console.log('✅ Interesse registrato:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Errore registrazione interesse:', error);
      
      if (error.status === 400) {
        throw new Error(error.error?.error || 'Prodotto già disponibile o dati non validi');
      } else if (error.status === 404) {
        throw new Error('Prodotto non trovato');
      } else {
        throw new Error('Errore durante la registrazione. Riprova.');
      }
    }
  }

  /**
   * Controlla se utente ha già registrato interesse
   */
  async checkProductInterest(productId: string, userEmail: string): Promise<boolean> {
    try {
      // Questa è una chiamata semplificata - puoi implementare un endpoint dedicato
      // oppure controllare lato client dopo aver fetchato la lista
      // Per ora uso un approccio semplice: assumo false e aggiorno quando registro
      return false;
    } catch (error) {
      console.error('Errore controllo interesse:', error);
      return false;
    }
  }
}
