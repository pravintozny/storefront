import { Component, inject, signal } from '@angular/core';
import { Store } from './store.model';
import { StoreService } from './store.service';

@Component({
  selector: 'app-store-deletion',
  templateUrl: './store-deletion.html',
  styleUrl: './store-deletion.css',
})
export class StoreDeletion {
  protected readonly service = inject(StoreService);
  readonly pending = signal<Store | null>(null);
  readonly message = signal('');

  requestDelete(store: Store): void {
    this.pending.set(store);
    this.message.set('');
  }

  cancel(): void {
    this.pending.set(null);
  }

  confirm(): void {
    const store = this.pending();
    if (!store) return;
    if (this.service.delete(store.id)) {
      this.message.set(`Deleted "${store.name}".`);
    }
    this.pending.set(null);
  }
}
