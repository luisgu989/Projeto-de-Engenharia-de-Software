"use client";

import React, { useState } from "react";
import { useSolicitacoesInternas, SolicitacaoInterna, CATEGORIAS_SOLICITACAO } from "@/hooks/useSolicitacoesInternas";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  Edit,
  ClipboardList,
  CheckSquare,
  History,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SolicitacoesInternas() {
  const { user } = useAuth();
  const {
    solicitacoes,
    error,
    setError,
    criarSolicitacao,
    decidirSolicitacao,
    verificarPermissaoAprovacao
  } = useSolicitacoesInternas();

  // Criar Solicitação Fields
  const [codigoSolicitacao, setCodigoSolicitacao] = useState("");
  const [tipoSolicitacao, setTipoSolicitacao] = useState<SolicitacaoInterna["tipoSolicitacao"]>("Material");
  const [responsavelAprovacao, setResponsavelAprovacao] = useState("");
  const [justificativaCriacao, setJustificativaCriacao] = useState("");
  const [formCriarOpen, setFormCriarOpen] = useState(false);

  // Decisão Fields (Aprovação / Rejeição)
  const [solicitacaoParaDecidir, setSolicitacaoParaDecidir] = useState<SolicitacaoInterna | null>(null);
  const [tipoDecisao, setTipoDecisao] = useState<"aprovada" | "rejeitada" | null>(null);
  const [justificativaDecisao, setJustificativaDecisao] = useState("");

  const temPermissaoAprovacao = verificarPermissaoAprovacao();

  const handleCriar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!codigoSolicitacao.trim() || !responsavelAprovacao.trim() || !justificativaCriacao.trim()) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const sucesso = criarSolicitacao(
      codigoSolicitacao,
      tipoSolicitacao,
      responsavelAprovacao,
      justificativaCriacao
    );

    if (sucesso) {
      setCodigoSolicitacao("");
      setTipoSolicitacao("Material");
      setResponsavelAprovacao("");
      setJustificativaCriacao("");
      setFormCriarOpen(false);
    }
  };

  const handleDecidir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitacaoParaDecidir || !tipoDecisao) return;
    setError(null);

    if (!justificativaDecisao.trim()) {
      setError("Por favor, preencha a justificativa da decisão.");
      return;
    }

    const sucesso = decidirSolicitacao(solicitacaoParaDecidir.id, tipoDecisao, justificativaDecisao);
    if (sucesso) {
      setSolicitacaoParaDecidir(null);
      setTipoDecisao(null);
      setJustificativaDecisao("");
    }
  };

  const abrirDecisao = (s: SolicitacaoInterna, acao: "aprovada" | "rejeitada") => {
    setSolicitacaoParaDecidir(s);
    setTipoDecisao(acao);
    setJustificativaDecisao("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de Erro */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive animate-in fade-in duration-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:opacity-80 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Banner de permissão */}
      {!temPermissaoAprovacao && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 no-print">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            <strong>Acesso de Decisão Restrito:</strong> Aprovar ou rejeitar solicitações administrativas entre setores exige perfil de Administrador, Gerente ou Diretor.
          </span>
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-sm text-muted-foreground">Módulo de aprovações operacionais do ERP</h3>
        </div>
        <Button
          onClick={() => {
            setFormCriarOpen(true);
            setError(null);
          }}
          className="h-9 shadow-md font-semibold gap-2"
        >
          <Plus className="h-4 w-4" /> Criar Solicitação
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel Central: Lista de Solicitações */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base tracking-tight flex items-center gap-2 border-b border-border pb-3">
            <ClipboardList className="h-5 w-5 text-primary animate-pulse" />
            Solicitações Administrativas Pendentes e Concluídas
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {solicitacoes.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhuma solicitação administrativa interna registrada.
              </div>
            ) : (
              solicitacoes.map((s) => {
                const decidida = s.statusSolicitacao !== "pendente";
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "p-4 rounded-xl border bg-card hover:shadow-md transition-all space-y-3",
                      decidida ? "border-border/60 bg-accent/10" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-bold text-muted-foreground">
                        {s.id}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase whitespace-nowrap",
                          s.statusSolicitacao === "aprovada"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : s.statusSolicitacao === "rejeitada"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-500"
                        )}
                      >
                        {s.statusSolicitacao}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-primary font-bold uppercase">
                          Cód: {s.codigoSolicitacao}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-accent text-[9px] font-bold text-foreground">
                          {s.tipoSolicitacao}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic pt-1 leading-normal">
                        "{s.historicoAprovacoes[0]?.justificativa}"
                      </p>

                      <div className="flex flex-col gap-0.5 pt-2 text-[10px] text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Solicitante:</span>
                          <span className="font-semibold text-foreground">{s.solicitante}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Responsável:</span>
                          <span className="font-semibold text-foreground">{s.responsavelAprovacao}</span>
                        </div>
                        {s.dataAprovacao && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>Conclusão:</span>
                            <span className="font-mono" suppressHydrationWarning>{new Date(s.dataAprovacao).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-2 border-t border-border/40">
                      <span className="flex items-center gap-0.5" suppressHydrationWarning>
                        <Calendar className="h-3 w-3" /> {new Date(s.dataSolicitacao).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    {!decidida && temPermissaoAprovacao && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => abrirDecisao(s, "rejeitada")}
                          className="h-7 text-[10px] font-bold text-destructive hover:bg-destructive/10 border-destructive/20"
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Rejeitar
                        </Button>
                        <Button
                          size="xs"
                          onClick={() => abrirDecisao(s, "aprovada")}
                          className="h-7 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Aprovar
                        </Button>
                      </div>
                    )}

                    {!decidida && !temPermissaoAprovacao && (
                      <div className="pt-2 text-center text-[10px] font-medium text-muted-foreground bg-accent/40 rounded py-1 flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" /> Aguardando Decisão Gerencial
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Histórico de Aprovadores/Logs */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-primary shrink-0" />
              Auditoria do Fluxo de Aprovações (Imutável)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trilha técnica blindada de criação e atualização dos status das solicitações internas.
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
            {solicitacoes.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhuma alteração registrada.
              </div>
            ) : (
              solicitacoes.flatMap((s) => s.historicoAprovacoes.map((log, index) => ({ ...log, sId: s.id, sCod: s.codigoSolicitacao, index })))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((log) => (
                  <div
                    key={`${log.sId}-${log.index}`}
                    className={cn(
                      "p-3 rounded-xl border border-border/80 bg-accent/20 space-y-2 text-xs",
                      log.acao === "aprovacao" && "border-emerald-500/20 bg-emerald-500/[0.01]",
                      log.acao === "rejeicao" && "border-destructive/20 bg-destructive/[0.01]"
                    )}
                  >
                    <div className="flex items-center justify-between font-mono text-[9px]">
                      <span className="font-bold text-primary">{log.sCod}</span>
                      <span className="text-muted-foreground">Ação: {log.acao.toUpperCase()}</span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-foreground/80 flex items-center gap-1">
                        <User className="h-3 w-3" /> Executor: {log.usuario}
                      </p>
                      <p className="text-[10px] text-muted-foreground italic bg-card border border-border/30 rounded p-1.5">
                        "{log.justificativa}"
                      </p>
                    </div>

                    <div className="text-[8px] text-muted-foreground font-mono text-right">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar Solicitação */}
      {formCriarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Criar Solicitação Setorial
              </h3>
              <button
                onClick={() => setFormCriarOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriar} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Código da Requisition (Único)
                </label>
                <Input
                  required
                  placeholder="Ex: REQ-2026-X881"
                  value={codigoSolicitacao}
                  onChange={(e) => setCodigoSolicitacao(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Categoria da Solicitação
                  </label>
                  <select
                    value={tipoSolicitacao}
                    onChange={(e) => setTipoSolicitacao(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {CATEGORIAS_SOLICITACAO.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Aprovador Responsável
                  </label>
                  <Input
                    required
                    placeholder="Ex: Usuário Suporte"
                    value={responsavelAprovacao}
                    onChange={(e) => setResponsavelAprovacao(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Justificativa da Solicitação
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva detalhadamente o motivo da solicitação..."
                  value={justificativaCriacao}
                  onChange={(e) => setJustificativaCriacao(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground resize-none leading-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormCriarOpen(false)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Mapear Solicitação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Decidir Solicitação */}
      {solicitacaoParaDecidir && tipoDecisao && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Justificar {tipoDecisao === "aprovada" ? "Aprovação" : "Rejeição"}
              </h3>
              <button
                onClick={() => {
                  setSolicitacaoParaDecidir(null);
                  setTipoDecisao(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDecidir} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                  Justificativa Técnica da Decisão
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={`Explique o motivo pelo qual esta solicitação está sendo ${tipoDecisao === "aprovada" ? "aprovada" : "rejeitada"}...`}
                  value={justificativaDecisao}
                  onChange={(e) => setJustificativaDecisao(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground resize-none leading-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSolicitacaoParaDecidir(null);
                    setTipoDecisao(null);
                  }}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className={cn(
                    "h-9 text-xs font-semibold text-white",
                    tipoDecisao === "aprovada" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/95"
                  )}
                >
                  Confirmar {tipoDecisao === "aprovada" ? "Aprovação" : "Rejeição"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
