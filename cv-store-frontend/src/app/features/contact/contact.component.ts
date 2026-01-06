import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-3xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Contattaci</h1>
          <p class="text-lg text-gray-600">Siamo qui per aiutarti</p>
        </div>

        <!-- Info Contatti -->
        <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div class="space-y-6">
            
            <!-- Email -->
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">Email</h3>
                <a href="mailto:classeveneta@gmail.com" 
                   class="text-gray-600 hover:text-black transition">
                  classeveneta@gmail.com
                </a>
              </div>
            </div>


          </div>
        </div>

        <!-- Social Media -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Contattaci sui Social</h2>
          <div class="flex justify-center gap-4">
            <button
              (click)="scrollToFooter()"
              class="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition transform hover:scale-105 animate-pulse">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Vai ai Nostri Social
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class ContactComponent {
      scrollToFooter(): void {
    // Scrolla smoothly al footer
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }
}
