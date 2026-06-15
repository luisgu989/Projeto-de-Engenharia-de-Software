"use client";

import React from "react";
import { CentralNotificacoes } from "@/components/notificacoes/CentralNotificacoes";

export default function NotificacoesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Notificações
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie e acompanhe todos os alertas e eventos operacionais do sistema.
        </p>
      </div>

      <CentralNotificacoes />
    </div>
  );
}
