import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MOCK_CATEGORIES, StoreService } from './store.service';

@Component({
  selector: 'app-store-creation',
  imports: [ReactiveFormsModule],
  templateUrl: './store-creation.html',
  styleUrl: './store-creation.css',
})
export class StoreCreation {
  private readonly fb = inject(FormBuilder);
  protected readonly storeService = inject(StoreService);
  protected readonly categories = MOCK_CATEGORIES;
  protected readonly created = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    description: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const store = this.storeService.create(this.form.getRawValue());
    this.created.set(store.name);
    this.form.reset();
  }
}
