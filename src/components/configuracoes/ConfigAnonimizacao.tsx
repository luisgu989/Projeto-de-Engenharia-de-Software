"use client";

import React, { useState } from "react";
import { useAnonimizacao, RegistroSensivel } from "@/hooks/useAnonimizacao";
import { ShieldAlert, Trash2, Calendar, User, History, CheckCircle, Info, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigAnonimizacao() {
  const { registros, historicoOperacoes, anonimizarRegistro } = useAnonimizacao();
  const [showToast, setShowToast] = useState(false);

  const handleAnonimizar = (id: string, tipoDado: string) => {
    if (
      confirm(
        `AVISO CRÍTICO DE PRIVACIDADE:\nEsta ação anonimizará irreversivelmente o dado do tipo [${tipoDado}] com ID [${id}].\n\nEsta operação NÃO PODE ser desfeita. Deseja prosseguir com a anonimização?`
      )
    ) {
      anonimizarRegistro(id);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

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
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
          <span className="text-sm font-semibold">Registro anonimizado com sucesso! Integridade preservada.</span>
        </div>
      )}

      {/* Main card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Registros e Mapeamento de Dados Sensíveis</h3>
            <p className="text-xs text-muted-foreground">
              Camadas de dados contendo informações pessoais identificáveis sujeitas à anonimização pela LGPD
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">ID do Registro</th>
                <th className="p-4 text-center">Tipo de Dado</th>
                <th className="p-4 text-center">Valor Original (Mapeado)</th>
                <th className="p-4 text-center">Valor Processado (Banco)</th>
                <th className="p-4 text-center">Situação</th>
                <th className="p-4 text-center">Algoritmo / Método</th>
                <th className="p-4 text-center">Data do Processamento</th>
                <th className="p-4 text-center">Ref. Integridade</th>
                <th className="p-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {registros.map((reg) => {
                const isAnon = reg.status === "Anonimizado";
                return (
                  <tr key={reg.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-foreground text-center">{reg.id}</td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-primary/10 text-primary border border-primary/20">
                        {reg.tipoDado}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-muted-foreground text-right">{reg.valorOriginal}</td>
                    <td className="text-right" className={cn("p-4 font-mono font-bold", isAnon ? "text-emerald-500" : "text-foreground")}>
                      {reg.valorAtual}
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                        isAnon
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground italic font-semibold text-center">{reg.metodoAplicado}</td>
                    <td className="p-4 font-mono text-muted-foreground text-center" suppressHydrationWarning>{formatDate(reg.dataAnonimizacao)}</td>
                    <td className="p-4 text-center">
                      {reg.integridadePreservada ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Preservada
                        </span>
                      ) : (
                        <span className="text-destructive font-semibold">Instável</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {!isAnon ? (
                        <button
                          onClick={() => handleAnonimizar(reg.id, reg.tipoDado)}
                          className="px-2.5 py-1.5 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive font-bold text-[10px] uppercase rounded transition-all cursor-pointer"
                        >
                          Anonimizar
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic font-medium px-2.5">Processado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anonymization Audit Logs */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Histórico de Operações de Anonimização (Auditoria LGPD)</h3>
            <p className="text-xs text-muted-foreground">
              Rastro legal das operações de desidentificação de dados executadas no banco de dados corporativo
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">Carimbo de Hora</th>
                <th className="p-4 text-left">Operador Responsável</th>
                <th className="p-4 text-center">Registro ID</th>
                <th className="p-4 text-left">Categoria de Dado</th>
                <th className="p-4 text-center">Método Utilizado</th>
                <th className="p-4 text-center">Operação Registrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {historicoOperacoes.map((log) => (
                <tr key={log.id} className="hover:bg-accent/10 transition-colors">
                  <td className="p-4 font-mono text-muted-foreground text-center" suppressHydrationWarning>{formatDate(log.timestamp)}</td>
                  <td className="p-4 text-left">
                    <div className="font-semibold text-foreground">{log.usuario}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{log.email}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-foreground text-center">{log.registroId}</td>
                  <td className="p-4 font-semibold text-foreground text-left">{log.tipoDado}</td>
                  <td className="p-4 font-mono font-bold uppercase text-primary text-center">{log.metodo}</td>
                  <td className="p-4 text-muted-foreground font-medium leading-normal text-center">{log.acao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
