import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import type { UserRole } from '../types';

interface RoleRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export function RoleRoute({ children, allowedRole }: RoleRouteProps) {
  const { role, isDenied } = useAuth();

  if (isDenied) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
