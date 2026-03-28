import { Badge } from "./badge";

export default {
  title: "UI / Badge",
};

export const Variants = () => (
  <div className="flex flex-col gap-6">
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">variant</p>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
        <Badge variant="link">Link</Badge>
      </div>
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">uso contextual</p>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="default">Ativo</Badge>
        <Badge variant="secondary">Pendente</Badge>
        <Badge variant="destructive">Erro</Badge>
        <Badge variant="outline">Rascunho</Badge>
      </div>
    </div>
  </div>
);
