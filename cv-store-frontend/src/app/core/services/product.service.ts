import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product, ProductsResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private bundleDiscountSubject = new BehaviorSubject<number>(5);
  private promoCodesVisibleSubject = new BehaviorSubject<boolean>(true);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadAttemptsSubject = new BehaviorSubject<number>(0);

  products$ = this.productsSubject.asObservable();
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

  getImagesForColor(product: Product, color: string): string[] {
    if (!product.images || product.images.length === 0) return [];
    const colorImages = product.images.find(img => img.color === color);
    return colorImages ? colorImages.urls : [];
  }
}
