"use client";

import React, { useState } from "react";
import { useWorkflow, Workflow, ETAPAS_WORKFLOW } from "@/hooks/useWorkflow";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GitBranch,
  Plus,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkflowManager() {
  const { user } = useAuth();
  const {
    workflows,
    historicoAtividades,
    error,
    setError,
    criarWorkflow,
    atualizarWorkflow,
    verificarPermissao,
  } = useWorkflow();

  // Criar Workflow Fields
  const [nomeFluxo, setNomeFluxo] = useState("");
  const [etapaConfigurada, setEtapaConfigurada] = useState(ETAPAS_WORKFLOW[0]);
  const [processoVinculado, setProcessoVinculado] = useState("");
  const [formCriarOpen, setFormCriarOpen] = useState(false);

  // Editar Workflow Fields
  const [workflowParaEditar, setWorkflowParaEditar] = useState<Workflow | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editEtapa, setEditEtapa] = useState("");
  const [editStatus, setEditStatus] = useState<Workflow["statusExecucao"]>("pendente");

  const temPermissao = verificarPermissao();

  const handleCriar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeFluxo || !processoVinculado) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const sucesso = criarWorkflow(nomeFluxo, etapaConfigurada, processoVinculado);
    if (sucesso) {
      setNomeFluxo("");
      setEtapaConfigurada(ETAPAS_WORKFLOW[0]);
      setProcessoVinculado("");
      setFormCriarOpen(false);
    }
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowParaEditar) return;
    const sucesso = atualizarWorkflow(workflowParaEditar.id, {
      nomeFluxo: editNome,
      etapaConfigurada: editEtapa,
      statusExecucao: editStatus,
    });
    if (sucesso) {
      setWorkflowParaEditar(null);
    }
  };

  const abrirEdicao = (w: Workflow) => {
    setWorkflowParaEditar(w);
    setEditNome(w.nomeFluxo);
    setEditEtapa(w.etapaConfigurada);
    setEditStatus(w.statusExecucao);
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
      {!temPermissao && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 no-print">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            <strong>Acesso de Alteração Restrito:</strong> Modificar e agendar fluxos operacionais exige privilégios de Administrador ou Gerente.
          </span>
        </div>
      )}

      {/* Ações */}
      {temPermissao && (
        <div className="flex justify-end border-b border-border pb-4">
          <Button
            onClick={() => {
              setFormCriarOpen(true);
              setError(null);
            }}
            className="h-9 shadow-md font-semibold gap-2"
          >
            <Plus className="h-4 w-4" /> Configurar Workflow
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel Central: Lista de Workflows */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base tracking-tight flex items-center gap-2 border-b border-border pb-3">
            <GitBranch className="h-5 w-5 text-primary animate-pulse" />
            Fluxo de Workflows Ativos e Programados
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {workflows.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhum fluxo de workflow configurado.
              </div>
            ) : (
              workflows.map((w) => {
                const encerrado = w.statusExecucao === "concluido" || w.statusExecucao === "cancelado";
                return (
                  <div
                    key={w.id}
                    className={cn(
                      "p-4 rounded-xl border bg-card hover:shadow-md transition-all space-y-3",
                      encerrado ? "border-border/60 bg-accent/10" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">
                        {w.id}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase whitespace-nowrap",
                          w.statusExecucao === "concluido"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : w.statusExecucao === "em_andamento"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : w.statusExecucao === "cancelado"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-500"
                        )}
                      >
                        {w.statusExecucao === "em_andamento" ? "Em Andamento" : w.statusExecucao}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-primary font-bold uppercase block">
                        Processo: {w.processoVinculado}
                      </span>
                      <h4 className="text-xs font-bold text-foreground truncate">{w.nomeFluxo}</h4>
                      
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-muted-foreground">Etapa Atual:</span>
                        <span className="bg-accent px-1.5 py-0.5 rounded text-[10px] font-bold text-foreground">
                          {w.etapaConfigurada}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span>Prioridade do Fluxo:</span>
                        <span
                          className={cn(
                            "font-bold uppercase",
                            w.prioridade === "alta"
                              ? "text-destructive"
                              : w.prioridade === "media"
                              ? "text-amber-500"
                              : "text-blue-500"
                          )}
                        >
                          {w.prioridade}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-2 border-t border-border/40">
                      <span className="flex items-center gap-0.5">
                        <User className="h-3 w-3" /> {w.responsavelEtapa}
                      </span>
                      <span className="flex items-center gap-0.5" suppressHydrationWarning>
                        <Calendar className="h-3 w-3" /> {new Date(w.dataExecucao).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    {temPermissao && !encerrado && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => abrirEdicao(w)}
                        className="w-full h-7 text-[10px] font-bold mt-1"
                      >
                        <Edit className="h-3 w-3 mr-1" /> Alterar Etapa / Status
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Histórico de Atividades */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
              Histórico de Atividades (Auditoria Imutável)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Logs históricos blindados de configurações e evoluções de etapas operacionais.
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
            {historicoAtividades.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhuma alteração registrada em workflows.
              </div>
            ) : (
              historicoAtividades.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-border/80 bg-accent/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold text-primary">
                      {log.nomeFluxo}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      Ref: {log.workflowId}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      Modificação em: <span className="text-primary">{log.campoAlterado}</span>
                    </p>
                    <div className="p-2 rounded bg-card border border-border/40 text-[9px] space-y-0.5 text-muted-foreground leading-relaxed">
                      <div>
                        <strong>De:</strong> {log.valorAntigo}
                      </div>
                      <div className="border-t border-border/40 pt-1 mt-1 text-foreground font-medium">
                        <strong>Para:</strong> {log.valorNovo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-muted-foreground border-t border-border/20 pt-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.dataAlteracao).toLocaleString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <User className="h-3 w-3" /> {log.responsavel}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar Workflow */}
      {formCriarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Configurar Workflow Empresarial
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
                  Nome do Fluxo
                </label>
                <Input
                  required
                  placeholder="Ex: Aprovação de Desconto no Comercial"
                  value={nomeFluxo}
                  onChange={(e) => setNomeFluxo(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Processo Vinculado (Imutável após salvar)
                </label>
                <Input
                  required
                  placeholder="Ex: Faturamento Financeiro"
                  value={processoVinculado}
                  onChange={(e) => setProcessoVinculado(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Etapa Inicial Configurada
                </label>
                <select
                  value={etapaConfigurada}
                  onChange={(e) => setEtapaConfigurada(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  {ETAPAS_WORKFLOW.map((et) => (
                    <option key={et} value={et}>
                      {et}
                    </option>
                  ))}
                </select>
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
                  Confirmar Workflow
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Workflow */}
      {workflowParaEditar && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                Alterar Etapa / Status
              </h3>
              <button
                onClick={() => setWorkflowParaEditar(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Nome do Fluxo
                </label>
                <Input
                  required
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    ID do Workflow
                  </label>
                  <Input
                    disabled
                    value={workflowParaEditar.id}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Processo (Imutável)
                  </label>
                  <Input
                    disabled
                    value={workflowParaEditar.processoVinculado}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Etapa Configurada
                  </label>
                  <select
                    value={editEtapa}
                    onChange={(e) => setEditEtapa(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {ETAPAS_WORKFLOW.map((et) => (
                      <option key={et} value={et}>
                        {et}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Status da Execução
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Workflow["statusExecucao"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setWorkflowParaEditar(null)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Salvar Modificações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
