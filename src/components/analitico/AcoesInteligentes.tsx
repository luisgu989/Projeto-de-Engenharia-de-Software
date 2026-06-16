"use client";

import React, { useState } from "react";
import { useSugestoesNegocio } from "@/hooks/useSugestoesNegocio";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, AlertOctagon, HelpCircle, Archive, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export function AcoesInteligentesComponent() {
  const { sugestoes, executarAnaliseIA, limparRecomendacoes } = useSugestoesNegocio();
  const [areaFiltro, setAreaFiltro] = useState("todas");
  const [prioridadeFiltro, setPrioridadeFiltro] = useState("todas");

  const sugestoesFiltradas = sugestoes.filter((s) => {
    const matchArea = areaFiltro === "todas" || s.areaNegocio === areaFiltro;
    const matchPrioridade = prioridadeFiltro === "todas" || s.nivelPrioridade === prioridadeFiltro;
    return matchArea && matchPrioridade;
  });

  return (
    <div className="space-y-6">
      {/* AI Controls Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10 flex-1">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Painel de Recomendações Prescritivas (IA)
          </h3>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Esta seção monitora e cruza dados de estoque, vendas e contas financeiras. O algoritmo gera prescrições estratégicas automatizadas e de leitura protegida.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          {sugestoes.length > 0 && (
            <button
              onClick={limparRecomendacoes}
              className="px-3.5 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              Limpar Recomendações
            </button>
          )}
          <Button
            onClick={executarAnaliseIA}
            className="h-9 font-semibold gap-2 shadow-md shadow-primary/10 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> Executar Análise de Negócio
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-xl border border-border bg-accent/10 text-xs font-semibold text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wide">Área de Negócio</label>
            <select
              value={areaFiltro}
              onChange={(e) => setAreaFiltro(e.target.value)}
              className="block w-40 bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground text-xs"
            >
              <option value="todas">Todas as Áreas</option>
              <option value="Estoque">Estoque</option>
              <option value="Vendas">Vendas</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Logística">Logística</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wide">Prioridade</label>
            <select
              value={prioridadeFiltro}
              onChange={(e) => setPrioridadeFiltro(e.target.value)}
              className="block w-40 bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground text-xs"
            >
              <option value="todas">Todas as Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <ShieldCheck className="h-3.5 w-3.5" /> Acesso Protegido - Leitura
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="grid gap-4 md:grid-cols-2">
        {sugestoesFiltradas.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-card space-y-3">
            <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
            <div className="text-xs text-muted-foreground font-semibold max-w-sm">
              Nenhuma recomendação gerada para os filtros selecionados. Clique em "Executar Análise de Negócio" para processar dados operacionais.
            </div>
          </div>
        ) : (
          sugestoesFiltradas.map((s) => (
            <div
              key={s.idRecomendacao}
              className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 border-l-4"
              style={{
                borderLeftColor:
                  s.nivelPrioridade === "Alta"
                    ? "rgb(239, 68, 68)"
                    : s.nivelPrioridade === "Média"
                    ? "rgb(245, 158, 11)"
                    : "rgb(59, 130, 246)",
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] bg-accent/40 text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                      {s.idRecomendacao}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Análise: {new Date(s.dataAnalise).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Área: <strong className="text-foreground">{s.areaNegocio}</strong>
                  </h4>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                    s.nivelPrioridade === "Alta"
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : s.nivelPrioridade === "Média"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  )}
                >
                  Prioridade {s.nivelPrioridade}
                </span>
              </div>

              {/* Sugestao Gerada (Read Only input mock or text block) */}
              <div className="space-y-1 bg-accent/20 border border-border/40 p-3 rounded-xl">
                <label className="text-[9px] uppercase font-bold text-muted-foreground block">Sugestão Gerada</label>
                <p className="text-xs text-foreground font-medium leading-relaxed">
                  {s.sugestaoGerada}
                </p>
              </div>

              {/* Impacto Estimado */}
              <div className="text-[11px] text-muted-foreground flex items-start gap-1.5 bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                <AlertOctagon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Impacto Estimado:</strong> {s.impactoEstimado}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
