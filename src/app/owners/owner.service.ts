import { Injectable, signal } from '@angular/core';
import { Owner, OwnerInput } from './owner.model';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  private nextId = 4;
  private readonly _owners = signal<Owner[]>([
    { id: 1, name: 'Ava Thompson', email: 'ava.thompson@example.com', phone: '555-0101' },
    { id: 2, name: 'Liam Carter', email: 'liam.carter@example.com', phone: '555-0102' },
    { id: 3, name: 'Noah Patel', email: 'noah.patel@example.com', phone: '555-0103' },
  ]);

  readonly owners = this._owners.asReadonly();

  add(input: OwnerInput): void {
    this._owners.update((o) => [...o, { ...input, id: this.nextId++ }]);
  }

  update(id: number, input: OwnerInput): void {
    this._owners.update((o) => o.map((x) => (x.id === id ? { ...input, id } : x)));
  }

  remove(id: number): void {
    this._owners.update((o) => o.filter((x) => x.id !== id));
  }
}
