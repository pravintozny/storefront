import { TestBed } from '@angular/core/testing';
import { StoreManagement } from './store-management';
import { StoreService } from './store.service';

describe('StoreManagement', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StoreManagement] }).compileComponents();
  });

  it('lists the seeded stores', async () => {
    const fixture = TestBed.createComponent(StoreManagement);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr').length).toBe(3);
  });

  it('service adds, updates and removes stores', () => {
    const svc = TestBed.inject(StoreService);
    svc.add({ name: 'X', location: 'Y', manager: 'Z', status: 'open' });
    expect(svc.stores().length).toBe(4);
    const id = svc.stores()[3].id;
    svc.update(id, { name: 'X2', location: 'Y', manager: 'Z', status: 'closed' });
    expect(svc.stores()[3].name).toBe('X2');
    svc.remove(id);
    expect(svc.stores().length).toBe(3);
  });
});
