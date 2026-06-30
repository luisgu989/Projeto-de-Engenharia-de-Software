"use client";

import React, { useState } from "react";
import { useHistoricoAlteracoesFinanceiras } from "@/hooks/useHistoricoAlteracoesFinanceiras";
import { useAuth } from "@/contexts/auth-context";
import {
  ShieldAlert,
  Search,
  Terminal,
  Activity,
  Lock,
  Globe,
  Database,
  UserCheck,
  TrendingDown,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HistoricoAlteracoesFinanceiras() {
  const { user } = useAuth();
  const { logs, verificarAcessoAuditoria } = useHistoricoAlteracoesFinanceiras();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");

  const hasAccess = verificarAcessoAuditoria();

  if (!hasAccess) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Acesso Negado</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Área de segurança restrita. Apenas administradores e profissionais credenciados de contabilidade possuem permissão para auditar históricos de alterações financeiras.
          </p>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.registroFinanceiro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.codigoAuditoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.usuarioResponsavel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = selectedTipo === "todos" || log.tipoAlteracao === selectedTipo;

    return matchesSearch && matchesTipo;
  });

  return (
    <div className="space-y-6">
      {/* Rastro de Auditoria Financeira */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border bg-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Histórico de Alterações Contábeis</h3>
              <p className="text-xs text-muted-foreground">Monitoramento auditável de modificações de valores e status de lançamentos no ERP</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Lançamento, ID, Usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground w-48 transition-all"
              />
            </div>

            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="bg-accent/20 hover:bg-accent/40 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground cursor-pointer focus:outline-none"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="Edição de Valor">Edição de Valor</option>
              <option value="Alteração de Status">Alteração de Status</option>
              <option value="Mudança de Categoria">Mudança de Categoria</option>
            </select>
          </div>
        </div>

        {/* Tabela de logs - Strictly Read-Only */}
        <div className="overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhum log de auditoria financeira encontrado para as buscas realizadas.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/30 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">Data / Hora</th>
                  <th className="p-3 text-center">Código Auditoria</th>
                  <th className="p-3 text-center">Lançamento Ref.</th>
                  <th className="p-3 text-center">Executor</th>
                  <th className="p-3 text-center">Tipo de Alteração</th>
                  <th className="p-3 text-center">Valor Anterior (Imutável)</th>
                  <th className="p-3 text-center">Valor Novo</th>
                  <th className="p-3 text-center">ID Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px] text-muted-foreground">
                {filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-accent/5 transition-colors">
                      <td className="p-3 text-muted-foreground whitespace-nowrap text-center">
                        {new Date(log.dataAlteracao).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3 font-semibold text-primary/80 text-center">
                        {log.codigoAuditoria}
                      </td>
                      <td className="p-3 font-bold text-foreground font-sans text-center">
                        {log.registroFinanceiro}
                      </td>
                      <td className="p-3 text-foreground/80 font-sans flex items-center gap-1.5 mt-1 border-none text-center">
                        <UserCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{log.usuarioResponsavel}</span>
                      </td>
                      <td className="p-3 font-sans whitespace-nowrap text-center">
                        <span className="px-1.5 py-0.5 rounded border bg-accent text-[9px] font-bold">
                          {log.tipoAlteracao}
                        </span>
                      </td>
                      <td className="p-3 text-destructive font-bold text-right">
                        {log.valorAnterior}
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold text-right">
                        {log.valorAtualizado}
                      </td>
                      <td className="p-3 text-foreground/50 text-[10px] text-center">
                        {log.id}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
