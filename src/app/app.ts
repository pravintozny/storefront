import { Component } from '@angular/core';
import { OwnerManagement } from './owners/owner-management';

@Component({
  imports: [OwnerManagement],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
