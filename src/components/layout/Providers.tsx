"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { LogsProvider } from "@/contexts/logs-context";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers: Client Component wrapper que agrega todos os Context Providers
 * da aplicação (AuthProvider, LogsProvider, TooltipProvider, etc.)
 * Mantém o RootLayout como Server Component.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <LogsProvider>
        <TooltipProvider delay={300}>{children}</TooltipProvider>
      </LogsProvider>
    </AuthProvider>
  );
}

