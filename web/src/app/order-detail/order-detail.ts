import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MOCK_ORDERS, lineTotal, orderSubtotal, orderTotal } from './order.mock';

@Component({
  selector: 'app-order-detail',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly order = computed(() => MOCK_ORDERS.find((o) => o.id === this.id));
  protected readonly lineTotal = lineTotal;
  protected readonly subtotal = computed(() => {
    const o = this.order();
    return o ? orderSubtotal(o) : 0;
  });
  protected readonly total = computed(() => {
    const o = this.order();
    return o ? orderTotal(o) : 0;
  });
}
