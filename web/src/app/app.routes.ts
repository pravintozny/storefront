import { Routes } from '@angular/router';
import { OrderDetail } from './order-detail/order-detail';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders/1' },
  { path: 'orders/:id', component: OrderDetail },
];
