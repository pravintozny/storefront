import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ProductDetail } from './product-detail';
import { MOCK_PRODUCTS } from './product.mock';

async function render(id: string) {
  await TestBed.configureTestingModule({
    imports: [ProductDetail],
    providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(ProductDetail);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('ProductDetail', () => {
  it('renders name, SKU, price and enabled button for an in-stock product', async () => {
    const el = await render('1');
    expect(el.querySelector('.name')?.textContent).toContain(MOCK_PRODUCTS[0].name);
    expect(el.querySelector('.sku')?.textContent).toContain(MOCK_PRODUCTS[0].sku);
    expect(el.querySelector('.price')?.textContent).toContain('$59.90');
    expect(el.querySelector('.availability')?.textContent).toContain('In stock');
    expect(el.querySelector('button')?.disabled).toBe(false);
  });

  it('disables add to cart when out of stock', async () => {
    const el = await render('2');
    expect(el.querySelector('.availability')?.textContent).toContain('Out of stock');
    expect(el.querySelector('button')?.disabled).toBe(true);
  });

  it('shows not-found for unknown id', async () => {
    const el = await render('999');
    expect(el.querySelector('.not-found')).not.toBeNull();
  });
});
