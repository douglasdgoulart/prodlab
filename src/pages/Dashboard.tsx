import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { AppHeader } from '../components/AppHeader';
import { AppFooter } from '../components/AppFooter';
import { ModuleTrail } from '../components/ModuleTrail';

const NEXT_STEPS = [
  { title: 'Introdução à Demanda', status: 'Disponível', available: true },
  { title: 'Modelos Estocásticos', status: 'Bloqueado', available: false },
  { title: 'Ajuste Sazonal', status: 'Bloqueado', available: false },
];

const STATS = [
  { icon: <FormatIcon />, label: 'Formato', value: 'Prático Interativo' },
  { icon: <ClockIcon />, label: 'Estimativa', value: '45 Minutos' },
  { icon: <StatusIcon />, label: 'Status', value: 'Inédito' },
];

export function Dashboard() {
  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-4 py-4 lg:px-8">
        {/* Module Trail */}
        <ModuleTrail />

        {/* Main content grid */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Welcome card */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                Bem-vindo ao ProdLab
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                O primeiro módulo (<strong className="text-foreground">Previsão de Demanda</strong>) está
                disponível para início. Escolha-o na trilha acima para começar.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button className="bg-primary font-action text-sm font-semibold text-primary-foreground hover:bg-primary/90 min-h-[44px] px-6">
                  Iniciar Módulo &rarr;
                </Button>
                <Button
                  variant="outline"
                  className="font-action text-sm font-semibold min-h-[44px] px-6"
                >
                  Ver Programa
                </Button>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="text-accent">{stat.icon}</div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="font-heading text-sm font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right sidebar */}
          <div className="flex flex-col gap-6">
            {/* Next steps */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="font-heading text-base font-bold">Próximos Passos</h3>
                <ul className="mt-4 flex flex-col gap-4">
                  {NEXT_STEPS.map((step) => (
                    <li key={step.title} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          step.available
                            ? 'bg-accent/20 text-accent'
                            : 'bg-primary-foreground/10 text-primary-foreground/40'
                        }`}
                      >
                        {step.available ? <PlayIcon /> : <LockIcon />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${step.available ? '' : 'text-primary-foreground/60'}`}>
                          {step.title}
                        </p>
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-wide ${
                            step.available ? 'text-accent' : 'text-primary-foreground/40'
                          }`}
                        >
                          {step.status}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Academic highlight */}
            <Card>
              <CardContent className="p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Destaque Acadêmico
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                    <DocIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Manual do Gestor PCP</p>
                    <p className="text-xs text-muted-foreground">Guia de referência PDF</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

// Inline icons
function FormatIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}
