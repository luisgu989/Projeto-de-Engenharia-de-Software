"use client";

import React, { useState } from "react";
import { GerenciadorAtivos } from "@/components/ativos/GerenciadorAtivos";
import { ManutencaoPreventiva } from "@/components/ativos/ManutencaoPreventiva";
import { Layers, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AtivosPage() {
  const [abaAtiva, setAbaAtiva] = useState<"ativos" | "manutencao">("ativos");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4 no-print">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Ativos & Gestão Patrimonial</h2>
        <p className="text-sm text-muted-foreground">
          Controle os bens físicos da organização, registre transferências de setores e programe manutenções operacionais preventivas.
        </p>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex border-b border-border no-print overflow-x-auto custom-scrollbar pb-px">
        <button
          onClick={() => setAbaAtiva("ativos")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "ativos"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="h-4 w-4" />
          Ativos Empresariais
        </button>
        <button
          onClick={() => setAbaAtiva("manutencao")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "manutencao"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Wrench className="h-4 w-4" />
          Manutenção Preventiva
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {abaAtiva === "ativos" && <GerenciadorAtivos />}
        {abaAtiva === "manutencao" && <ManutencaoPreventiva />}
      </div>
    </div>
  );
}
