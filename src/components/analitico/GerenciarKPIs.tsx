"use client";

import React, { useState } from "react";
import { useKPIs } from "@/hooks/useKPIs";
import { Button } from "@/components/ui/button";
import { Gauge, PlusCircle, Trash2, AlertCircle, ShieldAlert, TrendingUp, Calendar, Clock, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

export function GerenciarKPIsComponent() {
  const { kpis, error, adicionarKPI, removerKPI } = useKPIs();

  const [nomeKPI, setNomeKPI] = useState("");
  const [areaVinculada, setAreaVinculada] = useState<"Vendas" | "Financeiro" | "Estoque" | "Logística" | "Produção">("Vendas");
  const [formulaCalculo, setFormulaCalculo] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [expandedKpiId, setExpandedKpiId] = useState<string | null>(null);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adicionarKPI(nomeKPI, areaVinculada, formulaCalculo);
    if (success) {
      setNomeKPI("");
      setFormulaCalculo("");
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" /> Painel de Gerenciamento de Indicadores (KPIs)
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure métricas e fórmulas de negócios. Os resultados atuais são processados de forma automatizada pelo ERP com restrição total a edições manuais.
          </p>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 font-semibold gap-1.5 cursor-pointer shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Configurar Novo KPI
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSalvar} className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            <h4 className="font-bold text-sm">Novo Indicador KPI</h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Nome do KPI</label>
              <input
                type="text"
                placeholder="Ex: Ticket Médio Mensal"
                value={nomeKPI}
                onChange={(e) => setNomeKPI(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-3 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Área Vinculada</label>
              <select
                value={areaVinculada}
                onChange={(e) => setAreaVinculada(e.target.value as any)}
                className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-2.5 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
              >
                <option value="Vendas">Vendas</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Estoque">Estoque</option>
                <option value="Logística">Logística</option>
                <option value="Produção">Produção</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Fórmula de Cálculo</label>
              <input
                type="text"
                placeholder="Ex: Faturamento / Vendas"
                value={formulaCalculo}
                onChange={(e) => setFormulaCalculo(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-3 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground font-semibold text-xs rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <Button type="submit" className="px-4 py-2 text-xs font-semibold cursor-pointer">
              Salvar KPI no Banco
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kpis.length === 0 ? (
          <div className="md:col-span-3 p-12 text-center border border-dashed border-border bg-card rounded-2xl text-xs text-muted-foreground font-semibold">
            Nenhum indicador KPI configurado. Clique em "Configurar Novo KPI" para definir parâmetros.
          </div>
        ) : (
          kpis.map((k) => {
            const isExpanded = expandedKpiId === k.idIndicador;
            return (
              <div key={k.idIndicador} className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] bg-accent/60 text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                        {k.idIndicador}
                      </span>
                      <span className="inline-flex text-[9px] font-bold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {k.areaVinculada}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{k.nomeKPI}</h4>
                  </div>

                  <button
                    onClick={() => removerKPI(k.idIndicador)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                    title="Excluir indicador"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Score */}
                <div className="py-2 flex items-center justify-between border-b border-border/40">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Resultado Atual</span>
                    <div className="text-2xl font-black text-foreground tracking-tight">
                      {k.nomeKPI.toLowerCase().includes("faturamento") || k.nomeKPI.toLowerCase().includes("ticket")
                        ? `R$ ${k.resultadoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : k.nomeKPI.toLowerCase().includes("giro") || k.nomeKPI.toLowerCase().includes("margem")
                        ? `${k.resultadoAtual}%`
                        : k.resultadoAtual}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedKpiId(isExpanded ? null : k.idIndicador)}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Clock className="h-3.5 w-3.5" /> Histórico
                  </button>
                </div>

                {/* Formula */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Fórmula de Cálculo</span>
                  <div className="bg-accent/20 border border-border/40 rounded-lg p-2 font-mono text-[10px] text-muted-foreground select-all break-all">
                    {k.formulaCalculo}
                  </div>
                </div>

                {/* Expanded metric timeline */}
                {isExpanded && (
                  <div className="p-3 rounded-xl bg-accent/10 border border-border/50 space-y-2.5 animate-in fade-in duration-200">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                      <BarChart className="h-3.5 w-3.5 text-primary" /> Histórico de Métricas (Imutável)
                    </span>
                    
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {k.historicoMetricas.map((h, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                          <span className="flex items-center gap-1 font-mono"><Calendar className="h-3 w-3" /> {h.data}</span>
                          <span className="text-foreground">
                            {k.nomeKPI.toLowerCase().includes("faturamento") || k.nomeKPI.toLowerCase().includes("ticket")
                              ? `R$ ${h.valor.toLocaleString("pt-BR")}`
                              : k.nomeKPI.toLowerCase().includes("giro") || k.nomeKPI.toLowerCase().includes("margem")
                              ? `${h.valor}%`
                              : h.valor}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Immutable Metadata */}
                <div className="pt-2 flex justify-between items-center text-[9px] font-bold font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 text-[8px] uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                    <ShieldAlert className="h-3 w-3" /> Protegido
                  </span>
                  <span className="truncate">At.: {new Date(k.dataAtualizacao).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
