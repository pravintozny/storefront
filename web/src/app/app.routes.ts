import { Routes } from '@angular/router';
import { Stock } from './stock/stock';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'stock' },
  { path: 'stock', component: Stock },
];
