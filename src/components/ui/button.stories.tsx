import { Button } from "./button";

export default {
  title: "UI / Button",
};

export const Variants = () => (
  <div className="flex flex-col gap-6">
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">variant</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="default">Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">size</p>
      <div className="flex flex-wrap items-end gap-3">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">icon sizes</p>
      <div className="flex flex-wrap items-end gap-3">
        <Button size="icon-xs">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
        </Button>
        <Button size="icon-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
        </Button>
        <Button size="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
        </Button>
        <Button size="icon-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
        </Button>
      </div>
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">states</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button>Enabled</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  </div>
);
