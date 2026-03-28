import { Input } from "./input";

export default {
  title: "UI / Input",
};

export const Variants = () => (
  <div className="flex flex-col gap-6 max-w-sm">
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">default</p>
      <Input placeholder="Digite algo..." />
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">type="email"</p>
      <Input type="email" placeholder="email@exemplo.com" />
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">type="password"</p>
      <Input type="password" placeholder="Sua senha" />
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">disabled</p>
      <Input disabled placeholder="Campo desabilitado" />
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">aria-invalid</p>
      <Input aria-invalid placeholder="Campo com erro" />
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">type="file"</p>
      <Input type="file" />
    </div>
  </div>
);
