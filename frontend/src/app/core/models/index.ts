export interface User { id: string; name: string; email: string; currency: string; }
export interface AuthResponse { token: string; user: User; }

export interface Category {
  _id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank';
export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: Category | string;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface DashboardSummary {
  totalThisMonth: number;
  totalToday: number;
  averageDaily: number;
  daysElapsed: number;
  highestCategory: {
    id: string;
    name: string;
    icon?: string;
    color: string;
    total: number;
    share: number;
  } | null;
}
