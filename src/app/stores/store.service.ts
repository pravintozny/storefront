import { Injectable, signal } from '@angular/core';
import { Store } from './store.model';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly _stores = signal<Store[]>([
    { id: 1, name: 'Urban Threads', category: 'Fashion', email: 'hello@urbanthreads.test', description: 'Streetwear basics.' },
    { id: 2, name: 'Gadget Hub', category: 'Electronics', email: 'sales@gadgethub.test', description: 'Latest gadgets.' },
    { id: 3, name: 'Book Nook', category: 'Books', email: 'hi@booknook.test', description: 'Used and new books.' },
  ]);
  readonly stores = this._stores.asReadonly();

  /** Removes a store by id. Returns true if something was deleted. */
  delete(id: number): boolean {
    const exists = this._stores().some((s) => s.id === id);
    if (exists) this._stores.update((list) => list.filter((s) => s.id !== id));
    return exists;
  }
}
