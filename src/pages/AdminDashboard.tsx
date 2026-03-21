import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/button';

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header
        className="flex items-center justify-between px-4 py-3 lg:px-8"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-lg font-bold text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            ProdLab — Professor
          </h1>
          <span className="text-sm text-white/70 hidden sm:inline">
            {displayName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50 hidden md:inline">
            {user?.email}
          </span>
          <Button variant="ghost" onClick={signOut} className="text-white hover:text-white/80 min-h-[44px] min-w-[44px]">
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p
            className="text-lg font-semibold"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Painel do professor — em construção
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            Funcionalidades de gestão serão adicionadas em breve.
          </p>
        </div>
      </main>
    </div>
  );
}
