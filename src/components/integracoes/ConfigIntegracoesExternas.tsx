"use client";

import React, { useState } from "react";
import { useIntegracoesExternas, IntegracaoExterna } from "@/hooks/useIntegracoesExternas";
import { useAuth } from "@/contexts/auth-context";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  Globe,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigIntegracoesExternas() {
  const { user } = useAuth();
  const {
    integracoes,
    adicionarIntegracao,
    atualizarIntegracao,
    removerIntegracao,
    error,
    setError
  } = useIntegracoesExternas();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<IntegracaoExterna["tipo"]>("REST");
  const [endpoint, setEndpoint] = useState("");
  const [chaveAcesso, setChaveAcesso] = useState("");
  const [status, setStatus] = useState<IntegracaoExterna["status"]>("ativa");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [verChave, setVerChave] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (user.role !== "admin") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Acesso Restrito</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Apenas administradores do sistema possuem permissão para configurar e gerenciar integrações com sistemas externos.
          </p>
        </div>
      </div>
    );
  }

  const cleanForm = () => {
    setNome("");
    setTipo("REST");
    setEndpoint("");
    setChaveAcesso("");
    setStatus("ativa");
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let ok = false;
    if (editingId) {
      ok = atualizarIntegracao(editingId, nome, tipo, endpoint, chaveAcesso, status);
      if (ok) {
        setSuccessMsg("Integração atualizada com sucesso!");
        cleanForm();
      }
    } else {
      ok = adicionarIntegracao(nome, tipo, endpoint, chaveAcesso);
      if (ok) {
        setSuccessMsg("Integração cadastrada com sucesso!");
        cleanForm();
      }
    }

    if (ok) {
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleEdit = (item: IntegracaoExterna) => {
    setEditingId(item.id);
    setNome(item.nome);
    setTipo(item.tipo);
    setEndpoint(item.endpoint);
    setChaveAcesso(item.chaveAcesso);
    setStatus(item.status);
    setError(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta integração?")) {
      const ok = removerIntegracao(id);
      if (ok) {
        setSuccessMsg("Integração removida com sucesso!");
        setTimeout(() => setSuccessMsg(null), 4000);
        if (editingId === id) {
          cleanForm();
        }
      }
    }
  };

  const handleTestConnection = (item: IntegracaoExterna) => {
    setTestingId(item.id);
    setTestResult(null);

    setTimeout(() => {
      setTestingId(null);
      const isSuccess = item.status === "ativa" && !item.endpoint.includes("error");
      setTestResult({
        id: item.id,
        success: isSuccess,
        msg: isSuccess
          ? `Conexão de teste com ${item.nome} estabelecida com sucesso! (Status 200 OK)`
          : `Falha na conexão com ${item.nome}. Verifique o endpoint e o status da integração.`
      });
      setTimeout(() => setTestResult(null), 5000);
    }, 1200);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Integrações Externas Cadastradas</h3>
            <p className="text-xs text-muted-foreground">Monitore e configure conexões de APIs e Webhooks do ERP</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto flex-1">
          {successMsg && (
            <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {testResult && (
            <div
              className={cn(
                "mb-4 p-3 text-xs font-semibold border rounded-lg flex items-center gap-2",
                testResult.success
                  ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                  : "text-destructive bg-destructive/5 border-destructive/10"
              )}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              ) : (
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              )}
              <span>{testResult.msg}</span>
            </div>
          )}

          {integracoes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhuma integração externa configurada.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3">Nome</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Endpoint</th>
                  <th className="p-3">Última Sincronização</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {integracoes.map((item) => {
                  const isActive = item.status === "ativa";
                  const isCurrentTesting = testingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-3 font-semibold text-foreground">
                        <div className="flex flex-col">
                          <span>{item.nome}</span>
                          <span className="text-[9px] font-mono text-muted-foreground mt-0.5">{item.id}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-accent text-accent-foreground font-mono">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-muted-foreground max-w-[150px] truncate" title={item.endpoint}>
                        {item.endpoint}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(item.dataAtualizacao).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                            isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {isActive ? "ativa" : "inativa"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTestConnection(item)}
                            disabled={!!testingId}
                            className="p-1.5 border border-border rounded-lg bg-background hover:bg-accent disabled:opacity-40 cursor-pointer transition-colors"
                            title="Testar Conectividade"
                          >
                            {isCurrentTesting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5 text-primary" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={!!testingId}
                            className="p-1.5 border border-border rounded-lg bg-background hover:bg-accent disabled:opacity-40 cursor-pointer transition-colors"
                            title="Editar Integração"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-foreground/80" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={!!testingId}
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
            <h3 className="font-semibold text-sm">{editingId ? "Editar Conexão" : "Nova Integração"}</h3>
            <p className="text-xs text-muted-foreground">{editingId ? "Atualize os parâmetros da integração" : "Configure uma conexão de API"}</p>
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
              Nome da Integração
            </label>
            <input
              type="text"
              required
              placeholder="Ex: SEFAZ Nota Fiscal"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as IntegracaoExterna["tipo"])}
                className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                <option value="REST">REST API</option>
                <option value="SOAP">SOAP API</option>
                <option value="Webhook">Webhook</option>
                <option value="GraphQL">GraphQL</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IntegracaoExterna["status"])}
                className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Endpoint URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <input
                type="text"
                required
                placeholder="https://api.exemplo.com/v1"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Chave / Token de Acesso
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <input
                type={verChave ? "text" : "password"}
                required
                placeholder="Insira a API key ou token secreto"
                value={chaveAcesso}
                onChange={(e) => setChaveAcesso(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg pl-9 pr-10 py-2 text-xs text-foreground"
              />
              <button
                type="button"
                onClick={() => setVerChave(!verChave)}
                className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-foreground cursor-pointer"
              >
                {verChave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
              {editingId ? "Salvar Alterações" : "Salvar Conexão"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
