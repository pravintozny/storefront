import { Injectable, signal } from '@angular/core';
import { NewStore, Store } from './store.model';

export const MOCK_CATEGORIES = ['Fashion', 'Electronics', 'Home & Garden', 'Books', 'Food'];

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly _stores = signal<Store[]>([
    { id: 1, name: 'Urban Threads', category: 'Fashion', email: 'hello@urbanthreads.test', description: 'Streetwear basics.' },
    { id: 2, name: 'Gadget Hub', category: 'Electronics', email: 'sales@gadgethub.test', description: 'Latest gadgets.' },
  ]);
  readonly stores = this._stores.asReadonly();

  create(input: NewStore): Store {
    const id = Math.max(0, ...this._stores().map((s) => s.id)) + 1;
    const store: Store = { ...input, id };
    this._stores.update((list) => [...list, store]);
    return store;
  }
}
