import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderRequest, OrderResponse, PromoCodeValidation } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) {}

  createOrder(order: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(
      `${environment.apiUrl}/api/orders`,
      order
    );
  }

  saveLastOrder(order: OrderResponse): void {
    const orderData = {
      uniqueCode: order.uniqueCode,
      total: order.total,
      timestamp: Date.now()
    };
    sessionStorage.setItem('lastOrder', JSON.stringify(orderData));
  }

  getLastOrder(): any {
    const data = sessionStorage.getItem('lastOrder');
    return data ? JSON.parse(data) : null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PromoService {
  constructor(private http: HttpClient) {}

  validatePromoCode(
    code: string, 
    customerEmail: string, 
    subtotal: number
  ): Observable<PromoCodeValidation> {
    return this.http.post<PromoCodeValidation>(
      `${environment.apiUrl}/api/validate-promo`,
      { code, customerEmail, subtotal }
    );
  }
}
