export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string; // ISO 8601
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  currency: string;
  lines: OrderLine[];
  shipping: number;
  tax: number;
}

export function lineTotal(line: OrderLine): number {
  return Math.round(line.quantity * line.unitPrice * 100) / 100;
}

export function orderSubtotal(order: Order): number {
  return order.lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

export function orderTotal(order: Order): number {
  return Math.round((orderSubtotal(order) + order.shipping + order.tax) * 100) / 100;
}

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-1001',
    orderDate: '2026-10-28T09:30:00Z',
    status: 'shipped',
    customerName: 'Ada Lovelace',
    customerEmail: 'ada@example.com',
    currency: 'USD',
    shipping: 5,
    tax: 9.5,
    lines: [
      { productId: '1', productName: 'Canvas Backpack', sku: 'BP-001', quantity: 2, unitPrice: 59.9 },
      { productId: '2', productName: 'Steel Water Bottle', sku: 'WB-002', quantity: 1, unitPrice: 24.5 },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-1002',
    orderDate: '2026-11-01T14:05:00Z',
    status: 'pending',
    customerName: 'Grace Hopper',
    customerEmail: 'grace@example.com',
    currency: 'USD',
    shipping: 0,
    tax: 4.9,
    lines: [{ productId: '2', productName: 'Steel Water Bottle', sku: 'WB-002', quantity: 3, unitPrice: 24.5 }],
  },
];
