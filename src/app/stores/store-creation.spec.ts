import { TestBed } from '@angular/core/testing';
import { StoreCreation } from './store-creation';
import { StoreService } from './store.service';

describe('StoreCreation', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [StoreCreation] }).compileComponents());

  it('rejects an invalid form', () => {
    const fixture = TestBed.createComponent(StoreCreation);
    const svc = TestBed.inject(StoreService);
    const before = svc.stores().length;
    fixture.componentInstance.submit();
    expect(svc.stores().length).toBe(before);
  });

  it('creates a store from valid input', () => {
    const fixture = TestBed.createComponent(StoreCreation);
    const svc = TestBed.inject(StoreService);
    const before = svc.stores().length;
    fixture.componentInstance.form.setValue({
      name: 'Book Nook', category: 'Books', email: 'hi@booknook.test', description: '',
    });
    fixture.componentInstance.submit();
    expect(svc.stores().length).toBe(before + 1);
    expect(svc.stores().at(-1)?.name).toBe('Book Nook');
  });
});
