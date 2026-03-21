import { Badge } from './ui/badge';

interface Module {
  id: number;
  name: string;
  icon: React.ReactNode;
  active: boolean;
}

const MODULES: Module[] = [
  { id: 1, name: 'Previsão de Demanda', icon: <TrendIcon />, active: true },
  { id: 2, name: 'Planejamento Agregado', icon: <LayersIcon />, active: false },
  { id: 3, name: 'Planejamento Desagregado', icon: <SplitIcon />, active: false },
  { id: 4, name: 'PMP', icon: <ClipboardIcon />, active: false },
  { id: 5, name: 'MRP', icon: <BoxIcon />, active: false },
  { id: 6, name: 'Scheduling', icon: <ListIcon />, active: false },
];

export function ModuleTrail() {
  const currentModule = MODULES.findIndex((m) => m.active) + 1;

  return (
    <section className="py-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Trilha de Aprendizado PCP
        </h2>
        <Badge className="bg-primary text-primary-foreground font-action text-xs px-3 py-1">
          Módulo {currentModule} de {MODULES.length}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <ol className="flex items-center gap-0 min-w-max p-1">
          {MODULES.map((mod, idx) => (
            <li key={mod.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    mod.active
                      ? 'bg-accent/20 text-accent ring-2 ring-accent'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {mod.icon}
                </div>
                <span
                  className={`max-w-[100px] text-center text-[10px] font-semibold uppercase tracking-wide ${
                    mod.active ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {mod.name}
                </span>
              </div>
              {idx < MODULES.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-12 ${
                    MODULES[idx + 1]?.active || mod.active
                      ? 'bg-accent'
                      : 'bg-border'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Minimal inline icons for module trail
function TrendIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 20 8 13l4 4 10-14" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0 4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
    </svg>
  );
}

function SplitIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.251 2.251 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
    </svg>
  );
}
