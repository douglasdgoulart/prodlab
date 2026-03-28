import { Separator } from "./separator";

export default {
  title: "UI / Separator",
};

export const Variants = () => (
  <div className="flex flex-col gap-6">
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">horizontal (default)</p>
      <div className="space-y-3">
        <p className="text-sm">Conteúdo acima</p>
        <Separator />
        <p className="text-sm">Conteúdo abaixo</p>
      </div>
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">vertical</p>
      <div className="flex items-center gap-3 h-8">
        <span className="text-sm">Item A</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Item B</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Item C</span>
      </div>
    </div>
  </div>
);
