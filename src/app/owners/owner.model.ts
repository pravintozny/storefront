export interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export type OwnerInput = Omit<Owner, 'id'>;
