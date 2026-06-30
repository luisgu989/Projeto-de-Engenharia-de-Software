"use client";

import React, { useState } from "react";
import { useLogs, SystemLog } from "@/contexts/logs-context";
import { Search, Calendar, ShieldAlert, Trash2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigLogs() {
  const { logs, clearLogs, addLog } = useLogs();
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");

  const categoriesMap: Record<SystemLog["categoria"], { title: string; color: string }> = {
    seguranca: { title: "Segurança", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    estoque: { title: "Estoque", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    funcionarios: { title: "Funcionários", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
    relatorios: { title: "Relatórios", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    vendas: { title: "Vendas", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20" },
    financeiro: { title: "Financeiro", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
  };

  const filteredLogs = logs.filter((log) => {
    // 1. Text Search
    const text = busca.toLowerCase();
    if (
      text &&
      !log.acao.toLowerCase().includes(text) &&
      !log.usuario.toLowerCase().includes(text) &&
      !log.email.toLowerCase().includes(text)
    ) {
      return false;
    }

    // 2. Category Filter
    if (categoriaFiltro !== "todas" && log.categoria !== categoriaFiltro) {
      return false;
    }

    return true;
  });

  const handleClearLogs = () => {
    if (confirm("Aviso: Esta ação apagará permanentemente todos os registros de logs locais. Deseja prosseguir?")) {
      clearLogs();
      // Write one initial log to indicate the clear action
      setTimeout(() => {
        addLog("Histórico de logs de auditoria limpo pelo administrador", "seguranca");
      }, 200);
    }
  };

  const formatDate = (dateStr: string) => {
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
    <div className="space-y-4">
      {/* Filtering Toolbar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por ação, e-mail ou operador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background rounded-md pl-9 pr-4 py-2 text-xs border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[150px]">
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all"
            >
              <option value="todas">Todas Categorias</option>
              {Object.entries(categoriesMap).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Logs Button */}
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-1.5 px-3 py-2 border border-destructive/20 hover:bg-destructive/10 hover:border-destructive text-destructive font-semibold text-xs rounded-lg transition-all cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Auditoria
          </button>
        )}
      </div>

      {/* Logs Listing Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">Carimbo de Data/Hora</th>
                <th className="p-4 text-center">Módulo</th>
                <th className="p-4 text-center">Operação Realizada</th>
                <th className="p-4 text-center">Operador do Sistema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Nenhum registro de auditoria disponível no histórico.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const catMeta = categoriesMap[log.categoria] || { title: log.categoria, color: "bg-accent text-muted-foreground" };
                  return (
                    <tr key={log.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-4 text-xs font-mono text-muted-foreground text-center">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                          {formatDate(log.timestamp)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          catMeta.color
                        )}>
                          {catMeta.title}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-foreground leading-normal text-center">
                        {log.acao}
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-semibold text-xs text-foreground/95">{log.usuario}</div>
                        <div className="text-[10px] text-muted-foreground font-mono leading-none">{log.email}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
