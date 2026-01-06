import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Video Section -->
    <section class="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-black">
      <!-- Video Cloudinary -->
      <video 
        #videoPlayer
        loop 
        muted 
        playsinline
        preload="auto"
        (error)="onVideoError($event)"
        (loadeddata)="onVideoLoaded()"
        [class.opacity-0]="!videoLoaded"
        [class.opacity-100]="videoLoaded"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500">
        <source [src]="videoUrl" type="video/mp4">
        Il tuo browser non supporta i video HTML5.
      </video>

      <!-- Loading spinner -->
      <div *ngIf="!videoLoaded && !videoError" 
           class="absolute inset-0 flex items-center justify-center bg-black">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>

      <!-- Play button se autoplay è bloccato -->
      <div *ngIf="showPlayButton"
           (click)="forcePlay()"
           class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 cursor-pointer z-20 hover:bg-opacity-50 transition">
        <div class="text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition">
            <svg class="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
            </svg>
          </div>
          <p class="text-white text-lg font-semibold">Click per riprodurre</p>
        </div>
      </div>

      <!-- Error message -->
      <div *ngIf="videoError"
           class="absolute inset-0 bg-gray-900 flex items-center justify-center">
        <div class="text-center">
          <p class="text-white text-xl mb-4">❌ Impossibile caricare il video</p>
          <button 
            (click)="retryVideo()"
            class="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
            Riprova
          </button>
        </div>
      </div>

      <!-- Overlay con contenuto -->
      <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
        <div class="text-center text-white px-4">
          <h2 class="text-3xl md:text-5xl font-bold mb-4">
            {{ title }}
          </h2>
          <button 
            (click)="goToProducts()"
            class="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition transform hover:scale-105">
            {{ buttonText }}
          </button>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class HeroComponent implements AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  @Input() videoUrl = 'https://res.cloudinary.com/dr90huuw3/video/upload/f_mp4,q_auto/video-felpe_yr89hx.mp4';
  @Input() title = 'Scopri la Collezione';
  @Input() buttonText = 'Vai allo Shop →';
  
  videoLoaded = false;
  videoError = false;
  isPlaying = false;
  showPlayButton = false;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.attemptAutoplay();
    }, 100);
  }

  async attemptAutoplay(): Promise<void> {
    const video = this.videoPlayer.nativeElement;
    
    console.log('🎬 Tentativo autoplay...');
    
    try {
      video.muted = true;
      await video.play();
      
      console.log('✅ Autoplay riuscito');
      this.isPlaying = true;
      this.showPlayButton = false;
      
    } catch (error) {
      console.warn('⚠️ Autoplay bloccato dal browser:', error);
      this.showPlayButton = true;
      this.isPlaying = false;
    }
  }

  async forcePlay(): Promise<void> {
    const video = this.videoPlayer.nativeElement;
    
    console.log('▶️ Play manuale forzato');
    
    try {
      video.muted = true;
      await video.play();
      
      this.isPlaying = true;
      this.showPlayButton = false;
      console.log('✅ Video in riproduzione');
      
    } catch (error) {
      console.error('❌ Impossibile riprodurre:', error);
      this.videoError = true;
    }
  }

  onVideoLoaded(): void {
    console.log('📹 Video dati caricati');
    this.videoLoaded = true;
  }

  onVideoError(event: any): void {
    console.error('❌ Errore video:', event);
    this.videoError = true;
    this.videoLoaded = false;
  }

  retryVideo(): void {
    console.log('🔄 Retry video...');
    this.videoError = false;
    this.videoLoaded = false;
    
    const video = this.videoPlayer.nativeElement;
    video.load();
    
    setTimeout(() => {
      this.attemptAutoplay();
    }, 500);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}