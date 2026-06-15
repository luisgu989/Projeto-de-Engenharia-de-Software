"use client";

import React, { useState, useMemo } from "react";
import { useAvaliacaoFornecedores, AvaliacaoFornecedor } from "@/hooks/useAvaliacaoFornecedores";
import { useFornecedores } from "@/hooks/useFornecedores";
import { Star, ShieldAlert, CheckCircle, BarChart3, TrendingUp, Award, AwardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AvaliacaoFornecedores() {
  const { fornecedores } = useFornecedores();
  const { avaliacoes, adicionarAvaliacao } = useAvaliacaoFornecedores();

  const [fornecedorId, setFornecedorId] = useState("");
  const [prazoEntrega, setPrazoEntrega] = useState(5);
  const [qualidadeEntrega, setQualidadeEntrega] = useState(5);
  const [frequenciaEntrega, setFrequenciaEntrega] = useState(5);
  const [comentarios, setComentarios] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fornecedoresAtivos = useMemo(() => {
    return fornecedores.filter((f) => f.status === "ativo");
  }, [fornecedores]);

  React.useEffect(() => {
    if (fornecedoresAtivos.length > 0 && !fornecedorId) {
      setFornecedorId(fornecedoresAtivos[0].id);
    }
  }, [fornecedoresAtivos, fornecedorId]);

  const mediaTempoReal = useMemo(() => {
    return Math.round(((prazoEntrega + qualidadeEntrega + frequenciaEntrega) / 3) * 10) / 10;
  }, [prazoEntrega, qualidadeEntrega, frequenciaEntrega]);

  const scorecards = useMemo(() => {
    const map: Record<string, { total: number; count: number; nome: string }> = {};

    fornecedores.forEach((f) => {
      map[f.id] = { total: 0, count: 0, nome: f.razaoSocial };
    });

    avaliacoes.forEach((a) => {
      if (map[a.fornecedorId]) {
        map[a.fornecedorId].total += a.indiceDesempenho;
        map[a.fornecedorId].count += 1;
      }
    });

    return Object.entries(map)
      .map(([id, val]) => {
        const media = val.count > 0 ? Math.round((val.total / val.count) * 10) / 10 : 0;
        return {
          id,
          nome: val.nome,
          media,
          avaliacoesCount: val.count
        };
      })
      .filter((s) => s.avaliacoesCount > 0)
      .sort((a, b) => b.media - a.media);
  }, [avaliacoes, fornecedores]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedorId) {
      alert("Por favor, selecione um fornecedor.");
      return;
    }

    const fornecedor = fornecedores.find((f) => f.id === fornecedorId);
    if (!fornecedor) return;

    const sucesso = adicionarAvaliacao({
      fornecedorId,
      fornecedorNome: fornecedor.razaoSocial,
      prazoEntrega,
      qualidadeEntrega,
      frequenciaEntrega,
      comentarios: comentarios.trim()
    });

    if (sucesso) {
      setSuccessMsg(`Avaliação enviada com sucesso para ${fornecedor.razaoSocial}!`);
      setPrazoEntrega(5);
      setQualidadeEntrega(5);
      setFrequenciaEntrega(5);
      setComentarios("");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const renderEstrelasInput = (label: string, value: number, onChange: (val: number) => void) => {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-muted-foreground uppercase">{label}</span>
          <span className="font-bold text-primary">{value} / 5</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-110 transition-transform cursor-pointer"
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-colors",
                  star <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderEstrelasDisplay = (val: number, size = "h-3.5 w-3.5") => {
    const integerPart = Math.floor(val);
    return (
      <div className="flex gap-0.5 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size,
              star <= integerPart
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
        <span className="text-[10px] font-bold text-muted-foreground ml-1">({val.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-muted-foreground uppercase">Avaliações Totais</span>
            <span className="text-xl font-black text-foreground">{avaliacoes.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-muted-foreground uppercase">Melhor Fornecedor</span>
            <span className="text-sm font-extrabold text-foreground truncate max-w-[150px] block">
              {scorecards.length > 0 ? scorecards[0].nome : "Nenhum avaliado"}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-muted-foreground uppercase">Média Geral Indice</span>
            <span className="text-xl font-black text-foreground">
              {avaliacoes.length > 0
                ? (avaliacoes.reduce((acc, a) => acc + a.indiceDesempenho, 0) / avaliacoes.length).toFixed(1)
                : "0.0"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/10">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <AwardIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Painel de Scorecard Consolidado</h3>
                <p className="text-xs text-muted-foreground">Classificação de fornecedores ativos por média de satisfação</p>
              </div>
            </div>
            <div className="p-6">
              {scorecards.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Nenhum fornecedor possui avaliações consolidadas até o momento.
                </div>
              ) : (
                <div className="space-y-4">
                  {scorecards.map((score, idx) => (
                    <div key={score.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-border/60 rounded-xl bg-accent/10 hover:bg-accent/20 transition-all gap-2">
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center font-mono font-bold text-xs text-primary shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-xs text-foreground block">{score.nome}</span>
                          <span className="text-[10px] text-muted-foreground font-medium block">
                            Baseado em {score.avaliacoesCount} {score.avaliacoesCount === 1 ? "avaliação" : "avaliações"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {renderEstrelasDisplay(score.media, "h-4 w-4")}
                        <span className={cn(
                          "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0",
                          score.media >= 4.5
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : score.media >= 3.5
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                        )}>
                          {score.media >= 4.5 ? "Excelente" : score.media >= 3.5 ? "Bom" : "Regular"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-accent/10">
              <h3 className="font-semibold text-sm">Histórico Detalhado de Avaliações</h3>
              <p className="text-xs text-muted-foreground">Registros individuais de prazo, qualidade e comentários de entrega</p>
            </div>
            <div className="p-6">
              {avaliacoes.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Nenhuma avaliação registrada no histórico do ERP.
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 divide-y divide-border">
                  {avaliacoes.map((item, idx) => (
                    <div key={item.id} className={cn("pt-4 flex flex-col gap-2", idx === 0 && "pt-0")}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div>
                          <span className="font-bold text-foreground">{item.fornecedorNome}</span>
                          <span className="text-[10px] font-mono text-muted-foreground ml-1.5 uppercase">
                            ({item.id})
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.dataAvaliacao).toLocaleDateString("pt-BR")} por {item.usuarioResponsavel}
                        </span>
                      </div>

                      <div className="grid gap-2 grid-cols-3 text-[10px] uppercase font-bold text-muted-foreground">
                        <div className="bg-accent/40 rounded p-1.5 border border-border/40 text-center">
                          Prazo: <span className="text-foreground">{item.prazoEntrega}/5</span>
                        </div>
                        <div className="bg-accent/40 rounded p-1.5 border border-border/40 text-center">
                          Qualidade: <span className="text-foreground">{item.qualidadeEntrega}/5</span>
                        </div>
                        <div className="bg-accent/40 rounded p-1.5 border border-border/40 text-center">
                          Frequência: <span className="text-foreground">{item.frequenciaEntrega}/5</span>
                        </div>
                      </div>

                      {item.comentarios && (
                        <p className="text-xs text-muted-foreground bg-accent/25 rounded-lg p-2.5 border border-border/30 italic">
                          &ldquo;{item.comentarios}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Registrar Avaliação</h3>
              <p className="text-xs text-muted-foreground">Inserir novas métricas de desempenho de entrega</p>
            </div>
          </div>

          {fornecedoresAtivos.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground bg-accent/5">
              Não existem fornecedores ativos cadastrados para avaliar. Por favor, cadastre um parceiro ativo primeiro.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {successMsg && (
                <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Fornecedor Avaliado</label>
                <select
                  value={fornecedorId}
                  onChange={(e) => setFornecedorId(e.target.value)}
                  className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  {fornecedoresAtivos.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.razaoSocial} ({f.id})
                    </option>
                  ))}
                </select>
              </div>

              {renderEstrelasInput("Prazo de Entrega", prazoEntrega, setPrazoEntrega)}
              {renderEstrelasInput("Qualidade da Entrega", qualidadeEntrega, setQualidadeEntrega)}
              {renderEstrelasInput("Frequência de Entrega", frequenciaEntrega, setFrequenciaEntrega)}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">Índice de Desempenho</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{mediaTempoReal.toFixed(1)}</span>
                </div>
                <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      mediaTempoReal >= 4.5
                        ? "bg-emerald-500"
                        : mediaTempoReal >= 3.5
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    )}
                    style={{ width: `${(mediaTempoReal / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Comentários e Observações</label>
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Descreva detalhes adicionais sobre prazo ou conformidade..."
                  className="w-full h-20 bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none resize-none"
                />
              </div>

              <Button type="submit" className="w-full h-8 text-xs font-semibold">
                Gravar Avaliação
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
