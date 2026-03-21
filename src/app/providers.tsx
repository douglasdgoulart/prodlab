import type { ReactNode } from 'react';

// Auth bootstrap happens at module level in stores/auth-store.ts
// This provider exists as a structural wrapper for future providers (theme, etc.)

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}
