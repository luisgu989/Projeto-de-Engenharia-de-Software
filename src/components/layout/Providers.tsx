"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { LogsProvider } from "@/contexts/logs-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { AuthGuard } from "./AuthGuard";

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
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <LogsProvider>
            <TooltipProvider delay={300}>
              <AuthGuard>{children}</AuthGuard>
            </TooltipProvider>
          </LogsProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

