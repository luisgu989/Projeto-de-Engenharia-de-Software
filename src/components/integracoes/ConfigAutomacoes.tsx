"use client";

import React, { useState } from "react";
import { useAutomacoes, AutomacaoProcesso } from "@/hooks/useAutomacoes";
import { useAuth } from "@/contexts/auth-context";
import {
  Play,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Trash2,
  Edit2,
  Plus,
  Zap,
  Clock,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigAutomacoes() {
  const { user } = useAuth();
  const {
    automacoes,
    adicionarAutomacao,
    atualizarAutomacao,
    removerAutomacao,
    executarAutomacaoAgora,
    error,
    setError
  } = useAutomacoes();

  const [nome, setNome] = useState("");
  const [tipoProcesso, setTipoProcesso] = useState<AutomacaoProcesso["tipoProcesso"]>("Sincronização");
  const [regraExecucao, setRegraExecucao] = useState("");
  const [frequencia, setFrequencia] = useState<AutomacaoProcesso["frequencia"]>("A cada hora");
  const [status, setStatus] = useState<AutomacaoProcesso["status"]>("ativo");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [executionLog, setExecutionLog] = useState<{ id: string; msg: string } | null>(null);

  if (user.role !== "admin") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Acesso Restrito</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Apenas administradores do sistema possuem permissão para configurar e gerenciar regras de automação operacional.
          </p>
        </div>
      </div>
    );
  }

  const cleanForm = () => {
    setNome("");
    setTipoProcesso("Sincronização");
    setRegraExecucao("");
    setFrequencia("A cada hora");
    setStatus("ativo");
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let ok = false;
    if (editingId) {
      ok = atualizarAutomacao(editingId, nome, tipoProcesso, regraExecucao, frequencia, status);
      if (ok) {
        setSuccessMsg("Regra de automação atualizada com sucesso!");
        cleanForm();
      }
    } else {
      ok = adicionarAutomacao(nome, tipoProcesso, regraExecucao, frequencia);
      if (ok) {
        setSuccessMsg("Regra de automação cadastrada com sucesso!");
        cleanForm();
      }
    }

    if (ok) {
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleEdit = (item: AutomacaoProcesso) => {
    setEditingId(item.id);
    setNome(item.nome);
    setTipoProcesso(item.tipoProcesso);
    setRegraExecucao(item.regraExecucao);
    setFrequencia(item.frequencia);
    setStatus(item.status);
    setError(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta automação?")) {
      const ok = removerAutomacao(id);
      if (ok) {
        setSuccessMsg("Regra de automação removida com sucesso!");
        setTimeout(() => setSuccessMsg(null), 4000);
        if (editingId === id) {
          cleanForm();
        }
      }
    }
  };

  const handleRunNow = (item: AutomacaoProcesso) => {
    setExecutingId(item.id);
    setExecutionLog(null);

    setTimeout(() => {
      executarAutomacaoAgora(item.id);
      setExecutingId(null);
      setExecutionLog({
        id: item.id,
        msg: `Automação "${item.nome}" disparada com sucesso! Fluxo de rotina processado.`
      });
      setTimeout(() => setExecutionLog(null), 5000);
    }, 1500);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Automações de Processos Operacionais</h3>
            <p className="text-xs text-muted-foreground">Configure e monitore a execução de rotinas em segundo plano</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto flex-1">
          {successMsg && (
            <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {executionLog && (
            <div className="mb-4 p-3 text-xs font-mono text-foreground bg-accent/60 border border-border rounded-lg flex items-start gap-2.5">
              <Terminal className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-[10px] uppercase text-primary">Terminal Log:</span>
                <p className="text-[11px] leading-normal">{executionLog.msg}</p>
              </div>
            </div>
          )}

          {automacoes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhuma regra de automação operacional configurada.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-left">Nome / Regra</th>
                  <th className="p-3 text-center">Tipo</th>
                  <th className="p-3 text-center">Frequência</th>
                  <th className="p-3 text-center">Última Execução</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {automacoes.map((item) => {
                  const isActive = item.status === "ativo";
                  const isCurrentRunning = executingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-3 text-left">
                        <div className="flex flex-col space-y-1 max-w-[200px]">
                          <span className="font-semibold text-foreground leading-snug">{item.nome}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1" title={item.regraExecucao}>
                            {item.regraExecucao}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-accent text-accent-foreground font-mono">
                          {item.tipoProcesso}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{item.frequencia}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground text-center">
                        {item.ultimaExecucao
                          ? new Date(item.ultimaExecucao).toLocaleString("pt-BR")
                          : "Nunca executada"}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                            isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {isActive ? "ativo" : "inativo"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRunNow(item)}
                            disabled={!!executingId || !isActive}
                            className="p-1.5 border border-border rounded-lg bg-background hover:bg-accent disabled:opacity-40 cursor-pointer transition-colors"
                            title="Executar Agora"
                          >
                            {isCurrentRunning ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600/10" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={!!executingId}
                            className="p-1.5 border border-border rounded-lg bg-background hover:bg-accent disabled:opacity-40 cursor-pointer transition-colors"
                            title="Editar Regra"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-foreground/80" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={!!executingId}
                            className="p-1.5 border border-destructive/20 rounded-lg bg-background hover:bg-destructive/10 disabled:opacity-40 cursor-pointer transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {editingId ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{editingId ? "Editar Regra" : "Nova Automação"}</h3>
            <p className="text-xs text-muted-foreground">{editingId ? "Atualize as regras da rotina" : "Crie uma nova rotina automática"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/5 border border-destructive/10 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Nome da Automação
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Sync de Lotes"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tipo do Processo
              </label>
              <select
                value={tipoProcesso}
                onChange={(e) => setTipoProcesso(e.target.value as AutomacaoProcesso["tipoProcesso"])}
                className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                <option value="Sincronização">Sincronização</option>
                <option value="Faturamento">Faturamento</option>
                <option value="Notificação">Notificação</option>
                <option value="Backup">Backup</option>
                <option value="Limpeza">Limpeza</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AutomacaoProcesso["status"])}
                className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Frequência de Execução
            </label>
            <select
              value={frequencia}
              onChange={(e) => setFrequencia(e.target.value as AutomacaoProcesso["frequencia"])}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
            >
              <option value="Minuto a minuto">Minuto a minuto</option>
              <option value="A cada hora">A cada hora</option>
              <option value="Diário">Diário</option>
              <option value="Semanal">Semanal</option>
              <option value="Mensal">Mensal</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Lógica / Regra de Execução
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descreva a regra de execução da tarefa operacional..."
              value={regraExecucao}
              onChange={(e) => setRegraExecucao(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground resize-none leading-normal"
            />
          </div>

          <div className="flex gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={cleanForm}
                className="flex-1 h-9 border border-border hover:bg-accent text-foreground rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="flex-1 h-9 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-primary/20 transition-colors"
            >
              {editingId ? "Salvar Alterações" : "Salvar Automação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
