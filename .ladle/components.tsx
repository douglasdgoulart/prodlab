import type { GlobalProvider } from "@ladle/react";
import "@/index.css";

export const Provider: GlobalProvider = ({ children }) => (
  <div className="bg-background text-foreground font-sans antialiased p-8">
    {children}
  </div>
);
