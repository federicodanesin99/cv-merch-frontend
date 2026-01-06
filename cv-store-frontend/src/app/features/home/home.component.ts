import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../shared/components/hero/hero.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent],
  template: `
    <app-hero
      title="Scopri la Collezione"
      buttonText="Vai allo Shop →">
    </app-hero>
  `,
  styles: []
})
export class HomeComponent {
  constructor() {}
}