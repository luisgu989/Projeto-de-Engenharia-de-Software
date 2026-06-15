"use client";

import React from "react";
import { VersionadorRegistros } from "@/components/integracoes/VersionadorRegistros";

export default function IntegracoesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Módulo de Integração & Importações
        </h2>
        <p className="text-sm text-muted-foreground">
          Importe dados externos de planilhas e gerencie o histórico de versionamento com restauração de estados.
        </p>
      </div>

      <VersionadorRegistros />
    </div>
  );
}
