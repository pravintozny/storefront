import { Routes } from '@angular/router';
import { ProductDetail } from './product-detail/product-detail';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products/1' },
  { path: 'products/:id', component: ProductDetail },
];
