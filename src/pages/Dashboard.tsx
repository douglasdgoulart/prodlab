import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const MODULES = [
  { id: 1, name: 'Previsão de Demanda', active: false },
  { id: 2, name: 'Planejamento Agregado', active: false },
  { id: 3, name: 'Planejamento Desagregado', active: false },
  { id: 4, name: 'Programa Mestre (PMP)', active: false },
  { id: 5, name: 'MRP', active: false },
  { id: 6, name: 'Scheduling', active: false },
];

export function Dashboard() {
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
            ProdLab
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
        <nav className="mb-8 overflow-x-auto">
          <ol className="flex gap-2 min-w-max">
            {MODULES.map((mod) => (
              <li key={mod.id} className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: mod.active ? 'var(--color-accent)' : 'var(--color-muted)',
                    color: mod.active ? 'var(--color-primary)' : '#FFFFFF',
                    fontFamily: 'var(--font-action)',
                  }}
                >
                  {mod.id}
                </span>
                <span
                  className="text-sm hidden md:inline"
                  style={{
                    color: mod.active ? 'var(--color-text)' : 'var(--color-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {mod.name}
                </span>
                {mod.id < MODULES.length && (
                  <span className="text-[var(--color-muted)]">{'\u2192'}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p
              className="text-lg font-semibold"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Bem-vindo ao ProdLab
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              Os módulos serão habilitados em breve.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
