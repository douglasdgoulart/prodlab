import { Badge } from "./badge";

export const Default = () => <Badge>Default</Badge>;

export const Secondary = () => <Badge variant="secondary">Secondary</Badge>;

export const Destructive = () => (
  <Badge variant="destructive">Destructive</Badge>
);

export const Outline = () => <Badge variant="outline">Outline</Badge>;

export const AllVariants = () => (
  <div className="flex items-center gap-3">
    <Badge>Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="destructive">Destructive</Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="ghost">Ghost</Badge>
    <Badge variant="link">Link</Badge>
  </div>
);
