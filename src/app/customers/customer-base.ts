import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CustomerService } from './customer.service';

@Component({
  selector: 'app-customer-base',
  imports: [DatePipe],
  templateUrl: './customer-base.html',
  styleUrl: './customer-base.css',
})
export class CustomerBase {
  protected readonly customers = inject(CustomerService).getCustomers();
}
