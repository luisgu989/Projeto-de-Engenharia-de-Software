"use client";

import React, { useState } from "react";
import { useRecuperacaoDesastres } from "@/hooks/useRecuperacaoDesastres";
import { AlertOctagon, ShieldAlert, Play, CheckCircle2, History, Database, Cpu, Network, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfigRecuperacao() {
  const { execucoes, historicoOperacoes, rodarRecuperacao, isExecuting, progressStep } = useRecuperacaoDesastres();

  const cenarios = [
    {
      id: "SCN-01",
      titulo: "Restauração Total de Banco de Dados Central",
      servicos: "Banco de Dados PostgreSQL, Sincronização Contábil",
      backup: "Snapshot de Produção 2026-06-16T04:00 (AWS S3)",
      desc: "Restaura todas as tabelas transacionais a partir do snapshot diário após validação de consistência estrutural.",
    },
    {
      id: "SCN-02",
      titulo: "Failover de Cluster de APIs & Nginx Gateway",
      servicos: "Gateway API Nginx, Serviço de Autenticação MFA, Redis Cache",
      backup: "Configuração do Cluster Kubernetes v16.2 (AWS Cloud)",
      desc: "Transfere o tráfego do gateway de APIs para o ambiente de hot-site de contingência secundário.",
    },
    {
      id: "SCN-03",
      titulo: "Restauração do Módulo de Estoque & Lotes",
      servicos: "Serviço de Inventário de Produtos, Catálogo de Lotes e Inventário",
      backup: "Backup Físico do Catálogo Geral (Disco Local RAID-5)",
      desc: "Restaura os logs físicos de controle de entradas/saídas do estoque da filial central.",
    },
  ];

  const [cenarioSelecionado, setCenarioSelecionado] = useState(cenarios[0]);

  const handleExecutar = () => {
    if (isExecuting) return;
    if (
      confirm(
        `AVISO DE INFRAESTRUTURA:\nVocê está prestes a executar o plano de contingência:\n"${cenarioSelecionado.titulo}".\n\nIsso simulará a reinicialização e validação de backups. Deseja iniciar a execução?`
      )
    ) {
      rodarRecuperacao(cenarioSelecionado.titulo, cenarioSelecionado.backup, cenarioSelecionado.servicos);
    }
  };

  const getStepText = (step: number) => {
    switch (step) {
      case 1:
        return "Inicializando roteiro operacional...";
      case 2:
        return "Validando integridade física e consistência do Backup...";
      case 3:
        return "Restaurando servidores e serviços afetados no banco...";
      case 4:
        return "Finalizando restauração e validando conexões...";
      default:
        return "Aguardando início...";
    }
  };

  const getProgressPercent = (step: number) => {
    switch (step) {
      case 1:
        return 15;
      case 2:
        return 50;
      case 3:
        return 80;
      case 4:
        return 100;
      default:
        return 0;
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
    <div className="space-y-6">
      {/* Simulation Overlay Box when executing */}
      {isExecuting && (
        <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 shadow-md space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <div>
                <h4 className="font-bold text-sm text-foreground">Restauração de Desastre em Execução</h4>
                <p className="text-xs text-muted-foreground font-semibold">
                  Executando cenário: <span className="text-foreground">{cenarioSelecionado.titulo}</span>
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              Etapa {progressStep}/4
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-2.5 w-full bg-accent/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercent(progressStep)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
              <span>{getStepText(progressStep)}</span>
              <span className="font-mono">{getProgressPercent(progressStep)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scenario Selection Cards */}
        <div className="space-y-4 lg:col-span-1 flex flex-col justify-between">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Play className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Cenários de Recuperação</h3>
                <p className="text-xs text-muted-foreground">Selecione o plano de contingência</p>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
              {cenarios.map((scenario) => {
                const isSelected = cenarioSelecionado.id === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => setCenarioSelecionado(scenario)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border text-xs flex flex-col gap-1 transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary/5 border-primary text-foreground shadow-sm"
                        : "bg-card border-border hover:bg-accent/20 text-foreground"
                    )}
                  >
                    <span className="font-bold text-sm">{scenario.titulo}</span>
                    <p className="text-muted-foreground leading-normal mt-1 text-[11px]">{scenario.desc}</p>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold text-primary pt-2 mt-2 border-t border-border/50 font-mono">
                      <Cpu className="h-3.5 w-3.5 shrink-0" /> {scenario.id}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleExecutar}
            disabled={isExecuting}
            className="w-full text-xs font-semibold cursor-pointer h-10 flex items-center justify-center gap-1.5"
          >
            {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
            Iniciar Recuperação de Desastre
          </Button>
        </div>

        {/* Executed Plans Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Execuções de Contingência</h3>
              <p className="text-xs text-muted-foreground">Registro de planos de restauração executados no ambiente corporativo (Somente Leitura)</p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 text-center">ID da Execução</th>
                  <th className="p-4 text-center">Cenário Operado</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Dados Recuperados (Backup)</th>
                  <th className="p-4 text-center">Serviços Ativados</th>
                  <th className="p-4 text-center">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {execucoes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-semibold">
                      Nenhuma execução de desastres disponível no histórico.
                    </td>
                  </tr>
                ) : (
                  execucoes.map((exec) => (
                    <tr key={exec.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-foreground text-center">{exec.id}</td>
                      <td className="p-4 font-bold text-foreground text-center">{exec.tipoRecuperacao}</td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                          exec.status === "Concluído"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : exec.status === "Falhou"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-primary/10 text-primary border-primary/20 animate-pulse"
                        )}>
                          {exec.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground leading-normal font-medium text-center">{exec.dadosRecuperados}</td>
                      <td className="p-4 text-muted-foreground leading-normal text-center">{exec.servicosRestaurados}</td>
                      <td className="p-4 font-mono text-muted-foreground text-center" suppressHydrationWarning>{formatDate(exec.dataExecucao)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recovery Steps History Log */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Histórico da Operação (Logs de Continuidade)</h3>
            <p className="text-xs text-muted-foreground">Logs de auditoria e rastreabilidade detalhados para cada etapa da recuperação do ambiente</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">Carimbo de Hora</th>
                <th className="p-4 text-center">Execução ID</th>
                <th className="p-4 text-center">Operador TI</th>
                <th className="p-4 text-center">Cenário</th>
                <th className="p-4 text-center">Logs e Etapas Operadas</th>
                <th className="p-4 text-center">Status Etapa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {historicoOperacoes.map((log) => (
                <tr key={log.id} className="hover:bg-accent/10 transition-colors">
                  <td className="p-4 font-mono text-muted-foreground text-center" suppressHydrationWarning>{formatDate(log.timestamp)}</td>
                  <td className="p-4 font-mono text-muted-foreground font-semibold text-center">{log.execucaoId}</td>
                  <td className="p-4 text-center">
                    <div className="font-semibold text-foreground">{log.usuario}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{log.email}</div>
                  </td>
                  <td className="p-4 font-semibold text-foreground leading-normal text-center">{log.tipoRecuperacao}</td>
                  <td className="p-4 text-muted-foreground leading-normal font-medium text-center">{log.mensagem}</td>
                  <td className="p-4 font-bold text-center">
                    <span className={cn(
                      "inline-block px-1.5 py-0.5 rounded text-[10px] border",
                      log.statusEtapa === "Conclusão" || log.statusEtapa === "Concluído"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {log.statusEtapa}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
