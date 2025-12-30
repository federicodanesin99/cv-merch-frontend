import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderRequest, OrderResponse, PromoCodeValidation } from '../models/order.model';

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