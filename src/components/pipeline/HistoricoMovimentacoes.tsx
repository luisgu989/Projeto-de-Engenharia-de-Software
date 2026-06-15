import React from "react";
import { MovimentacaoPipeline, statusLabels } from "@/hooks/useOportunidades";
import { ArrowRight, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoricoMovimentacoesProps {
  historico: MovimentacaoPipeline[];
}

export function HistoricoMovimentacoes({ historico }: HistoricoMovimentacoesProps) {
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const stageColors: Record<string, string> = {
    prospeccao: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    qualificacao: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    proposta: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    negociacao: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    fechado_ganho: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    fechado_perdido: "bg-destructive/10 text-destructive",
  };

  if (historico.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
        <div className="p-3 rounded-full bg-accent/50">
          <Clock className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Nenhuma movimentação registrada
        </p>
        <p className="text-xs text-muted-foreground/60">
          As progressões de etapa aparecerão aqui automaticamente.
        </p>
      </div>
    );
  }

  // Mostrar mais recente primeiro
  const historicoOrdenado = [...historico].reverse();

  return (
    <div className="relative space-y-0">
      {/* Linha vertical da timeline */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

      {historicoOrdenado.map((mov, idx) => (
        <div key={mov.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Dot na timeline */}
          <div
            className={cn(
              "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold shadow-sm",
              idx === 0
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-accent text-muted-foreground"
            )}
          >
            {historicoOrdenado.length - idx}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0 space-y-2 pt-1">
            {/* Transição de etapas */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded",
                  stageColors[mov.etapaAnterior]
                )}
              >
                {statusLabels[mov.etapaAnterior]}
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded",
                  stageColors[mov.etapaNova]
                )}
              >
                {statusLabels[mov.etapaNova]}
              </span>
            </div>

            {/* Observação */}
            {mov.observacao && (
              <p className="text-xs text-foreground/80 bg-accent/30 rounded-lg px-3 py-2 leading-relaxed border border-border/60">
                &ldquo;{mov.observacao}&rdquo;
              </p>
            )}

            {/* Executor + data */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="font-medium">{mov.executor}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(mov.data)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
