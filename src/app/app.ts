import { Component, signal } from '@angular/core';
import { StoreCreation } from './stores/store-creation';

@Component({
  imports: [StoreCreation],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('storefront');
}
