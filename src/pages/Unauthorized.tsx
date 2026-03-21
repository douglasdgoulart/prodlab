import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../stores/auth-store';
import { useNavigate } from 'react-router-dom';

export function Unauthorized() {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleGoBack = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle
            className="text-xl font-bold"
            style={{ color: 'var(--color-error)', fontFamily: 'var(--font-heading)' }}
          >
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            Apenas emails institucionais (@al.unieduk.com.br) podem acessar o ProdLab.
          </p>
          <Button
            onClick={handleGoBack}
            className="w-full"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-action)',
            }}
          >
            Voltar para o login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
