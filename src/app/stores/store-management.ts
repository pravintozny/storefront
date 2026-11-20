import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store, StoreInput, StoreStatus } from './store.model';
import { StoreService } from './store.service';

const emptyForm = (): StoreInput => ({ name: '', location: '', manager: '', status: 'open' });

@Component({
  selector: 'app-store-management',
  imports: [FormsModule],
  templateUrl: './store-management.html',
  styleUrl: './store-management.css',
})
export class StoreManagement {
  private readonly service = inject(StoreService);
  protected readonly stores = this.service.stores;
  protected readonly statuses: StoreStatus[] = ['open', 'closed'];
  protected readonly editingId = signal<number | null>(null);
  protected form: StoreInput = emptyForm();

  protected edit(store: Store): void {
    this.editingId.set(store.id);
    const { id: _id, ...rest } = store;
    this.form = rest;
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.form = emptyForm();
  }

  protected save(): void {
    const input: StoreInput = {
      ...this.form,
      name: this.form.name.trim(),
      location: this.form.location.trim(),
      manager: this.form.manager.trim(),
    };
    if (!input.name || !input.location) return;
    const id = this.editingId();
    if (id === null) this.service.add(input);
    else this.service.update(id, input);
    this.cancel();
  }

  protected remove(store: Store): void {
    this.service.remove(store.id);
    if (this.editingId() === store.id) this.cancel();
  }
}
