import React from "react";
import { Oportunidade, prioridadeLabels } from "@/hooks/useOportunidades";
import { User, Calendar, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardOportunidadeProps {
  oportunidade: Oportunidade;
  onClick: (op: Oportunidade) => void;
}

const prioridadeStyle: Record<string, string> = {
  alta: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
  media: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  baixa: "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20",
};

export function CardOportunidade({ oportunidade, onClick }: CardOportunidadeProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: val >= 1_000_000 ? "compact" : "standard",
      maximumFractionDigits: val >= 1_000_000 ? 1 : 0,
    }).format(val);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });

  const isOverdue =
    oportunidade.status !== "fechado_ganho" &&
    oportunidade.status !== "fechado_perdido" &&
    new Date(oportunidade.dataFechamentoPrevisto) < new Date();

  return (
    <button
      onClick={() => onClick(oportunidade)}
      className={cn(
        "w-full text-left p-3.5 rounded-xl border bg-card hover:bg-accent/30 transition-all duration-150 shadow-sm hover:shadow-md space-y-3 group cursor-pointer",
        "border-border hover:border-ring/30 focus:outline-none focus:ring-2 focus:ring-ring/20"
      )}
    >
      {/* Header: priority + ID */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide",
            prioridadeStyle[oportunidade.prioridade]
          )}
        >
          {prioridadeLabels[oportunidade.prioridade]}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
          {oportunidade.id}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
        {oportunidade.titulo}
      </p>

      {/* Client */}
      <p className="text-xs text-muted-foreground truncate font-medium">
        {oportunidade.cliente}
      </p>

      {/* Probability bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
          <span>Probabilidade</span>
          <span>{oportunidade.probabilidade}%</span>
        </div>
        <div className="h-1 w-full bg-accent rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              oportunidade.probabilidade >= 70
                ? "bg-emerald-500"
                : oportunidade.probabilidade >= 40
                ? "bg-amber-500"
                : "bg-slate-400"
            )}
            style={{ width: `${oportunidade.probabilidade}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/60">
        <span className="text-sm font-bold tracking-tight text-foreground">
          {formatCurrency(oportunidade.valorEstimado)}
        </span>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {oportunidade.historico.length > 0 && (
            <span className="flex items-center gap-0.5">
              <History className="h-3 w-3" />
              {oportunidade.historico.length}
            </span>
          )}
          <span
            className={cn(
              "flex items-center gap-0.5",
              isOverdue && "text-destructive font-semibold"
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(oportunidade.dataFechamentoPrevisto)}
          </span>
        </div>
      </div>

      {/* Responsible */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-2.5 w-2.5 text-primary" />
        </div>
        <span className="truncate">{oportunidade.responsavel}</span>
      </div>
    </button>
  );
}
