
export type UserRole = 'admin' | 'merchant' | null;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  merchant_id?: string;
}

export interface Merchant {
  id: string;
  created_at: string;
  name: string;
  address: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  user_id: string;
}

export interface Offer {
  id: string;
  created_at: string;
  title: string;
  description: string;
  discount: number | null;
  start_date: string;
  end_date: string;
  conditions: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  merchant_id: string;
  merchant_name?: string;
}

export interface DashboardStats {
  totalMerchants: number;
  totalOffers: number;
  pendingOffers: number;
  approvedOffers: number;
}
