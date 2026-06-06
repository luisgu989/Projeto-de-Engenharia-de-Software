"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers: Client Component wrapper que agrega todos os Context Providers
 * da aplicação (TooltipProvider, futuramente ThemeProvider, etc.)
 * Mantém o RootLayout como Server Component.
 */
export function Providers({ children }: ProvidersProps) {
  return <TooltipProvider delay={300}>{children}</TooltipProvider>;
}
