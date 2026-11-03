export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  currency: string;
  inStock: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Canvas Backpack', sku: 'BP-001', description: 'Durable 20L canvas backpack with laptop sleeve.', price: 59.9, currency: 'USD', inStock: true },
  { id: '2', name: 'Steel Water Bottle', sku: 'WB-002', description: 'Insulated 750ml bottle, keeps drinks cold for 24h.', price: 24.5, currency: 'USD', inStock: false },
];
