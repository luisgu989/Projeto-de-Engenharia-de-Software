"use client";

import React, { useState } from "react";
import { useMetas } from "@/hooks/useMetas";
import { Button } from "@/components/ui/button";
import { Target, AlertCircle, Trash2, Calendar, ShieldCheck, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetasOrganizacionaisComponent() {
  const { metas, error, adicionarMeta, removerMeta } = useMetas();

  const [tipoMeta, setTipoMeta] = useState("Financeira");
  const [indicadorVinculado, setIndicadorVinculado] = useState("Faturamento Mensal");
  const [valorDefinido, setValorDefinido] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);

  // Mapeamento de indicadores conforme o Tipo de Meta selecionado
  const handleTipoMetaChange = (tipo: string) => {
    setTipoMeta(tipo);
    if (tipo === "Financeira") {
      setIndicadorVinculado("Faturamento Mensal");
    } else if (tipo === "Vendas") {
      setIndicadorVinculado("Quantidade de Vendas");
    } else if (tipo === "Estoque") {
      setIndicadorVinculado("Alertas de Baixo Estoque");
    } else if (tipo === "Produção") {
      setIndicadorVinculado("Volume Total de Peças");
    }
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adicionarMeta(tipoMeta, indicadorVinculado, valorDefinido);
    if (success) {
      setValorDefinido(0);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Monitoramento de Metas Organizacionais
          </h3>
          <p className="text-xs text-muted-foreground">
            Defina e gerencie objetivos estratégicos corporativos. O ERP recalcula o progresso de execução em tempo real.
          </p>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 font-semibold gap-1.5 cursor-pointer shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Definir Nova Meta
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSalvar} className="p-6 rounded-2xl border border-border bg-card shadow-sm grid gap-4 sm:grid-cols-4 items-end animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Tipo de Meta</label>
            <select
              value={tipoMeta}
              onChange={(e) => handleTipoMetaChange(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-2.5 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
            >
              <option value="Financeira">Financeira</option>
              <option value="Vendas">Vendas</option>
              <option value="Estoque">Estoque</option>
              <option value="Produção">Produção</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Indicador Vinculado</label>
            <select
              value={indicadorVinculado}
              onChange={(e) => setIndicadorVinculado(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-2.5 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
            >
              {tipoMeta === "Financeira" && <option value="Faturamento Mensal">Faturamento Mensal</option>}
              {tipoMeta === "Vendas" && <option value="Quantidade de Vendas">Quantidade de Vendas</option>}
              {tipoMeta === "Estoque" && (
                <>
                  <option value="Alertas de Baixo Estoque">Alertas de Baixo Estoque</option>
                  <option value="Volume Total de Peças">Volume Total de Peças</option>
                </>
              )}
              {tipoMeta === "Produção" && <option value="Volume Total de Peças">Volume Total de Peças</option>}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Valor Alvo (Definido)</label>
            <input
              type="number"
              min="0"
              value={valorDefinido}
              onChange={(e) => setValorDefinido(parseFloat(e.target.value) || 0)}
              className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-3 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="w-full h-8.5 bg-accent hover:bg-accent/80 text-foreground font-semibold text-xs rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <Button type="submit" className="w-full h-8.5 text-xs font-semibold cursor-pointer">
              Salvar Registro
            </Button>
          </div>

          {error && (
            <div className="sm:col-span-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      )}

      {/* Goals Display List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metas.length === 0 ? (
          <div className="md:col-span-3 p-12 text-center border border-dashed border-border bg-card rounded-2xl text-xs text-muted-foreground font-semibold">
            Nenhuma meta estratégica cadastrada no momento. Clique em "Definir Nova Meta" para começar.
          </div>
        ) : (
          metas.map((m) => (
            <div key={m.idMeta} className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between space-y-5">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] bg-accent/60 text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                      {m.idMeta}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <User className="h-3 w-3" /> {m.usuarioResponsavel}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{m.indicadorVinculado}</h4>
                  <span className="inline-flex text-[9px] font-extrabold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {m.tipoMeta}
                  </span>
                </div>

                <button
                  onClick={() => removerMeta(m.idMeta)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                  title="Excluir meta"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Progress calculation display */}
              <div className="space-y-2">
                <div className="flex justify-between items-end text-xs font-semibold">
                  <span className="text-muted-foreground">Progresso Atual</span>
                  <span className="text-foreground">{m.progressoAtual}%</span>
                </div>

                <div className="h-3 w-full bg-accent/60 rounded-full overflow-hidden border border-border/20">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      m.progressoAtual >= 100
                        ? "bg-emerald-500"
                        : m.progressoAtual >= 75
                        ? "bg-primary"
                        : m.progressoAtual >= 40
                        ? "bg-amber-500"
                        : "bg-destructive"
                    )}
                    style={{ width: `${m.progressoAtual}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-muted-foreground font-semibold">
                  <span>Atual: <strong>{m.indicadorVinculado === "Faturamento Mensal" ? `R$ ${m.valorAtual.toLocaleString("pt-BR")}` : `${m.valorAtual} un.`}</strong></span>
                  <span>Meta: <strong>{m.indicadorVinculado === "Faturamento Mensal" ? `R$ ${m.valorDefinido.toLocaleString("pt-BR")}` : `${m.valorDefinido} un.`}</strong></span>
                </div>
              </div>

              {/* Auditing Fields / Immutability notification */}
              <div className="pt-3 border-t border-border flex justify-between items-center text-[9px] text-muted-foreground font-bold font-mono">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> CONTROLE OCULTO</span>
                <span>{new Date(m.dataCadastro).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
