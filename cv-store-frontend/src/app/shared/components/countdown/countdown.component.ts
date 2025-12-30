import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!isExpired" 
         class="bg-gradient-to-r from-red-600 to-orange-600 text-white sticky top-0 z-50 shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
          <div class="flex items-center gap-2 text-sm md:text-base font-semibold">
            <span class="text-xl md:text-2xl animate-pulse">🔥</span>
            <span class="text-xl md:inline">OFFERTA LANCIO TERMINA TRA:</span>
          </div>
          
          <div class="flex gap-2 md:gap-3">
            <div class="flex flex-col items-center">
              <div class="bg-white text-red-600 font-bold text-xl md:text-3xl px-3 md:px-4 py-2 md:py-3 rounded-lg min-w-[50px] md:min-w-[70px] text-center shadow-lg">
                {{ days }}
              </div>
              <span class="text-xs mt-1 font-medium">giorni</span>
            </div>
            
            <div class="flex flex-col items-center">
              <div class="bg-white text-red-600 font-bold text-xl md:text-3xl px-3 md:px-4 py-2 md:py-3 rounded-lg min-w-[50px] md:min-w-[70px] text-center shadow-lg">
                {{ hours }}
              </div>
              <span class="text-xs mt-1 font-medium">ore</span>
            </div>
            
            <div class="flex flex-col items-center">
              <div class="bg-white text-red-600 font-bold text-xl md:text-3xl px-3 md:px-4 py-2 md:py-3 rounded-lg min-w-[50px] md:min-w-[70px] text-center shadow-lg">
                {{ minutes }}
              </div>
              <span class="text-xs mt-1 font-medium">min</span>
            </div>
            
            <div class="flex flex-col items-center">
              <div class="bg-white text-red-600 font-bold text-xl md:text-3xl px-3 md:px-4 py-2 md:py-3 rounded-lg min-w-[50px] md:min-w-[70px] text-center shadow-lg">
                {{ seconds }}
              </div>
              <span class="text-xs mt-1 font-medium">sec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CountdownComponent implements OnInit, OnDestroy {
  days = '00';
  hours = '00';
  minutes = '00';
  seconds = '00';
  isExpired = false;

  private interval: any;
  private countdownEndDate = new Date('2025-12-03T23:59:59').getTime();

  ngOnInit(): void {
    this.updateCountdown();
    this.interval = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const distance = this.countdownEndDate - now;
    
    if (distance < 0) {
      this.isExpired = true;
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    this.days = String(days).padStart(2, '0');
    this.hours = String(hours).padStart(2, '0');
    this.minutes = String(minutes).padStart(2, '0');
    this.seconds = String(seconds).padStart(2, '0');
  }
}
