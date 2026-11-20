import { TestBed } from '@angular/core/testing';
import { OwnerManagement } from './owner-management';
import { OwnerService } from './owner.service';

describe('OwnerManagement', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OwnerManagement] }).compileComponents();
  });

  it('lists the seeded owners', async () => {
    const fixture = TestBed.createComponent(OwnerManagement);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr').length).toBe(3);
  });

  it('service adds, updates and removes owners', () => {
    const svc = TestBed.inject(OwnerService);
    svc.add({ name: 'X', email: 'x@example.com', phone: '1' });
    expect(svc.owners().length).toBe(4);
    const id = svc.owners()[3].id;
    svc.update(id, { name: 'X2', email: 'x@example.com', phone: '1' });
    expect(svc.owners()[3].name).toBe('X2');
    svc.remove(id);
    expect(svc.owners().length).toBe(3);
  });

  it('removes a row when Delete is clicked', async () => {
    const fixture = TestBed.createComponent(OwnerManagement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll<HTMLButtonElement>('tbody tr:first-child button');
    buttons[1].click();
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr').length).toBe(2);
  });
});
