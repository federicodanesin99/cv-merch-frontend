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

  products$ = this.productsSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();
  bundleDiscount$ = this.bundleDiscountSubject.asObservable();
  promoCodesVisible$ = this.promoCodesVisibleSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  loadAttempts$ = this.loadAttemptsSubject.asObservable();

  private readonly MAX_RETRIES = 3;

  constructor(private http: HttpClient) {}

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
    this.loadingSubject.next(true);
    const currentAttempt = this.loadAttemptsSubject.value + 1;
    this.loadAttemptsSubject.next(currentAttempt);

    this.http.get<ProductsResponse>(`${environment.apiUrl}/api/products`).pipe(
      retry({
        count: this.MAX_RETRIES,
        delay: () => timer(3000)
      }),
      tap(response => {
        this.productsSubject.next(response.products);
        this.bundleDiscountSubject.next(response.bundleDiscount);
        this.promoCodesVisibleSubject.next(response.promoCodesVisible);
        
        // ✅ Aggiorna categorie dal backend (o estrai dai prodotti)
        if (response.categories) {
          this.categoriesSubject.next(response.categories);
        } else {
          // Fallback: estrai categorie dai prodotti
          const categories = this.extractCategories(response.products);
          this.categoriesSubject.next(categories);
        }
        
        this.loadAttemptsSubject.next(0);
      }),
      catchError(err => {
        console.error('Error loading products:', err);
        this.loadAttemptsSubject.next(0);
        throw err;
      })
    ).subscribe({
      next: () => this.loadingSubject.next(false),
      error: () => this.loadingSubject.next(false)
    });
  }

  /**
   * Estrae le categorie uniche dai prodotti
   */
  private extractCategories(products: Product[]): string[] {
    const categoriesSet = new Set<string>();
    
    products.forEach(product => {
      if (product.category) {
        categoriesSet.add(product.category);
      }
    });
    
    return Array.from(categoriesSet).sort();
  }

  /**
   * Ottiene tutti i prodotti
   */
  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  /**
   * Ottiene tutte le categorie
   */
  getCategories(): Observable<string[]> {
    return this.categories$;
  }

  /**
   * Filtra prodotti per categoria
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products => 
        products.filter(p => p.category?.toLowerCase() === category.toLowerCase())
      )
    );
  }

  /**
   * Conta prodotti per categoria
   */
  getProductCountByCategory(category: string): number {
    const products = this.productsSubject.value;
    return products.filter(p => p.category?.toLowerCase() === category.toLowerCase()).length;
  }

  /**
   * Ottiene le immagini per un colore specifico
   */
  getImagesForColor(product: Product, color: string): string[] {
    if (!product.images || product.images.length === 0) return [];
    const colorImages = product.images.find(img => img.color === color);
    return colorImages ? colorImages.urls : [];
  }
}
