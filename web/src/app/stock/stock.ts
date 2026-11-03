import { Component, computed, signal } from '@angular/core';
import { MOCK_STOCK, StockItem, StockStatus, getStatus } from './stock.mock';

const STATUS_LABELS: Record<StockStatus, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
};

@Component({
  selector: 'app-stock',
  templateUrl: './stock.html',
  styleUrl: './stock.css',
})
export class Stock {
  protected readonly items = signal<StockItem[]>(MOCK_STOCK);
  protected readonly rows = computed(() =>
    this.items().map((item) => {
      const status = getStatus(item.quantity);
      return { ...item, status, statusLabel: STATUS_LABELS[status] };
    }),
  );
}
