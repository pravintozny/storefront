import { Component, signal } from '@angular/core';
import { StoreDeletion } from './stores/store-deletion';

@Component({
  imports: [StoreDeletion],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('storefront');
}
