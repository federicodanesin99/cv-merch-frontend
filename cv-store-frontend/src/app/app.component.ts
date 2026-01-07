import { Component, OnInit, inject } from '@angular/core';
import { inject as injectAnalytics } from '@vercel/analytics';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ProductService } from './core/services/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private productService = inject(ProductService); // ✅ Inietta ProductService

  ngOnInit() {
    injectAnalytics();
    
    console.log('🚀 App initialized');
    this.productService.loadProducts();
  }
}