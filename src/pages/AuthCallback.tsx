import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth-store';

export function AuthCallback() {
  const navigate = useNavigate();
  const { fetchRole, setAuth } = useAuthStore();

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).then(async ({ data, error }) => {
      if (error || !data.session) {
        navigate('/', { replace: true });
        return;
      }

      const user = data.session.user;
      const role = await fetchRole(user.id);

      if (role === 'denied' || !role) {
        await supabase.auth.signOut();
        setAuth(null, null);
        navigate('/unauthorized', { replace: true });
        return;
      }

      setAuth(user, role);

      if (role === 'student') navigate('/dashboard', { replace: true });
      else if (role === 'teacher') navigate('/admin', { replace: true });
    });
  }, [navigate, fetchRole, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full" />
    </div>
  );
}
