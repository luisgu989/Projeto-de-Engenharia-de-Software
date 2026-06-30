"use client";

import React, { useState } from "react";
import { useLGPD, ConsentimentoLGPD } from "@/hooks/useLGPD";
import { useAuth } from "@/contexts/auth-context";
import { Shield, Eye, Calendar, User, History, CheckCircle, XCircle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigLGPD() {
  const { user } = useAuth();
  const { consentimentos, historicoAlteracoes, alterarStatusConsentimento } = useLGPD();
  const [showToast, setShowToast] = useState(false);

  const handleToggleConsent = (id: string, currentStatus: "Concedido" | "Revogado") => {
    const novoStatus = currentStatus === "Concedido" ? "Revogado" : "Concedido";
    alterarStatusConsentimento(id, novoStatus);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
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
      {/* Toast alert */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
          <span className="text-sm font-semibold">Consentimento atualizado e registrado na base legal com sucesso!</span>
        </div>
      )}

      {/* Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10 flex-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary animate-pulse" /> Gestão de Consentimento & LGPD
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Painel de conformidade regulatória. Controle quais dados pessoais e categorias de uso estão autorizados. Todos os consentimentos geram chaves imutáveis no banco de dados e auditoria legal.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-widest text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shrink-0">
          LGPD Compliance Act
        </div>
      </div>

      {/* Linked User Read-only Card */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Titular dos Dados Vinculado</p>
            <h4 className="text-sm font-bold text-foreground">{user.name}</h4>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            {user.email}
          </span>
        </div>
      </div>

      {/* Consent List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Categorias de Consentimento Validadas</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {consentimentos.map((cons) => {
            const concedido = cons.status === "Concedido";
            return (
              <div
                key={cons.id}
                className={cn(
                  "p-5 rounded-2xl border bg-card shadow-sm flex flex-col justify-between space-y-4 transition-all duration-300",
                  concedido ? "border-emerald-500/20 bg-emerald-500/[0.01]" : "border-border bg-card"
                )}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-muted text-muted-foreground rounded border border-border/80">
                      ID: {cons.id}
                    </span>
                    <h4 className="font-bold text-sm text-foreground pt-1">{cons.tipoConsentimento}</h4>
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold uppercase px-2 py-0.5 rounded border",
                    concedido ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                  )}>
                    {cons.status}
                  </span>
                </div>

                {/* Timestamps */}
                <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  <div className="space-y-0.5">
                    <span className="font-semibold block uppercase tracking-wider text-[8px]">Data da Concessão</span>
                    <span className="font-mono text-foreground" suppressHydrationWarning>{formatDate(cons.dataConcessao)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold block uppercase tracking-wider text-[8px]">Data da Revogação</span>
                    <span className="font-mono text-foreground" suppressHydrationWarning>{formatDate(cons.dataRevogacao)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1 leading-none font-medium">
                    <Info className="h-3.5 w-3.5" />
                    Consentimento de titular imutável
                  </span>

                  <button
                    onClick={() => handleToggleConsent(cons.id, cons.status)}
                    className={cn(
                      "px-3 py-1.5 font-bold text-[10px] uppercase rounded-lg border transition-all cursor-pointer shadow-sm",
                      concedido
                        ? "bg-destructive/10 border-destructive/20 hover:bg-destructive/20 text-destructive"
                        : "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500"
                    )}
                  >
                    {concedido ? "Revogar Autorização" : "Conceder Autorização"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alteration History table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Histórico de Alterações de Consentimento (Auditoria Legal)</h3>
            <p className="text-xs text-muted-foreground">Rastreabilidade completa de aceites e cancelamentos para fins de conformidade legal</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">Carimbo de Hora</th>
                <th className="p-4 text-center">Titular dos Dados</th>
                <th className="p-4 text-center">Consent ID</th>
                <th className="p-4 text-left">Categoria / Finalidade</th>
                <th className="p-4 text-center">Transição de Estado</th>
                <th className="p-4 text-center">Operação de Conformidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {historicoAlteracoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum histórico de alterações registrado.
                  </td>
                </tr>
              ) : (
                historicoAlteracoes.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-4 font-mono text-muted-foreground text-center" suppressHydrationWarning>{formatDate(log.timestamp)}</td>
                    <td className="p-4 text-center">
                      <div className="font-semibold text-foreground">{log.usuario}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{log.email}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-foreground text-center">{log.consentimentoId}</td>
                    <td className="p-4 text-muted-foreground text-left">{log.tipoConsentimento}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="bg-muted px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-muted-foreground border border-border">
                          {log.statusAnterior}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border",
                          log.statusNovo === "Concedido"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        )}>
                          {log.statusNovo}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-primary text-center">{log.acao}</td>
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
