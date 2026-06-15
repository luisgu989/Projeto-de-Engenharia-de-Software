"use client";

import React from "react";
import { useOportunidades } from "@/hooks/useOportunidades";
import { useAuth } from "@/contexts/auth-context";
import { KanbanPipeline } from "@/components/pipeline/KanbanPipeline";
import { BarChart2, TrendingUp, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PipelinePage() {
  const {
    todasOportunidades,
    avancarEtapa,
    editarOportunidade,
    totalAbertas,
    valorPipelineTotal,
    valorGanhoTotal,
    taxaConversao,
  } = useOportunidades();

  const { user } = useAuth();

  // Inject logged user into avancarEtapa
  const handleAvancarEtapa = (
    id: string,
    novaEtapa: Parameters<typeof avancarEtapa>[1],
    observacao?: string
  ) => {
    return avancarEtapa(
      id,
      novaEtapa,
      { name: user.name, email: user.email },
      observacao
    );
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: val >= 1_000_000 ? "compact" : "standard",
      maximumFractionDigits: val >= 1_000_000 ? 1 : 0,
    }).format(val);

  const kpis = [
    {
      label: "Oportunidades Ativas",
      value: totalAbertas.toString(),
      icon: BarChart2,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Valor do Pipeline",
      value: formatCurrency(valorPipelineTotal),
      icon: TrendingUp,
      color: "text-violet-500 bg-violet-500/10",
    },
    {
      label: "Receita Fechada",
      value: formatCurrency(valorGanhoTotal),
      icon: DollarSign,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Taxa de Conversão",
      value: `${taxaConversao}%`,
      icon: Percent,
      color: "text-amber-500 bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Pipeline de Vendas
        </h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe e evolua as negociações pelo fluxo comercial. Clique em um
          card para gerenciar a etapa, editar dados e consultar o histórico de
          movimentações.
        </p>
      </div>

      {/* KPIs strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-sm"
            >
              <div className={cn("p-2 rounded-lg shrink-0", kpi.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium truncate">
                  {kpi.label}
                </p>
                <p className="text-base font-bold tracking-tight">{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold tracking-tight">
          Visão do Pipeline
        </h3>
        <p className="text-xs text-muted-foreground">
          Executor registrado automaticamente:{" "}
          <span className="font-semibold text-foreground">{user.name}</span>
          <span className="text-muted-foreground/60"> ({user.email})</span>
        </p>
        <KanbanPipeline
          oportunidades={todasOportunidades}
          onAvancarEtapa={handleAvancarEtapa}
          onEditar={editarOportunidade}
        />
      </div>
    </div>
  );
}
