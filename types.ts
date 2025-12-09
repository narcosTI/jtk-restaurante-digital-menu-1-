export interface MenuData {
  restaurantName: string;
  title: string; // e.g., "Almoço de Hoje"
  items: string[];
  price: number;
  phone: string;
}

export interface LoadingState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
}

export interface Order {
  id: string;
  customerName: string;
  tableName?: string; // Campo novo
  observation?: string; // Campo novo
  items: string[];
  timestamp: Date;
  status: 'pending' | 'preparing' | 'completed';
}

export interface DessertCategory {
  title: string;
  items: string[];
}

export type UserRole = 'admin' | 'kitchen' | 'waiter' | 'customer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
}