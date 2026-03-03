export type UserRole = 'admin' | 'customer' | 'moderator';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  lastLogin?: string;
  createdAt: string;
  address?: {
    street: string;
    city: string;
    country: string;
  };
}
