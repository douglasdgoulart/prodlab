import { useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setAuth, setLoading, setInitialized, fetchRole } = useAuthStore();

  useEffect(() => {
    // 1. Recuperar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await fetchRole(session.user.id);
        setAuth(session.user, role);
      }
      setLoading(false);
      setInitialized();
    });

    // 2. Escutar mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const role = await fetchRole(session.user.id);
        setAuth(session.user, role);
      } else if (event === 'SIGNED_OUT') {
        setAuth(null, null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setAuth, setLoading, setInitialized, fetchRole]);

  return <>{children}</>;
}
