export type UserRole = 'student' | 'teacher' | 'denied';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}
