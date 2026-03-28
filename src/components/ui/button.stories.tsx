import { Button } from "./button";

export const Default = () => <Button>Botão Padrão</Button>;

export const Outline = () => <Button variant="outline">Outline</Button>;

export const Secondary = () => <Button variant="secondary">Secondary</Button>;

export const Ghost = () => <Button variant="ghost">Ghost</Button>;

export const Destructive = () => (
  <Button variant="destructive">Destructive</Button>
);

export const Link = () => <Button variant="link">Link</Button>;

export const Sizes = () => (
  <div className="flex items-center gap-4">
    <Button size="xs">Extra Small</Button>
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
  </div>
);
