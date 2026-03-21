import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../hooks/use-auth';
import { ProdLabLogo } from '../components/ProdLabLogo';
import { GoogleIcon } from '../components/icons/GoogleIcon';

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl shadow-md md:grid-cols-2">
        {/* Left panel — hero */}
        <div className="relative flex flex-col justify-between bg-gradient-to-br from-background to-accent/10 p-8 md:p-10">
          <div>
            <ProdLabLogo />

            <h1 className="mt-8 font-heading text-3xl font-bold leading-tight text-primary md:text-4xl">
              Domine a lógica do{' '}
              <span className="inline-block bg-accent px-2 text-primary">
                PCP na prática.
              </span>
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Uma plataforma educacional guiada para simulação de MRP II, onde cada uma de suas
              decisões impacta toda a cadeia produtiva.
            </p>
          </div>

          <div className="mt-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Um oferecimento:
            </p>
            <div className="mt-3 flex items-center gap-6">
              <img
                src="/logo-unimax.svg"
                alt="UniMAX - Grupo UniEduK"
                className="h-10 opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Right panel — login form */}
        <Card className="flex flex-col items-center justify-center border-0 shadow-none rounded-none p-8 md:p-10">
          <CardHeader className="w-full max-w-sm p-0 text-left">
            <CardTitle className="font-heading text-xl font-bold text-primary">
              Acesso ao Laboratório
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Identifique-se com sua conta institucional.
            </p>
          </CardHeader>

          <CardContent className="mt-8 w-full max-w-sm p-0">
            <Button
              onClick={signInWithGoogle}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-primary text-sm font-semibold text-primary-foreground font-action hover:bg-primary/90"
            >
              <GoogleIcon className="h-5 w-5" />
              Acessar com Google
            </Button>

            <Separator className="my-6" />

            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Ao entrar, você concorda com os termos de uso acadêmico e as políticas de
              privacidade do ProdLab &amp; Grupo UniEduK.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
