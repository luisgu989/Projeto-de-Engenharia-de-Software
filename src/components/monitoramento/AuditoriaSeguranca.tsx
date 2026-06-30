"use client";

import React, { useState } from "react";
import { useAuditoriaSeguranca, MODULOS_AUDITAVEIS } from "@/hooks/useAuditoriaSeguranca";
import { useAuth } from "@/contexts/auth-context";
import {
  ShieldAlert,
  Search,
  Filter,
  Terminal,
  Activity,
  AlertTriangle,
  Lock,
  Globe,
  Database,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AuditoriaSeguranca() {
  const { user } = useAuth();
  const { logs, error, verificarAcessoLeitura } = useAuditoriaSeguranca();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModulo, setSelectedModulo] = useState<string>("todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");

  const hasAccess = verificarAcessoLeitura();

  if (!hasAccess) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Acesso Negado</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Área de segurança restrita. Apenas administradores e profissionais credenciados de TI possuem permissão para auditar logs de segurança.
          </p>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.tipoEvento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.codigoRegistro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.enderecoAcesso.includes(searchTerm) ||
      log.usuarioResponsavel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModulo = selectedModulo === "todos" || log.moduloAfetado === selectedModulo;
    const matchesStatus = selectedStatus === "todos" || log.statusEvento === selectedStatus;

    return matchesSearch && matchesModulo && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Resumo de Status / Métrica Básica */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Status Operacional</span>
            <h4 className="text-sm font-bold text-foreground">Integridade Ativa</h4>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Módulos Auditados</span>
            <h4 className="text-sm font-bold text-foreground">{MODULOS_AUDITAVEIS.length} Sistemas</h4>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Alertas Recentes</span>
            <h4 className="text-sm font-bold text-foreground">
              {logs.filter((l) => l.statusEvento === "Alerta" || l.statusEvento === "Falha").length} Detectados
            </h4>
          </div>
        </div>
      </div>

      {/* Rastro de Auditoria */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border bg-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Histórico de Auditoria de TI</h3>
              <p className="text-xs text-muted-foreground">Monitoramento de eventos, criptografia e permissões</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar IP, ID, Usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground w-48 transition-all"
              />
            </div>

            <select
              value={selectedModulo}
              onChange={(e) => setSelectedModulo(e.target.value)}
              className="bg-accent/20 hover:bg-accent/40 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground cursor-pointer focus:outline-none"
            >
              <option value="todos">Todos os Módulos</option>
              {MODULOS_AUDITAVEIS.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-accent/20 hover:bg-accent/40 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground cursor-pointer focus:outline-none"
            >
              <option value="todos">Todos os Níveis</option>
              <option value="Sucesso">Sucesso</option>
              <option value="Alerta">Alerta</option>
              <option value="Falha">Falha</option>
            </select>
          </div>
        </div>

        {/* Tabela de logs - Strictly Read-Only */}
        <div className="overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhum log de auditoria encontrado sob os filtros estabelecidos.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/30 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">Data / Hora</th>
                  <th className="p-3 text-center">ID Log</th>
                  <th className="p-3 text-center">Evento Técnico</th>
                  <th className="p-3 text-center">Módulo</th>
                  <th className="p-3 text-center">IP Origem</th>
                  <th className="p-3 text-center">Cód. Registro</th>
                  <th className="p-3 text-left">Usuário</th>
                  <th className="p-3 text-center">Nível</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-accent/5 transition-colors">
                      <td className="p-3 text-muted-foreground text-[11px] whitespace-nowrap text-center">
                        {new Date(log.dataOcorrencia).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3 font-semibold text-foreground/70 text-center">
                        {log.id}
                      </td>
                      <td className="p-3 text-foreground font-sans font-medium text-center">
                        {log.tipoEvento}
                      </td>
                      <td className="p-3 whitespace-nowrap text-foreground/90 font-sans text-center">
                        <span className="px-2 py-0.5 rounded border bg-accent text-[10px]">
                          {log.moduloAfetado}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground flex items-center gap-1 text-center">
                        <Globe className="h-3 w-3 text-primary shrink-0" />
                        <span>{log.enderecoAcesso}</span>
                      </td>
                      <td className="p-3 font-semibold text-primary/80 text-center">
                        {log.codigoRegistro}
                      </td>
                      <td className="p-3 text-foreground/80 font-sans flex items-center gap-1.5 text-left">
                        <UserCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{log.usuarioResponsavel}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
                            log.statusEvento === "Sucesso"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : log.statusEvento === "Alerta"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
                          )}
                        >
                          {log.statusEvento}
                        </span>
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
