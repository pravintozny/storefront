import { TestBed } from '@angular/core/testing';
import { CustomerBase } from './customer-base';
import { MOCK_CUSTOMERS } from './customer.service';

describe('CustomerBase', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CustomerBase] }).compileComponents();
  });

  it('should create', () => {
    expect(TestBed.createComponent(CustomerBase).componentInstance).toBeTruthy();
  });

  it('should render a row per mock customer with details', async () => {
    const fixture = TestBed.createComponent(CustomerBase);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toContain('Customer Base');
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(MOCK_CUSTOMERS.length);
    const first = rows[0];
    expect(first.querySelector('.name')?.textContent).toContain(MOCK_CUSTOMERS[0].name);
    expect(first.querySelector('.email')?.textContent).toContain(MOCK_CUSTOMERS[0].email);
    expect(first.querySelector('.status')?.textContent).toContain(MOCK_CUSTOMERS[0].status);
    expect(first.querySelector('.joined')?.textContent).toContain('Jan 15, 2024');
  });
});
