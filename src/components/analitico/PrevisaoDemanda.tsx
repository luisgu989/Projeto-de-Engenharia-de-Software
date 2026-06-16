"use client";

import React, { useState } from "react";
import { usePrevisaoDemanda } from "@/hooks/usePrevisaoDemanda";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, Trash2, LineChart, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrevisaoDemandaComponent() {
  const { previsoes, error, gerarPrevisao, removerPrevisao } = usePrevisaoDemanda();

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [selectedPrevisaoId, setSelectedPrevisaoId] = useState<string | null>(null);

  const selectedPrevisao = previsoes.find((p) => p.id === selectedPrevisaoId) || previsoes[0];

  const handleGerar = (e: React.FormEvent) => {
    e.preventDefault();
    const success = gerarPrevisao(dataInicio, dataFim);
    if (success) {
      // Auto select the new one (which is first in list)
      setSelectedPrevisaoId(null); // Will default to first
      setDataInicio("");
      setDataFim("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Parametros Form */}
        <div className="md:col-span-1 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <LineChart className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="font-bold text-sm">Configurar Período</h3>
          </div>

          <form onSubmit={handleGerar} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Data Inicial
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-lg px-3 py-2 text-xs transition-all text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Data Final
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-lg px-3 py-2 text-xs transition-all text-foreground"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full font-semibold h-9 shadow-sm cursor-pointer">
              Gerar Previsão Automatizada
            </Button>
          </form>
        </div>

        {/* Historico de Previsoes */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm">Histórico de Previsões Geradas</h3>
              <span className="text-xs font-semibold text-muted-foreground">{previsoes.length} registradas</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {previsoes.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  Nenhuma previsão de demanda gerada até o momento.
                </div>
              ) : (
                previsoes.map((p) => {
                  const isSelected = selectedPrevisao && selectedPrevisao.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPrevisaoId(p.id)}
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all hover:bg-accent/20",
                        isSelected ? "bg-primary/10 border-primary text-primary" : "bg-accent/10 border-transparent text-foreground"
                      )}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">
                            {p.id}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {new Date(p.dataInicio).toLocaleDateString("pt-BR")} a {new Date(p.dataFim).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                          <span>Volume: <strong>{p.resultadoVolumeProjetado} un.</strong></span>
                          <span>Faturamento: <strong>R$ {p.resultadoFaturamentoProjetado.toLocaleString("pt-BR")}</strong></span>
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {p.usuarioResponsavel}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedPrevisaoId === p.id) {
                            setSelectedPrevisaoId(null);
                          }
                          removerPrevisao(p.id);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                        title="Excluir previsão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedPrevisao && (
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {selectedPrevisao.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  Gerado em {new Date(selectedPrevisao.dataGeracao).toLocaleString("pt-BR")}
                </span>
              </div>
              <h3 className="font-bold text-lg text-foreground">
                Resultado da Previsão: {new Date(selectedPrevisao.dataInicio).toLocaleDateString("pt-BR")} até {new Date(selectedPrevisao.dataFim).toLocaleDateString("pt-BR")}
              </h3>
            </div>
            
            {/* Hidden Fields Info Box */}
            <div className="flex items-center gap-3 bg-accent/20 border border-border rounded-xl px-4 py-2 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <div className="text-[10px] space-y-0.5 text-muted-foreground font-semibold">
                <div>Responsável: <strong className="text-foreground">{selectedPrevisao.usuarioResponsavel}</strong></div>
                <div>Hash de Auditoria: <span className="font-mono text-foreground">{selectedPrevisao.id}</span></div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-5 rounded-xl border border-border bg-accent/10 flex flex-col justify-center space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Volume Demandado Projetado</span>
              <span className="text-xl font-black text-foreground tracking-tight">
                {selectedPrevisao.resultadoVolumeProjetado} unidades
              </span>
            </div>
            <div className="p-5 rounded-xl border border-border bg-accent/10 flex flex-col justify-center space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Faturamento Projetado</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                R$ {selectedPrevisao.resultadoFaturamentoProjetado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-5 rounded-xl border border-border bg-accent/10 flex flex-col justify-center space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Nível de Confiança IA</span>
              <span className="text-xl font-black text-primary tracking-tight">
                {Math.round(selectedPrevisao.itensPrevisao.reduce((sum, item) => sum + item.taxaConfianca, 0) / (selectedPrevisao.itensPrevisao.length || 1))}%
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-foreground">Comportamento por Produto</h4>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase tracking-wide">
                    <th className="p-3">Produto</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3 text-right">Média Histórica Mensal</th>
                    <th className="p-3 text-right">Demanda Projetada</th>
                    <th className="p-3 text-center">Tendência</th>
                    <th className="p-3 text-right">Confiança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {selectedPrevisao.itensPrevisao.map((item, idx) => (
                    <tr key={idx} className="hover:bg-accent/10 transition-colors">
                      <td className="p-3 font-bold text-foreground">{item.produtoNome}</td>
                      <td className="p-3 text-muted-foreground">{item.categoria}</td>
                      <td className="p-3 text-right">{item.mediaHistoricaMensal} un.</td>
                      <td className="p-3 text-right font-extrabold text-foreground">{item.demandaProjetada} un.</td>
                      <td className="p-3 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          item.tendencia === "crescimento" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                          item.tendencia === "queda" ? "bg-destructive/10 text-destructive" :
                          "bg-blue-500/10 text-blue-600"
                        )}>
                          {item.tendencia === "crescimento" && <TrendingUp className="h-3 w-3" />}
                          {item.tendencia === "queda" && <TrendingDown className="h-3 w-3" />}
                          {item.tendencia}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-[11px] font-bold text-primary">
                        {item.taxaConfianca}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SVG Visual Graphic Chart */}
          <div className="p-6 rounded-xl border border-border bg-accent/5 space-y-4">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <LineChart className="h-4.5 w-4.5 text-primary" /> Histórico vs Projeção de Demanda (unidades)
            </h4>
            
            <div className="flex justify-center p-4 bg-background border border-border/60 rounded-xl aspect-[3/1] max-h-[200px]">
              <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                {selectedPrevisao.itensPrevisao.slice(0, 5).map((item, idx) => {
                  const maxVal = Math.max(...selectedPrevisao.itensPrevisao.map((i) => Math.max(i.mediaHistoricaMensal, i.demandaProjetada) || 1));
                  const hHist = (item.mediaHistoricaMensal / maxVal) * 80;
                  const hProj = (item.demandaProjetada / maxVal) * 80;
                  const x = 50 + idx * 90;
                  return (
                    <g key={idx}>
                      {/* Histórico Bar */}
                      <rect
                        x={x}
                        y={90 - hHist}
                        width="15"
                        height={hHist}
                        fill="#64748b"
                        className="opacity-60"
                        rx="1"
                      />
                      {/* Projetado Bar */}
                      <rect
                        x={x + 18}
                        y={90 - hProj}
                        width="15"
                        height={hProj}
                        fill="url(#projGrad)"
                        rx="1.5"
                      />
                      {/* Text */}
                      <text x={x + 16} y="105" textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontWeight="bold">
                        {item.produtoNome.split(" ")[0]}
                      </text>
                      <text x={x + 7} y={90 - hHist - 4} textAnchor="middle" fill="#64748b" fontSize="6">
                        {item.mediaHistoricaMensal}
                      </text>
                      <text x={x + 25} y={90 - hProj - 4} textAnchor="middle" fill="#3b82f6" fontSize="6" fontWeight="bold">
                        {item.demandaProjetada}
                      </text>
                    </g>
                  );
                })}
                <defs>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <line x1="30" y1="90" x2="480" y2="90" stroke="#cbd5e1" strokeWidth="1" />
              </svg>
            </div>
            <div className="flex justify-center gap-6 text-[10px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5 before:content-[''] before:h-2 before:w-2 before:bg-slate-400 before:rounded-sm">Média Histórica Mensal</span>
              <span className="flex items-center gap-1.5 before:content-[''] before:h-2 before:w-2 before:bg-blue-500 before:rounded-sm">Demanda Projetada</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
