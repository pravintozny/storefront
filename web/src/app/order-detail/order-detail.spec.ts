import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { OrderDetail } from './order-detail';
import { MOCK_ORDERS, lineTotal, orderTotal } from './order.mock';

async function render(id: string) {
  await TestBed.configureTestingModule({
    imports: [OrderDetail],
    providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(OrderDetail);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('OrderDetail', () => {
  it('renders base info: number, date, status, customer', async () => {
    const el = await render('1');
    expect(el.querySelector('.order-number')?.textContent).toContain('ORD-1001');
    expect(el.querySelector('.order-date')?.textContent).toContain('Oct 28, 2026');
    expect(el.querySelector('.status')?.textContent).toContain('shipped');
    expect(el.querySelector('.customer')?.textContent).toContain('Ada Lovelace');
  });

  it('renders every order line with product, SKU, qty, unit price and line total', async () => {
    const el = await render('1');
    const rows = el.querySelectorAll('.line');
    expect(rows.length).toBe(MOCK_ORDERS[0].lines.length);
    expect(rows[0].querySelector('.product')?.textContent).toContain('Canvas Backpack');
    expect(rows[0].querySelector('.line-sku')?.textContent).toContain('BP-001');
    expect(rows[0].querySelector('.qty')?.textContent).toContain('2');
    expect(rows[0].querySelector('.unit-price')?.textContent).toContain('$59.90');
    expect(rows[0].querySelector('.line-total')?.textContent).toContain('$119.80');
    expect(rows[1].querySelector('.line-total')?.textContent).toContain('$24.50');
  });

  it('renders subtotal, shipping, tax and total', async () => {
    const el = await render('1');
    expect(el.querySelector('.subtotal')?.textContent).toContain('$144.30');
    expect(el.querySelector('.shipping')?.textContent).toContain('$5.00');
    expect(el.querySelector('.tax')?.textContent).toContain('$9.50');
    expect(el.querySelector('.total')?.textContent).toContain('$158.80');
  });

  it('computes totals correctly', () => {
    expect(lineTotal(MOCK_ORDERS[1].lines[0])).toBe(73.5);
    expect(orderTotal(MOCK_ORDERS[1])).toBe(78.4);
  });

  it('shows not-found for unknown id', async () => {
    const el = await render('999');
    expect(el.querySelector('.not-found')).not.toBeNull();
  });
});
