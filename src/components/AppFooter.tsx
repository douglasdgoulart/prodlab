export function AppFooter() {
  return (
    <footer className="border-t border-border bg-card px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-1 md:flex-row md:gap-4">
          <span className="font-heading text-sm font-bold text-primary">ProdLab</span>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            &copy; 2026 Unimax ProdLab
          </span>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Um oferecimento:
          </span>
          <img
            src="/logo-unimax.svg"
            alt="UniMAX - Grupo UniEduK"
            className="mt-1 h-6 opacity-80"
          />
        </div>
      </div>
    </footer>
  );
}
