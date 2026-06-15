"use client";

import React, { useState, useEffect } from "react";
import {
  Oportunidade,
  StatusOportunidade,
  TRANSICOES_VALIDAS,
  statusLabels,
  prioridadeLabels,
} from "@/hooks/useOportunidades";
import { HistoricoMovimentacoes } from "./HistoricoMovimentacoes";
import {
  X,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Save,
  TrendingUp,
  History,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PainelDetalhesProps {
  oportunidade: Oportunidade | null;
  onClose: () => void;
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

type Tab = "detalhes" | "historico";

const stageColors: Record<StatusOportunidade, string> = {
  prospeccao: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  qualificacao: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  proposta: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  negociacao: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  fechado_ganho: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  fechado_perdido: "bg-destructive/10 text-destructive",
};

const MAX_VALOR = 99_999_999.99;

function parseBRL(raw: string): number {
  // Remove currency symbol, spaces, dots (thousands), replace comma with dot
  const cleaned = raw
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function formatBRLInput(val: number): string {
  if (!val && val !== 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function PainelDetalhes({
  oportunidade,
  onClose,
  onAvancarEtapa,
  onEditar,
}: PainelDetalhesProps) {
  const [tab, setTab] = useState<Tab>("detalhes");

  // Editable form state
  const [titulo, setTitulo] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [valorStr, setValorStr] = useState("");
  const [valorErro, setValorErro] = useState("");
  const [probabilidade, setProbabilidade] = useState(50);
  const [dataFechamento, setDataFechamento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editFeedback, setEditFeedback] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);

  // Stage advance state
  const [etapaDestino, setEtapaDestino] = useState<StatusOportunidade | null>(null);
  const [observacao, setObservacao] = useState("");
  const [advanceFeedback, setAdvanceFeedback] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);

  // Sync form with selected oportunidade
  useEffect(() => {
    if (!oportunidade) return;
    setTitulo(oportunidade.titulo);
    setResponsavel(oportunidade.responsavel);
    setValorStr(formatBRLInput(oportunidade.valorEstimado));
    setValorErro("");
    setProbabilidade(oportunidade.probabilidade);
    setDataFechamento(oportunidade.dataFechamentoPrevisto);
    setDescricao(oportunidade.descricao);
    setEtapaDestino(null);
    setObservacao("");
    setEditFeedback(null);
    setAdvanceFeedback(null);
    setTab("detalhes");
  }, [oportunidade?.id]);

  if (!oportunidade) return null;

  const transicoesDisponiveis = TRANSICOES_VALIDAS[oportunidade.status];
  const isFinalState = transicoesDisponiveis.length === 0;

  // ─── Monetary validation ────────────────────────────────────────────────────
  const handleValorChange = (raw: string) => {
    setValorStr(raw);
    const num = parseBRL(raw);
    if (isNaN(num) || num <= 0) {
      setValorErro("Valor deve ser maior que R$ 0,00.");
    } else if (num > MAX_VALOR) {
      setValorErro(`Valor não pode exceder ${formatBRLInput(MAX_VALOR)}.`);
    } else {
      setValorErro("");
    }
  };

  const handleValorBlur = () => {
    const num = parseBRL(valorStr);
    if (!isNaN(num) && num > 0) {
      setValorStr(formatBRLInput(num));
    }
  };

  // ─── Save editable fields ───────────────────────────────────────────────────
  const handleSalvar = () => {
    if (valorErro) return;
    const num = parseBRL(valorStr);
    if (isNaN(num) || num <= 0) {
      setValorErro("Informe um valor monetário válido.");
      return;
    }

    const result = onEditar(oportunidade.id, {
      titulo,
      responsavel,
      valorEstimado: num,
      probabilidade,
      dataFechamentoPrevisto: dataFechamento,
      descricao,
    });

    setEditFeedback(
      result.sucesso
        ? { tipo: "ok", msg: "Dados salvos com sucesso." }
        : { tipo: "erro", msg: result.erro || "Erro ao salvar." }
    );
    setTimeout(() => setEditFeedback(null), 3500);
  };

  // ─── Advance stage ──────────────────────────────────────────────────────────
  const handleAvancar = () => {
    if (!etapaDestino) return;

    const result = onAvancarEtapa(oportunidade.id, etapaDestino, observacao || undefined);

    if (result.sucesso) {
      setAdvanceFeedback({ tipo: "ok", msg: `Etapa avançada para "${statusLabels[etapaDestino]}".` });
      setEtapaDestino(null);
      setObservacao("");
      // Switch to history tab to show the new record
      setTimeout(() => {
        setTab("historico");
        setAdvanceFeedback(null);
      }, 1500);
    } else {
      setAdvanceFeedback({ tipo: "erro", msg: result.erro || "Erro ao avançar etapa." });
      setTimeout(() => setAdvanceFeedback(null), 4000);
    }
  };

  const inputClass =
    "w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all";

  const readonlyClass =
    "w-full bg-accent/20 border border-border/60 rounded-md px-3 py-2 text-sm text-muted-foreground flex items-center gap-2 cursor-not-allowed";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Sliding panel */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-md border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-250">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 border-b border-border p-4 bg-accent/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-violet-500/10 shrink-0">
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-mono">{oportunidade.id}</p>
              <h3 className="text-sm font-bold leading-tight truncate">{oportunidade.titulo}</h3>
            </div>
          </div>
          <button
            id="fechar-painel-pipeline"
            onClick={onClose}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent"
            aria-label="Fechar painel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Stage badge ─────────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-border/60 bg-accent/5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Etapa atual:</span>
            <span
              className={cn(
                "inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full",
                stageColors[oportunidade.status]
              )}
            >
              {statusLabels[oportunidade.status]}
            </span>
            {isFinalState && (
              <span className="text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                Estado final
              </span>
            )}
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────────── */}
        <div className="flex border-b border-border shrink-0">
          <button
            onClick={() => setTab("detalhes")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
              tab === "detalhes"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Info className="h-3.5 w-3.5" />
            Detalhes
          </button>
          <button
            onClick={() => setTab("historico")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
              tab === "historico"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="h-3.5 w-3.5" />
            Histórico
            {oportunidade.historico.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary">
                {oportunidade.historico.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {tab === "detalhes" && (
            <div className="p-4 space-y-5">
              {/* Protected fields */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Campos Protegidos
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      ID da Oportunidade
                    </label>
                    <div className={readonlyClass}>
                      <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                      <span className="font-mono text-xs">{oportunidade.id}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Cliente
                    </label>
                    <div className={readonlyClass}>
                      <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                      <span className="text-xs font-medium">{oportunidade.cliente}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Editable fields */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Informações Editáveis
                </p>

                {/* Título */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Título</label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Responsável */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Responsável</label>
                  <input
                    type="text"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Valor estimado – validação monetária estrita */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={valorStr}
                    onChange={(e) => handleValorChange(e.target.value)}
                    onBlur={handleValorBlur}
                    placeholder="0,00"
                    className={cn(inputClass, valorErro && "border-destructive focus:border-destructive focus:ring-destructive/20")}
                  />
                  {valorErro && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {valorErro}
                    </p>
                  )}
                </div>

                {/* Probabilidade */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Probabilidade: <span className="font-bold text-foreground">{probabilidade}%</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={probabilidade}
                    onChange={(e) => setProbabilidade(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* Data fechamento */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Data de Fechamento Prevista
                  </label>
                  <input
                    type="date"
                    value={dataFechamento}
                    onChange={(e) => setDataFechamento(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                  <textarea
                    rows={3}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className={cn(inputClass, "resize-none")}
                  />
                </div>

                {/* Save feedback */}
                {editFeedback && (
                  <div
                    className={cn(
                      "flex items-center gap-2 text-xs rounded-lg px-3 py-2",
                      editFeedback.tipo === "ok"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {editFeedback.tipo === "ok" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {editFeedback.msg}
                  </div>
                )}

                <Button
                  onClick={handleSalvar}
                  disabled={!!valorErro}
                  className="w-full gap-1.5 text-xs"
                  size="sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  Salvar Alterações
                </Button>
              </div>

              <div className="h-px bg-border" />

              {/* Stage progression */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Progressão de Etapa
                </p>

                {isFinalState ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/30 rounded-lg px-3 py-3">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>
                      Esta oportunidade está em um estado final e não pode ser avançada.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Selecione a próxima etapa:</p>
                      <div className="flex flex-wrap gap-2">
                        {transicoesDisponiveis.map((etapa) => (
                          <button
                            key={etapa}
                            onClick={() =>
                              setEtapaDestino(etapaDestino === etapa ? null : etapa)
                            }
                            className={cn(
                              "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                              etapaDestino === etapa
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            )}
                          >
                            {statusLabels[etapa]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {etapaDestino && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                        <label className="text-xs font-medium text-muted-foreground">
                          Observação (opcional)
                        </label>
                        <textarea
                          rows={2}
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          placeholder="Descreva o motivo da progressão..."
                          className={cn(inputClass, "resize-none")}
                        />
                      </div>
                    )}

                    {/* Advance feedback */}
                    {advanceFeedback && (
                      <div
                        className={cn(
                          "flex items-center gap-2 text-xs rounded-lg px-3 py-2",
                          advanceFeedback.tipo === "ok"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {advanceFeedback.tipo === "ok" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        {advanceFeedback.msg}
                      </div>
                    )}

                    <Button
                      onClick={handleAvancar}
                      disabled={!etapaDestino}
                      className="w-full gap-1.5 text-xs"
                      size="sm"
                      variant={etapaDestino ? "default" : "outline"}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      {etapaDestino
                        ? `Avançar para "${statusLabels[etapaDestino]}"`
                        : "Selecione uma etapa acima"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "historico" && (
            <div className="p-4">
              <HistoricoMovimentacoes historico={oportunidade.historico} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
