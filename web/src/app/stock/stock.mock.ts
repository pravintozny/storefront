export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface StockItem {
  sku: string;
  name: string;
  quantity: number;
}

export const LOW_STOCK_THRESHOLD = 10;

export function getStatus(quantity: number): StockStatus {
  if (quantity <= 0) return 'out-of-stock';
  return quantity < LOW_STOCK_THRESHOLD ? 'low-stock' : 'in-stock';
}

export const MOCK_STOCK: StockItem[] = [
  { sku: 'TSH-001', name: 'Classic T-Shirt', quantity: 120 },
  { sku: 'MUG-014', name: 'Ceramic Mug', quantity: 7 },
  { sku: 'CAP-203', name: 'Baseball Cap', quantity: 0 },
  { sku: 'BAG-077', name: 'Canvas Tote Bag', quantity: 45 },
];
