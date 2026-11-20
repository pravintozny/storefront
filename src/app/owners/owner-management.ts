import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Owner, OwnerInput } from './owner.model';
import { OwnerService } from './owner.service';

const emptyForm = (): OwnerInput => ({ name: '', email: '', phone: '' });

@Component({
  selector: 'app-owner-management',
  imports: [FormsModule],
  templateUrl: './owner-management.html',
  styleUrl: './owner-management.css',
})
export class OwnerManagement {
  private readonly service = inject(OwnerService);
  protected readonly owners = this.service.owners;
  protected readonly editingId = signal<number | null>(null);
  protected form: OwnerInput = emptyForm();

  protected edit(owner: Owner): void {
    this.editingId.set(owner.id);
    const { id: _id, ...rest } = owner;
    this.form = rest;
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.form = emptyForm();
  }

  protected save(): void {
    const input: OwnerInput = {
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      phone: this.form.phone.trim(),
    };
    if (!input.name) return;
    const id = this.editingId();
    if (id === null) this.service.add(input);
    else this.service.update(id, input);
    this.cancel();
  }

  protected remove(owner: Owner): void {
    this.service.remove(owner.id);
    if (this.editingId() === owner.id) this.cancel();
  }
}
