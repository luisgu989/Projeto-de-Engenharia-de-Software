"use client";

import React, { useState } from "react";
import { VersionadorRegistros } from "@/components/integracoes/VersionadorRegistros";
import { ConfigIntegracoesExternas } from "@/components/integracoes/ConfigIntegracoesExternas";
import { ConfigAutomacoes } from "@/components/integracoes/ConfigAutomacoes";
import { MonitorDesempenho } from "@/components/integracoes/MonitorDesempenho";
import { Database, Globe, Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IntegracoesPage() {
  const [activeTab, setActiveTab] = useState<"versionador" | "conexoes" | "automacoes" | "desempenho">("versionador");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Módulo de Integração & Infraestrutura
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie versionamento de estoque, conexões de APIs de terceiros, processos operacionais automáticos e desempenho de infraestrutura.
        </p>
      </div>

      <div className="flex border-b border-border gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("versionador")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "versionador"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Database className="h-4 w-4" />
          Versionamento de Estoque
        </button>

        <button
          onClick={() => setActiveTab("conexoes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "conexoes"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe className="h-4 w-4" />
          Conexões Externas (APIs)
        </button>

        <button
          onClick={() => setActiveTab("automacoes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "automacoes"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className="h-4 w-4" />
          Automação de Processos
        </button>

        <button
          onClick={() => setActiveTab("desempenho")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "desempenho"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Activity className="h-4 w-4" />
          Desempenho do Sistema
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "versionador" && <VersionadorRegistros />}
        {activeTab === "conexoes" && <ConfigIntegracoesExternas />}
        {activeTab === "automacoes" && <ConfigAutomacoes />}
        {activeTab === "desempenho" && <MonitorDesempenho />}
      </div>
    </div>
  );
}
