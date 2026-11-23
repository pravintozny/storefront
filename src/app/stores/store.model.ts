export interface Store {
  id: number;
  name: string;
  category: string;
  email: string;
  description: string;
}

export type NewStore = Omit<Store, 'id'>;
