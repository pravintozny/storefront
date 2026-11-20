import { Injectable, signal } from '@angular/core';
import { Store, StoreInput } from './store.model';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private nextId = 4;
  private readonly _stores = signal<Store[]>([
    { id: 1, name: 'Downtown Flagship', location: 'New York, NY', manager: 'Ava Thompson', status: 'open' },
    { id: 2, name: 'Lakeside Outlet', location: 'Chicago, IL', manager: 'Liam Carter', status: 'open' },
    { id: 3, name: 'Harbor Pop-up', location: 'Seattle, WA', manager: 'Noah Patel', status: 'closed' },
  ]);

  readonly stores = this._stores.asReadonly();

  add(input: StoreInput): void {
    this._stores.update((s) => [...s, { ...input, id: this.nextId++ }]);
  }

  update(id: number, input: StoreInput): void {
    this._stores.update((s) => s.map((x) => (x.id === id ? { ...input, id } : x)));
  }

  remove(id: number): void {
    this._stores.update((s) => s.filter((x) => x.id !== id));
  }
}
