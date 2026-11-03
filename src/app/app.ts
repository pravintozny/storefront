import { Component } from '@angular/core';
import { CustomerBase } from './customers/customer-base';

@Component({
  imports: [CustomerBase],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
