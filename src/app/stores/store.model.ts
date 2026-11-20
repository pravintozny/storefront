export type StoreStatus = 'open' | 'closed';

export interface Store {
  id: number;
  name: string;
  location: string;
  manager: string;
  status: StoreStatus;
}

export type StoreInput = Omit<Store, 'id'>;
