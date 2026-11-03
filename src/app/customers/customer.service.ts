import { Injectable } from '@angular/core';
import { Customer } from './customer.model';

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 1, name: 'Ava Thompson', email: 'ava.thompson@example.com', status: 'active', joinedDate: '2024-01-15' },
  { id: 2, name: 'Liam Carter', email: 'liam.carter@example.com', status: 'active', joinedDate: '2024-03-02' },
  { id: 3, name: 'Noah Patel', email: 'noah.patel@example.com', status: 'pending', joinedDate: '2024-06-21' },
  { id: 4, name: 'Mia Rodriguez', email: 'mia.rodriguez@example.com', status: 'inactive', joinedDate: '2023-11-09' },
  { id: 5, name: 'Ethan Kim', email: 'ethan.kim@example.com', status: 'active', joinedDate: '2025-02-28' },
];

@Injectable({ providedIn: 'root' })
export class CustomerService {
  getCustomers(): Customer[] {
    return MOCK_CUSTOMERS;
  }
}
