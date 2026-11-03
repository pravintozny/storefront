export type CustomerStatus = 'active' | 'inactive' | 'pending';

export interface Customer {
  id: number;
  name: string;
  email: string;
  status: CustomerStatus;
  joinedDate: string; // ISO date (YYYY-MM-DD)
}
