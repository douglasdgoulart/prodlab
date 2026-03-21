export function ProdLabLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <img src="/favicon.svg" alt="" className="h-6 w-6" />
      <span className="text-lg font-bold font-heading text-primary">
        ProdLab
      </span>
    </div>
  );
}
