import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-size-guide-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
         (click)="close.emit()"
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6" 
           (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Guida alle Taglie</h3>
          <button (click)="close.emit()" 
                  class="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        <div class="text-sm text-gray-700" [innerHTML]="content"></div>
      </div>
    </div>
  `,
  styles: []
})
export class SizeGuideModalComponent {
  @Input() isOpen = false;
  @Input() content = '';
  @Output() close = new EventEmitter<void>();
}
