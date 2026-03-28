import type { GlobalProvider } from "@ladle/react";
import "./ladle.css";

export const Provider: GlobalProvider = ({ children }) => (
  <div className="bg-background text-foreground font-sans antialiased p-8">
    {children}
  </div>
);
