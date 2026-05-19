export type UserRole = 'admin' | 'manager' | 'agent';
export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface DemoUser {
  id: string;
  organizationId: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  organizationName: string;
  organizationSlug: string;
}

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  location: string | null;
  unit_count: number;
  base_rent_aed: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  tenant_id: string;
  amount_aed: string;
  status: InvoiceStatus;
  due_date: string | null;
  created_at: string;
  tenant_name?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: { organizationId: string; count: number };
}

export interface ApiError {
  error: string;
  code: string;
}

export interface RentRecommendation {
  recommended_rent_aed: number;
  explanation: string;
  inputs: {
    base_rent_aed: number;
    unit_count: number;
    location: string | null;
    occupancy_rate: number;
  };
}
