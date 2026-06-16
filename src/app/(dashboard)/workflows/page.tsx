"use client";

import React from "react";
import { WorkflowManager } from "@/components/workflows/WorkflowManager";
import { Layers } from "lucide-react";

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10 flex-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> Mapeamento de Workflows Empresariais
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Configure e gerencie fluxos de processos corporativos automáticos entre setores, validando sequências de etapas e garantindo conformidade operacional.
          </p>
        </div>
      </div>

      <WorkflowManager />
    </div>
  );
}
