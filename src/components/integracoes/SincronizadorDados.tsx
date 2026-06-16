"use client";

import React, { useState } from "react";
import { useSincronizacao } from "@/hooks/useSincronizacao";
import { useAuth } from "@/contexts/auth-context";
import { Globe, RefreshCw, AlertCircle, History, Database, CheckCircle, ArrowRight, User, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SincronizadorDados() {
  const { user } = useAuth();
  const { sincronizacoes, rodarSincronizacao } = useSincronizacao();

  const origens = ["Shopify API Checkout", "API Mercado Pago", "Salesforce CRM Integration", "Gateway Fiscal WebService"];
  const destinos = ["Módulo de Estoque & Lotes", "Financeiro (Fluxo de Caixa)", "Clientes & Relacionamento", "Vendas & Faturamento"];
  const eventos = ["Importação de Pedido", "Webhook de Recebimento", "Atualização de Saldo", "Remessa Contábil"];

  const [origem, setOrigem] = useState(origens[0]);
  const [destino, setDestino] = useState(destinos[0]);
  const [evento, setEvento] = useState(eventos[0]);
  const [simularConflito, setSimularConflito] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSincronizar = (e: React.FormEvent) => {
    e.preventDefault();
    rodarSincronizacao(origem, destino, evento, simularConflito);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
    <div className="space-y-6">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="h-5 w-5 text-white shrink-0" />
          <span className="text-sm font-semibold">Sincronização em tempo real concluída e registrada!</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sync Trigger Card (Editable fields) */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden lg:col-span-1 flex flex-col justify-between">
          <form onSubmit={handleSincronizar} className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Disparar Sincronização</h3>
                  <p className="text-xs text-muted-foreground">Configuração de novos canais operacionais</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Linked User (read-only) */}
                <div className="bg-accent/10 border border-border/80 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                    <User className="h-4 w-4" /> Usuário Responsável:
                  </div>
                  <span className="font-bold text-foreground font-mono">{user.name}</span>
                </div>

                {/* Origem (Editable) */}
                <div className="space-y-1.5">
                  <label htmlFor="sync-origem" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Origem dos Dados (Editável)
                  </label>
                  <select
                    id="sync-origem"
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded px-3 py-2 text-xs font-semibold transition-all text-foreground text-left"
                  >
                    {origens.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destino (Editable) */}
                <div className="space-y-1.5">
                  <label htmlFor="sync-destino" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Destino da Sincronização (Editável)
                  </label>
                  <select
                    id="sync-destino"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded px-3 py-2 text-xs font-semibold transition-all text-foreground text-left"
                  >
                    {destinos.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Evento (Editable) */}
                <div className="space-y-1.5">
                  <label htmlFor="sync-evento" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Tipo de Evento (Editável)
                  </label>
                  <select
                    id="sync-evento"
                    value={evento}
                    onChange={(e) => setEvento(e.target.value)}
                    className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded px-3 py-2 text-xs font-semibold transition-all text-foreground text-left"
                  >
                    {eventos.map((ev) => (
                      <option key={ev} value={ev}>
                        {ev}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="h-px bg-border my-2" />

                {/* Simulation Option: Conflict Trigger */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border/80 bg-accent/5">
                  <label htmlFor="sync-conflito" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                    Simular conflito de concorrência
                  </label>
                  <input
                    id="sync-conflito"
                    type="checkbox"
                    checked={simularConflito}
                    onChange={(e) => setSimularConflito(e.target.checked)}
                    className="h-4 w-4 rounded border-muted text-primary focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Button type="submit" className="w-full text-xs font-semibold cursor-pointer h-10">
                Sincronizar em Tempo Real
              </Button>
            </div>
          </form>
        </div>

        {/* Sync Events Logs (Read-only) */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Histórico de Sincronizações Executadas</h3>
                <p className="text-xs text-muted-foreground">Log imutável de transações entre módulos locais e APIs externas</p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">ID da Sincronização</th>
                  <th className="p-4">Relação Origem → Destino</th>
                  <th className="p-4 text-center">Situação</th>
                  <th className="p-4 text-center">Versão</th>
                  <th className="p-4">Horário Execução</th>
                  <th className="p-4">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {sincronizacoes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhum evento de sincronização registrado na base local.
                    </td>
                  </tr>
                ) : (
                  sincronizacoes.map((sync) => {
                    const isConflict = sync.status === "Conflito Detectado";
                    return (
                      <tr key={sync.id} className="hover:bg-accent/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-foreground">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 font-bold">
                              <Globe className="h-3 w-3 text-primary" /> {sync.id}
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground uppercase">{sync.tipoEvento}</span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-foreground">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-mono">{sync.origem}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-mono">{sync.destino}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                            isConflict
                              ? "bg-destructive/10 text-destructive border-destructive/20 animate-shake"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          )}>
                            {sync.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            v{sync.versaoRegistro}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-muted-foreground">{formatDate(sync.horarioExecucao)}</td>
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{sync.usuarioResponsavel}</div>
                          <div className="text-[9px] text-muted-foreground font-mono">{sync.emailResponsavel}</div>
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

      {/* Operation logs details (Immutable) */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Log Transacional da Operação (Integridade Transacional)</h3>
            <p className="text-xs text-muted-foreground">Auditoria detalhada com erros, conflitos detectados e confirmações em banco de dados</p>
          </div>
        </div>

        <div className="p-4 max-h-[300px] overflow-y-auto space-y-2">
          {sincronizacoes.map((sync) => (
            <div
              key={sync.id}
              className={cn(
                "p-3 rounded-xl border text-xs font-mono space-y-1.5 transition-all",
                sync.status === "Conflito Detectado"
                  ? "border-destructive/20 bg-destructive/[0.01]"
                  : "border-border bg-card"
              )}
            >
              <div className="flex justify-between items-center text-[10px] text-muted-foreground border-b border-border/50 pb-1">
                <span>[SYNC ID: {sync.id}] [VERSÃO: v{sync.versaoRegistro}]</span>
                <span>{formatDate(sync.horarioExecucao)}</span>
              </div>
              <p className={cn(
                "font-semibold leading-relaxed",
                sync.status === "Conflito Detectado" ? "text-destructive" : "text-foreground"
              )}>
                {sync.logOperacao}
              </p>
              <div className="text-[10px] text-muted-foreground pt-1 flex justify-between items-center">
                <span>Responsável: {sync.usuarioResponsavel} ({sync.emailResponsavel})</span>
                <span className="uppercase text-[9px] tracking-wider font-bold">Origem: {sync.origem}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
