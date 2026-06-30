"use client";

import React, { useState } from "react";
import { useSessoes, SessaoUsuario } from "@/hooks/useSessoes";
import { Network, Search, Trash2, Calendar, ShieldAlert, XCircle, LogIn, LogOut, CheckCircle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigSessoes() {
  const { sessoes, historicoAcessos, encerrarSessao } = useSessoes();
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todas");

  // Filtros aplicados às sessões
  const filteredSessoes = sessoes.filter((s) => {
    const text = busca.toLowerCase();
    if (
      text &&
      !s.usuario.toLowerCase().includes(text) &&
      !s.email.toLowerCase().includes(text) &&
      !s.dispositivo.toLowerCase().includes(text) &&
      !s.id.toLowerCase().includes(text)
    ) {
      return false;
    }

    if (statusFiltro !== "todas" && s.status.toLowerCase() !== statusFiltro) {
      return false;
    }

    return true;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10 flex-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" /> Controle de Sessões e Conexões
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Painel de segurança TI. Monitore conexões ativas no ambiente corporativo e encerre sessões suspeitas instantaneamente. Todos os dados são protegidos contra edição manual.
          </p>
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <LogIn className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Conexões Ativas no Sistema</h3>
              <p className="text-xs text-muted-foreground">Monitoramento em tempo real de computadores e celulares autenticados</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por usuário, email, ID ou dispositivo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background rounded-md pl-9 pr-4 py-2 text-xs border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all"
            >
              <option value="todas">Todas Situações</option>
              <option value="ativa">Ativas</option>
              <option value="encerrada">Encerradas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">ID da Sessão (ERP)</th>
                <th className="p-4 text-left">Usuário Vinculado</th>
                <th className="p-4 text-center">Origem / Dispositivo</th>
                <th className="p-4 text-center">Início da Conexão</th>
                <th className="p-4 text-center">Fim da Conexão</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredSessoes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground font-semibold">
                    Nenhuma sessão ativa encontrada com as especificações informadas.
                  </td>
                </tr>
              ) : (
                filteredSessoes.map((sessao) => (
                  <tr key={sessao.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-foreground text-center">{sessao.id}</td>
                    <td className="p-4 text-left">
                      <div className="font-semibold text-foreground">{sessao.usuario}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{sessao.email}</div>
                    </td>
                    <td className="p-4 text-muted-foreground text-center">{sessao.dispositivo}</td>
                    <td className="p-4 font-mono text-muted-foreground text-center" suppressHydrationWarning>{formatDate(sessao.dataConexao)}</td>
                    <td className="p-4 font-mono text-muted-foreground text-center" suppressHydrationWarning>{formatDate(sessao.dataEncerramento)}</td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                        sessao.status === "Ativa"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      )}>
                        {sessao.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {sessao.status === "Ativa" ? (
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja derrubar a sessão ${sessao.id} do usuário ${sessao.usuario}?`)) {
                              encerrarSessao(sessao.id);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive font-bold text-[10px] uppercase rounded transition-all cursor-pointer"
                        >
                          Derrubar
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic font-medium px-2.5">Finalizada</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Log Audit Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Histórico Geral de Acessos & Auditoria MFA</h3>
            <p className="text-xs text-muted-foreground">Log persistido de tentativas de login, validações multifator e desconexões forçadas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">timestamp</th>
                <th className="p-4 text-left">Usuário</th>
                <th className="p-4 text-center">Evento de Acesso</th>
                <th className="p-4 text-center">Dispositivo</th>
                <th className="p-4 text-center">Método MFA</th>
                <th className="p-4 text-center">Validação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {historicoAcessos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum registro de tentativas de acesso encontrado.
                  </td>
                </tr>
              ) : (
                historicoAcessos.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-4 font-mono text-muted-foreground text-center" suppressHydrationWarning>{formatDate(log.timestamp)}</td>
                    <td className="p-4 text-left">
                      <div className="font-semibold text-foreground">{log.usuario}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{log.email}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "font-semibold text-xs",
                        log.tipo === "MFA_VALIDACAO" ? "text-primary" : log.tipo === "CONEXAO" ? "text-emerald-500" : "text-destructive"
                      )}>
                        {log.tipo === "MFA_VALIDACAO"
                          ? "Validação Segundo Fator"
                          : log.tipo === "CONEXAO"
                          ? "Nova Conexão Iniciada"
                          : "Encerramento Forçado de Sessão"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-center">{log.dispositivo}</td>
                    <td className="p-4 font-mono font-bold uppercase text-foreground text-center">{log.metodo}</td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border",
                        log.status === "Sucesso"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : log.status === "Falha"
                          ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
