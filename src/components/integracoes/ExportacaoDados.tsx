"use client";

import React, { useState } from "react";
import { useExportacaoDados, Exportacao } from "@/hooks/useExportacaoDados";
import { useAuth } from "@/contexts/auth-context";
import {
  Download,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Trash2,
  Edit2,
  Plus,
  Calendar,
  FolderOpen,
  Terminal,
  Play,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ExportacaoDados() {
  const { user } = useAuth();
  const {
    exportacoes,
    historicoExportacoes,
    error,
    setError,
    agendarExportacao,
    editarExportacao,
    executarExportacao,
    removerExportacao,
    verificarPermissaoExportacao
  } = useExportacaoDados();

  const [codigoRotina, setCodigoRotina] = useState("");
  const [rotinaProgramada, setRotinaProgramada] = useState("");
  const [tipoArquivo, setTipoArquivo] = useState<Exportacao["tipoArquivo"]>("xlsx");
  const [diretorioDestino, setDiretorioDestino] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const hasPermission = verificarPermissaoExportacao();

  if (!hasPermission) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Acesso Restrito</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Apenas administradores, gerentes ou analistas de faturamento possuem permissão para configurar agendamento de exportações periódicas.
          </p>
        </div>
      </div>
    );
  }

  const cleanForm = () => {
    setCodigoRotina("");
    setRotinaProgramada("");
    setTipoArquivo("xlsx");
    setDiretorioDestino("");
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    let ok = false;
    if (editingId) {
      ok = editarExportacao(editingId, {
        rotinaProgramada,
        tipoArquivo,
        diretorioDestino
      });
      if (ok) {
        setSuccessMsg("Rotina de exportação atualizada com sucesso!");
        cleanForm();
      }
    } else {
      ok = agendarExportacao(
        codigoRotina,
        rotinaProgramada,
        tipoArquivo,
        diretorioDestino
      );
      if (ok) {
        setSuccessMsg("Exportação programada agendada com sucesso!");
        cleanForm();
      }
    }

    if (ok) {
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleEdit = (item: Exportacao) => {
    setEditingId(item.id);
    setCodigoRotina(item.codigoRotina);
    setRotinaProgramada(item.rotinaProgramada);
    setTipoArquivo(item.tipoArquivo);
    setDiretorioDestino(item.diretorioDestino);
    setError(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este agendamento?")) {
      const ok = removerExportacao(id);
      if (ok) {
        setSuccessMsg("Agendamento de exportação removido com sucesso!");
        setTimeout(() => setSuccessMsg(null), 4000);
        if (editingId === id) {
          cleanForm();
        }
      }
    }
  };

  const handleExecute = (item: Exportacao) => {
    setExecutingId(item.id);
    setError(null);
    
    setTimeout(() => {
      const ok = executarExportacao(item.id);
      setExecutingId(null);
      if (ok) {
        setSuccessMsg(`Extração física simulada e arquivos gerados em "${item.diretorioDestino}"!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    }, 1500);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Listagem de Rotinas de Exportação */}
      <div className="md:col-span-2 space-y-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/10">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Rotinas de Exportação Ativas</h3>
              <p className="text-xs text-muted-foreground">Configurações e extrações periódicas programadas</p>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            {successMsg && (
              <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {exportacoes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Nenhuma rotina de exportação programada no momento.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                    <th className="p-3 text-left">Código / Nome</th>
                    <th className="p-3 text-center">Formato</th>
                    <th className="p-3 text-center">Diretório de Destino</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {exportacoes.map((item) => {
                    const isConcluida = item.status === "concluida";
                    const isRunning = executingId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                        <td className="p-3 text-left">
                          <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-foreground leading-snug">{item.rotinaProgramada}</span>
                            <span className="text-[9px] font-mono text-muted-foreground">
                              CÓD: {item.codigoRotina} | ID: {item.id}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-accent text-accent-foreground font-mono">
                            {item.tipoArquivo}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground font-mono text-[10px] text-center">
                          {item.diretorioDestino}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                              item.status === "agendada"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : item.status === "concluida"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border border-destructive/20"
                            )}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleExecute(item)}
                              disabled={!!executingId || isConcluida}
                              className="p-1.5 border border-border rounded-lg bg-background hover:bg-accent disabled:opacity-40 cursor-pointer transition-colors"
                              title="Simular Extração"
                            >
                              {isRunning ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Play className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600/10" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              disabled={!!executingId || isConcluida}
                              className="p-1.5 border border-border rounded-lg bg-background hover:bg-accent disabled:opacity-40 cursor-pointer transition-colors"
                              title="Editar Agendamento"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-foreground/80" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={!!executingId || isConcluida}
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

        {/* Histórico Imutável de Exportações */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Histórico de Extrações Geradas</h3>
              <p className="text-xs text-muted-foreground">Log de auditoria imutável de relatórios gerados</p>
            </div>
          </div>
          
          <div className="p-6 overflow-x-auto">
            {historicoExportacoes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs">
                Nenhum relatório exportado no histórico.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-accent/20 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                    <th className="p-3 text-center">Código</th>
                    <th className="p-3 text-center">Rotina</th>
                    <th className="p-3 text-center">Destino</th>
                    <th className="p-3 text-center">Executado Em</th>
                    <th className="p-3 text-left">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {historicoExportacoes.map((item) => (
                    <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary text-center">
                        {item.codigoRotina}
                      </td>
                      <td className="p-3 text-foreground font-medium text-center">
                        {item.rotinaProgramada} ({item.tipoArquivo.toUpperCase()})
                      </td>
                      <td className="p-3 font-mono text-muted-foreground text-[10px] text-center">
                        {item.diretorioDestino}
                      </td>
                      <td className="p-3 text-muted-foreground text-center">
                        {new Date(item.dataExecucao).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3 text-foreground/85 text-left">
                        {item.responsavel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Painel lateral: Cadastrar/Editar */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {editingId ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{editingId ? "Editar Exportação" : "Agendar Exportação"}</h3>
            <p className="text-xs text-muted-foreground">{editingId ? "Altere os parâmetros do agendamento" : "Crie uma nova exportação programada"}</p>
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
              Código da Rotina
            </label>
            <input
              type="text"
              required
              disabled={!!editingId}
              placeholder="Ex: EXP-CONSOLIDADO-VENDAS"
              value={codigoRotina}
              onChange={(e) => setCodigoRotina(e.target.value)}
              className={cn(
                "w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground",
                editingId && "opacity-50 cursor-not-allowed bg-accent/40"
              )}
            />
            {!editingId && (
              <span className="text-[9px] text-muted-foreground">
                O código da rotina é <b>imutável</b> após a criação.
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Nome da Rotina / Relatório
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Balancete Consolidado Trimestral"
              value={rotinaProgramada}
              onChange={(e) => setRotinaProgramada(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tipo do Arquivo
            </label>
            <select
              value={tipoArquivo}
              onChange={(e) => setTipoArquivo(e.target.value as Exportacao["tipoArquivo"])}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
            >
              <option value="xlsx">Planilha Excel (.xlsx)</option>
              <option value="csv">Texto Separado por Vírgulas (.csv)</option>
              <option value="pdf">Documento PDF (.pdf)</option>
              <option value="json">Objeto JSON (.json)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Diretório de Destino
            </label>
            <input
              type="text"
              required
              placeholder="Ex: C:/ERPPro/Exportacoes/Vendas"
              value={diretorioDestino}
              onChange={(e) => setDiretorioDestino(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground"
            />
            <span className="text-[10px] text-muted-foreground">
              Deve conter um caminho absoluto válido.
            </span>
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
              {editingId ? "Salvar Alterações" : "Salvar Agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
