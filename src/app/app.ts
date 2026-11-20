import { Component } from '@angular/core';
import { StoreManagement } from './stores/store-management';

@Component({
  imports: [StoreManagement],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
