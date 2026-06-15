"use client";

import React, { useState } from "react";
import {
  Oportunidade,
  StatusOportunidade,
  statusLabels,
} from "@/hooks/useOportunidades";
import { CardOportunidade } from "./CardOportunidade";
import { PainelDetalhes } from "./PainelDetalhes";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface KanbanPipelineProps {
  oportunidades: Oportunidade[];
  onAvancarEtapa: (
    id: string,
    novaEtapa: StatusOportunidade,
    observacao?: string
  ) => { sucesso: boolean; erro?: string };
  onEditar: (
    id: string,
    campos: Partial<Omit<Oportunidade, "id" | "cliente" | "dataAbertura" | "historico">>
  ) => { sucesso: boolean; erro?: string };
}

// Ordenação de exibição e cores das colunas
const COLUNAS: { status: StatusOportunidade; colorBorder: string; colorHeader: string }[] = [
  {
    status: "prospeccao",
    colorBorder: "border-t-slate-400",
    colorHeader: "text-slate-600 dark:text-slate-400",
  },
  {
    status: "qualificacao",
    colorBorder: "border-t-blue-500",
    colorHeader: "text-blue-600 dark:text-blue-400",
  },
  {
    status: "proposta",
    colorBorder: "border-t-violet-500",
    colorHeader: "text-violet-600 dark:text-violet-400",
  },
  {
    status: "negociacao",
    colorBorder: "border-t-amber-500",
    colorHeader: "text-amber-600 dark:text-amber-400",
  },
  {
    status: "fechado_ganho",
    colorBorder: "border-t-emerald-500",
    colorHeader: "text-emerald-600 dark:text-emerald-400",
  },
  {
    status: "fechado_perdido",
    colorBorder: "border-t-rose-500",
    colorHeader: "text-rose-600 dark:text-rose-400",
  },
];

export function KanbanPipeline({ oportunidades, onAvancarEtapa, onEditar }: KanbanPipelineProps) {
  const [selected, setSelected] = useState<Oportunidade | null>(null);
  const [busca, setBusca] = useState("");

  // Atualiza o card selecionado quando os dados mudam (ex.: após avançar etapa)
  const oportunidadeAtualizada = selected
    ? oportunidades.find((op) => op.id === selected.id) ?? null
    : null;

  const filtradas = busca
    ? oportunidades.filter(
        (op) =>
          op.titulo.toLowerCase().includes(busca.toLowerCase()) ||
          op.cliente.toLowerCase().includes(busca.toLowerCase()) ||
          op.responsavel.toLowerCase().includes(busca.toLowerCase())
      )
    : oportunidades;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: val >= 1_000_000 ? "compact" : "standard",
      maximumFractionDigits: val >= 1_000_000 ? 1 : 0,
    }).format(val);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            id="busca-pipeline"
            type="text"
            placeholder="Filtrar por título, cliente, responsável..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-card hover:bg-accent/30 focus:bg-background rounded-md pl-9 pr-4 py-2 text-sm border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {filtradas.length} de {oportunidades.length} negociações
        </span>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {COLUNAS.map(({ status, colorBorder, colorHeader }) => {
            const cards = filtradas.filter((op) => op.status === status);
            const totalColuna = cards.reduce((acc, op) => acc + op.valorEstimado, 0);

            return (
              <div
                key={status}
                className={cn(
                  "flex flex-col w-64 rounded-xl border border-border bg-accent/10 border-t-2 overflow-hidden",
                  colorBorder
                )}
              >
                {/* Column header */}
                <div className="px-3 pt-3 pb-2 space-y-1 bg-accent/20 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold", colorHeader)}>
                      {statusLabels[status]}
                    </span>
                    <span className="text-[10px] font-bold bg-background/60 text-muted-foreground px-1.5 py-0.5 rounded-full border border-border">
                      {cards.length}
                    </span>
                  </div>
                  {cards.length > 0 && (
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {formatCurrency(totalColuna)}
                    </p>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                  {cards.length === 0 ? (
                    <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border/60">
                      <p className="text-[10px] text-muted-foreground/50 font-medium">
                        Sem negociações
                      </p>
                    </div>
                  ) : (
                    cards.map((op) => (
                      <CardOportunidade
                        key={op.id}
                        oportunidade={op}
                        onClick={(o) => setSelected(o)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel lateral de detalhes */}
      <PainelDetalhes
        oportunidade={oportunidadeAtualizada}
        onClose={() => setSelected(null)}
        onAvancarEtapa={(id, etapa, obs) => {
          const result = onAvancarEtapa(id, etapa, obs);
          return result;
        }}
        onEditar={onEditar}
      />
    </div>
  );
}
