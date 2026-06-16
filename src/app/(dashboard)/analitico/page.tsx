"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PrevisaoDemandaComponent } from "@/components/analitico/PrevisaoDemanda";
import { AcoesInteligentesComponent } from "@/components/analitico/AcoesInteligentes";
import { MetasOrganizacionaisComponent } from "@/components/analitico/MetasOrganizacionais";
import { GerenciarKPIsComponent } from "@/components/analitico/GerenciarKPIs";
import { Sparkles, Target, Gauge, LineChart, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type AnaliticoTab = "previsoes" | "sugestoes" | "metas" | "kpis";

export default function AnaliticoPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AnaliticoTab>("previsoes");

  const cargo = user.cargo?.toLowerCase() || "";
  const isGerente = user.role === "admin" || cargo.includes("gerente") || cargo.includes("diretor");

  const tabs = [
    {
      id: "previsoes" as AnaliticoTab,
      label: "Previsão de Demanda",
      icon: LineChart,
    },
    {
      id: "sugestoes" as AnaliticoTab,
      label: "Ações Inteligentes",
      icon: Sparkles,
    },
    {
      id: "metas" as AnaliticoTab,
      label: "Metas Organizacionais",
      icon: Target,
    },
    {
      id: "kpis" as AnaliticoTab,
      label: "Indicadores KPI",
      icon: Gauge,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Painel BI & Inteligência Analítica</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie previsões, sugestões prescritivas de IA, metas corporativas e indicadores estratégicos KPI.
        </p>
      </div>

      {/* Gerente validation warning */}
      {!isGerente && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            <strong>Acesso Restrito:</strong> Como gerente, você teria permissões de alteração estratégica. Como colaborador, as telas estão em modo de leitura protegida.
          </span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-xs whitespace-nowrap transition-all cursor-pointer focus:outline-none",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {activeTab === "previsoes" && <PrevisaoDemandaComponent />}
        {activeTab === "sugestoes" && <AcoesInteligentesComponent />}
        {activeTab === "metas" && <MetasOrganizacionaisComponent />}
        {activeTab === "kpis" && <GerenciarKPIsComponent />}
      </div>
    </div>
  );
}
