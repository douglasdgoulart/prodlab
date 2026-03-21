import { useAuthStore } from '../stores/auth-store';

export function useAuth() {
  const { user, role, loading, initialized, signInWithGoogle, signOut } =
    useAuthStore();

  return {
    user,
    role,
    loading,
    initialized,
    isAuthenticated: !!user,
    isStudent: role === 'student',
    isTeacher: role === 'teacher',
    isDenied: role === 'denied',
    signInWithGoogle,
    signOut,
  };
}
