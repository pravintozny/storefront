import { TestBed } from '@angular/core/testing';
import { Stock } from './stock';
import { MOCK_STOCK, getStatus } from './stock.mock';

describe('Stock', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Stock] }).compileComponents();
  });

  it('should render a row per mock item with name, SKU and quantity', async () => {
    const fixture = TestBed.createComponent(Stock);
    await fixture.whenStable();
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(MOCK_STOCK.length);
    expect(rows[0].querySelector('.name')?.textContent).toContain(MOCK_STOCK[0].name);
    expect(rows[0].querySelector('.sku')?.textContent).toContain(MOCK_STOCK[0].sku);
    expect(rows[0].querySelector('.quantity')?.textContent).toContain(String(MOCK_STOCK[0].quantity));
  });

  it('should show the status label for each item', async () => {
    const fixture = TestBed.createComponent(Stock);
    await fixture.whenStable();
    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.status'),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual(['In stock', 'Low stock', 'Out of stock', 'In stock']);
  });

  it('should derive status from quantity', () => {
    expect(getStatus(0)).toBe('out-of-stock');
    expect(getStatus(9)).toBe('low-stock');
    expect(getStatus(10)).toBe('in-stock');
  });
});
