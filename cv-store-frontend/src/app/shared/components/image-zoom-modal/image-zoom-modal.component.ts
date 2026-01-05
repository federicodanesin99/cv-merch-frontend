import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-zoom-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
         (click)="close.emit()"
         class="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center p-5">
      <button (click)="close.emit()" 
              class="absolute top-5 right-5 bg-white text-black w-10 h-10 rounded-full text-xl font-bold">
        ✕
      </button>
      <img [src]="imageUrl" alt="Zoom" class="max-w-full max-h-[90vh] object-contain">
    </div>
  `,
  styles: []
})
export class ImageZoomModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() imageUrl = '';
  @Output() close = new EventEmitter<void>();

  ngOnChanges(): void {
    // Blocca/sblocca scroll quando si apre/chiude
    document.body.style.overflow = this.isOpen ? 'hidden' : 'auto';
  }
}
