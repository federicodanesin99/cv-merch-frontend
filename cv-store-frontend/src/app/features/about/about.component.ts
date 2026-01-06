import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-6xl font-bold mb-4">CLASSE VENETA</h1>
          <p class="text-xl md:text-2xl text-gray-700 font-medium">Rap Veneziano. Merch Autentico.</p>
        </div>

        <!-- Contenuto Principale -->
        <div class="space-y-8">
          
          <!-- Chi Siamo -->
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-3xl font-bold mb-6">Chi Siamo</h2>
            <p class="text-gray-700 text-lg leading-relaxed mb-4">
              Siamo <strong>Carma</strong>, <strong>Dr Nesio</strong> e <strong>Joe Panzer</strong> — 
              tre MC veneziani che nel 2024 hanno pubblicato il loro primo disco: <strong>L'Avidità</strong>.
            </p>
            <p class="text-gray-700 text-lg leading-relaxed mb-4">
              Questo è il nostro store ufficiale. Qui trovi tutto il merchandise che produciamo con 
              l'<strong>AvidiTeam</strong>, la nostra famiglia di grafici e media manager che ci 
              affianca in ogni progetto. Non siamo un brand qualsiasi: siamo noi, la nostra crew, 
              il nostro sound.
            </p>
            <p class="text-gray-700 text-lg leading-relaxed">
              Ogni capo che vedi qui è stato pensato, disegnato e realizzato da chi vive questa 
              musica ogni giorno. Indossare CLASSE VENETA significa far parte della famiglia.
            </p>
          </div>

          <!-- L'Avidità -->
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-3xl font-bold mb-6">L'Avidità (2024)</h2>
            <p class="text-gray-700 text-lg leading-relaxed mb-4">
              Il nostro primo disco. Venezia che suona, la strada che parla, le nostre storie 
              che diventano barre. <strong>L'Avidità</strong> è il punto di partenza, ma solo l'inizio.
            </p>
            <p class="text-gray-700 text-lg leading-relaxed mb-6">
              Se non l'hai ancora ascoltato, che aspetti? 
            </p>
            <a href="https://open.spotify.com/intl-it/artist/6gU0ekiWRthA9e7a1lizG8?si=Q9fd-TFkRpCIJDahq3AZoQ" 
               target="_blank" 
               rel="noopener"
               class="inline-flex items-center gap-3 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Ascolta su Spotify
            </a>
          </div>

          <!-- AvidiTeam -->
          <div class="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg shadow-sm p-8">
            <h2 class="text-3xl font-bold mb-4">AvidiTeam</h2>
            <p class="text-lg leading-relaxed mb-4">
              Il merchandise che vedi qui non è fatto da estranei. È creato dall'<strong>AvidiTeam</strong>, 
              il collettivo di grafici, designer e media manager che sono parte integrante del progetto.
            </p>
            <p class="text-lg leading-relaxed">
              Amici, fratelli, famiglia. Insieme portiamo CLASSE VENETA ovunque, dal palco alla strada, 
              dalla musica al merch. Questo è il risultato: qualità, autenticità, zero compromessi.
            </p>
          </div>

          <!-- CTA Finale -->
          <div class="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 class="text-2xl md:text-3xl font-bold mb-4">
              Resta Connesso
            </h2>
            <p class="text-gray-700 text-lg mb-6">
              Seguici sui social per rimanere aggiornato su nuovi drop, date live e progetti futuri. 
              La famiglia cresce ogni giorno.
            </p>
            
            <!-- Bottone Pulsante che Scrolla al Footer -->
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
            
            <p class="text-sm text-gray-500 mt-4">
              Tutti i link in fondo alla pagina ↓
            </p>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class AboutComponent {
  scrollToFooter(): void {
    // Scrolla smoothly al footer
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }
}