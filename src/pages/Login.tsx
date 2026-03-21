import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../hooks/use-auth';

export function Login() {
  const { isAuthenticated, role, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'student') navigate('/dashboard', { replace: true });
      else if (role === 'teacher') navigate('/admin', { replace: true });
      else if (role === 'denied') navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}
          >
            ProdLab
          </CardTitle>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-muted)' }}
          >
            Laboratório Didático de PCP
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={signInWithGoogle}
            className="w-full h-12 text-base font-semibold"
            style={{
              fontFamily: 'var(--font-action)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
            }}
          >
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
