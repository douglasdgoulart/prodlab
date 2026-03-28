export type UserRole = 'student' | 'teacher' | 'denied';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export type TrendType =
  | 'seasonal'
  | 'growth'
  | 'decline'
  | 'stable'
  | 'seasonal_growth'
  | 'seasonal_decline';

export type GroupStatus = 'forming' | 'complete';
export type MemberStatus = 'reserved' | 'confirmed';

export interface ProductFamily {
  id: string;
  name: string;
  trend_type: TrendType;
  created_by: string;
  created_at: string;
}

export interface Group {
  id: string;
  company_name: string | null;
  product_family_id: string | null;
  status: GroupStatus;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  student_id: string;
  status: MemberStatus;
  reserved_at: string;
  created_at: string;
}

export interface AvailableStudent {
  id: string;
  full_name: string | null;
}
