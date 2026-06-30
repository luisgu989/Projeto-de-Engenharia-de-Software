"use client";

import React, { useState } from "react";
import { useMonitoramento } from "@/hooks/useMonitoramento";
import { useServidores } from "@/hooks/useServidores";
import { AuditoriaSeguranca } from "@/components/monitoramento/AuditoriaSeguranca";
import { DeteccaoAcessos } from "@/components/monitoramento/DeteccaoAcessos";
import {
  Activity,
  ShieldAlert,
  Cpu,
  HardDrive,
  Database,
  Network,
  Clock,
  BarChart3,
  Server,
  Terminal,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MonitoramentoPage() {
  const { metricas, historicoDeMonitoramento } = useMonitoramento();
  const { servidores, historicoEventos } = useServidores();
  const [activeTab, setActiveTab] = useState<"metricas" | "servidores" | "auditoria" | "bloqueios">("metricas");

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
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10 flex-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary animate-pulse" /> Telemetria de Infraestrutura & TI
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Painel estritamente gerencial e automatizado. Monitoramento ativo dos servidores, conexões de dados e latência geral de APIs do ERP.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-widest text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shrink-0">
          <ShieldAlert className="h-4 w-4" /> Coleta Ativa Contínua
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border gap-1 overflow-x-auto custom-scrollbar pb-px">
        <button
          onClick={() => setActiveTab("metricas")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "metricas"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Métricas Gerais de Recursos
        </button>
        <button
          onClick={() => setActiveTab("servidores")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "servidores"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Server className="h-4 w-4" />
          Servidores em Tempo Real
        </button>
        <button
          onClick={() => setActiveTab("auditoria")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "auditoria"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldAlert className="h-4 w-4" />
          Auditoria de Segurança
        </button>
        <button
          onClick={() => setActiveTab("bloqueios")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "bloqueios"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Terminal className="h-4 w-4" />
          Tentativas de Acesso
        </button>
      </div>

      {/* Tab 1: General Metrics */}
      {activeTab === "metricas" && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {metricas.map((m) => {
              let Icon = Cpu;
              let color = "text-blue-500";
              let bg = "bg-blue-500/10";
              if (m.tipoRecurso === "RAM") {
                Icon = HardDrive;
                color = "text-purple-500";
                bg = "bg-purple-500/10";
              } else if (m.tipoRecurso === "Banco de Dados") {
                Icon = Database;
                color = "text-amber-500";
                bg = "bg-amber-500/10";
              } else if (m.tipoRecurso === "Rede") {
                Icon = Network;
                color = "text-indigo-500";
                bg = "bg-indigo-500/10";
              } else if (m.tipoRecurso === "Latência API") {
                Icon = Clock;
                color = "text-pink-500";
                bg = "bg-pink-500/10";
              }

              return (
                <div key={m.id} className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", bg)}>
                        <Icon className={cn("h-5 w-5", color)} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-muted-foreground uppercase">{m.tipoRecurso}</h3>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono" suppressHydrationWarning>
                          Coleta: {new Date(m.dataColeta).toLocaleTimeString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                        m.nivelCriticidade === "Crítica"
                          ? "bg-destructive/10 text-destructive border border-destructive/20 animate-bounce"
                          : m.nivelCriticidade === "Alta"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : m.nivelCriticidade === "Média"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      )}
                    >
                      {m.nivelCriticidade}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-xs font-semibold">
                      <span className="text-muted-foreground">Consumo Registrado</span>
                      <span className="text-foreground font-mono">
                        {m.consumoRegistrado} {m.consumoUnidade}
                      </span>
                    </div>

                    {m.consumoUnidade === "%" ? (
                      <div className="h-2 w-full bg-accent/60 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            m.nivelCriticidade === "Crítica"
                              ? "bg-destructive"
                              : m.nivelCriticidade === "Alta"
                              ? "bg-amber-500"
                              : m.nivelCriticidade === "Média"
                              ? "bg-primary"
                              : "bg-emerald-500"
                          )}
                          style={{ width: `${m.consumoRegistrado}%` }}
                        />
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Telemetria operacional estável no banco de dados.</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-center text-[10px] font-bold">
                    <span className="text-muted-foreground font-mono">ID: {m.id}</span>
                    <span className={cn(
                      "flex items-center gap-1 before:content-[''] before:h-2 before:w-2 before:rounded-full font-semibold",
                      m.statusServico === "Operacional"
                        ? "text-emerald-500 before:bg-emerald-500"
                        : m.statusServico === "Instável"
                        ? "text-amber-500 before:bg-amber-500"
                        : "text-destructive before:bg-destructive"
                    )}>
                      {m.statusServico}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Histórico de Telemetria (Últimas 8 Coletas)
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-5 rounded-xl border border-border/80 bg-accent/5 space-y-3">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-blue-500" /> Tendência de Consumo CPU (%)
                </h4>
                <div className="flex justify-center p-3 bg-background border border-border/50 rounded-xl aspect-[4/1] max-h-[140px]">
                  <svg viewBox="0 0 400 100" className="w-full h-full text-[8px] font-mono">
                    <line x1="20" y1="20" x2="380" y2="20" className="stroke-muted" strokeWidth="1" />
                    <line x1="20" y1="50" x2="380" y2="50" className="stroke-muted" strokeWidth="1" />
                    <line x1="20" y1="80" x2="380" y2="80" className="stroke-border" strokeWidth="1" />

                    <path
                      d={`M ${historicoDeMonitoramento.CPU.map((val, idx) => {
                        const x = 30 + idx * 45;
                        const y = 80 - (val / 100) * 70;
                        return `${x} ${y}`;
                      }).join(" L ")}`}
                      fill="none"
                      className="stroke-primary"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {historicoDeMonitoramento.CPU.map((val, idx) => {
                      const x = 30 + idx * 45;
                      const y = 80 - (val / 100) * 70;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="3" className="fill-primary stroke-background" strokeWidth="1" />
                          <text x={x} y={y - 6} textAnchor="middle" className="fill-foreground" fontSize="6.5" fontWeight="bold">
                            {val}%
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-border/80 bg-accent/5 space-y-3">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-pink-500" /> Histórico de Latência API (ms)
                </h4>
                <div className="flex justify-center p-3 bg-background border border-border/50 rounded-xl aspect-[4/1] max-h-[140px]">
                  <svg viewBox="0 0 400 100" className="w-full h-full text-[8px] font-mono">
                    <line x1="20" y1="20" x2="380" y2="20" className="stroke-muted" strokeWidth="1" />
                    <line x1="20" y1="50" x2="380" y2="50" className="stroke-muted" strokeWidth="1" />
                    <line x1="20" y1="80" x2="380" y2="80" className="stroke-border" strokeWidth="1" />

                    <path
                      d={`M ${historicoDeMonitoramento["Latência API"].map((val, idx) => {
                        const x = 30 + idx * 45;
                        const y = 80 - (val / 400) * 70;
                        return `${x} ${y}`;
                      }).join(" L ")}`}
                      fill="none"
                      className="stroke-chart-2"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {historicoDeMonitoramento["Latência API"].map((val, idx) => {
                      const x = 30 + idx * 45;
                      const y = 80 - (val / 400) * 70;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="3" className="fill-chart-2 stroke-background" strokeWidth="1" />
                          <text x={x} y={y - 6} textAnchor="middle" className="fill-foreground" fontSize="6.5" fontWeight="bold">
                            {val}ms
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Servers Real Time Telemetry */}
      {activeTab === "servidores" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {servidores.map((srv) => (
              <div
                key={srv.id}
                className={cn(
                  "p-5 rounded-2xl border bg-card shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all border-border relative overflow-hidden",
                  srv.nivelCriticidade === "Crítica" && "border-destructive/30 bg-destructive/[0.01]"
                )}
              >
                {srv.nivelCriticidade === "Crítica" && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-destructive animate-pulse" />
                )}

                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      srv.status === "Operacional"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : srv.status === "Instável"
                        ? "bg-amber-500/10 text-amber-500 animate-pulse"
                        : "bg-destructive/10 text-destructive"
                    )}>
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted border px-1.5 py-0.5 rounded">
                        ID: {srv.id}
                      </span>
                      <h4 className="font-bold text-sm text-foreground pt-1 leading-tight">{srv.nome}</h4>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded border",
                      srv.nivelCriticidade === "Crítica"
                        ? "bg-destructive/10 text-destructive border-destructive/20 animate-bounce"
                        : srv.nivelCriticidade === "Alta"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : srv.nivelCriticidade === "Média"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                      Criticidade {srv.nivelCriticidade}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 text-[9px] font-semibold before:content-[''] before:h-1.5 before:w-1.5 before:rounded-full",
                      srv.status === "Operacional"
                        ? "text-emerald-500 before:bg-emerald-500"
                        : srv.status === "Instável"
                        ? "text-amber-500 before:bg-amber-500"
                        : "text-destructive before:bg-destructive"
                    )}>
                      {srv.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-end text-xs font-semibold">
                      <span className="text-muted-foreground">Consumo de CPU</span>
                      <span className="text-foreground font-mono">{srv.cpu}%</span>
                    </div>
                    <div className="h-2 w-full bg-accent/60 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          srv.cpu > 90
                            ? "bg-destructive"
                            : srv.cpu > 75
                            ? "bg-amber-500"
                            : "bg-primary"
                        )}
                        style={{ width: `${srv.cpu}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-end text-xs font-semibold">
                      <span className="text-muted-foreground">Consumo de RAM</span>
                      <span className="text-foreground font-mono">{srv.ram}%</span>
                    </div>
                    <div className="h-2 w-full bg-accent/60 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          srv.ram > 90
                            ? "bg-destructive"
                            : srv.ram > 80
                            ? "bg-amber-500"
                            : "bg-purple-500"
                        )}
                        style={{ width: `${srv.ram}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-end text-xs font-semibold">
                      <span className="text-muted-foreground">Armazenamento em Disco</span>
                      <span className="text-foreground font-mono">{srv.disco}%</span>
                    </div>
                    <div className="h-2 w-full bg-accent/60 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          srv.disco > 90 ? "bg-destructive" : "bg-emerald-500"
                        )}
                        style={{ width: `${srv.disco}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex justify-between items-center text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" /> Telemetria de leitura imutável
                  </span>
                  <span className="font-mono" suppressHydrationWarning>
                    Última Verificação: {formatDate(srv.dataVerificacao)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Histórico de Eventos Operacionais (Auditoria de Rede)</h3>
                <p className="text-xs text-muted-foreground">Logs de sistema registrando quedas, picos de consumo e restaurações dos servidores</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4 text-center">timestamp</th>
                    <th className="p-4 text-center">Servidor Relacionado</th>
                    <th className="p-4 text-center">Gravidade</th>
                    <th className="p-4 text-left">Descrição do Evento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {historicoEventos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        Nenhum registro operacional no histórico de eventos.
                      </td>
                    </tr>
                  ) : (
                    historicoEventos.map((log) => (
                      <tr key={log.id} className="hover:bg-accent/10 transition-colors">
                        <td className="p-4 font-mono text-muted-foreground text-center" suppressHydrationWarning>{formatDate(log.timestamp)}</td>
                        <td className="p-4 text-center">
                          <div className="font-bold text-foreground">{log.nomeServidor}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">ID: {log.servidorId}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                            log.tipo === "error"
                              ? "bg-destructive/10 text-destructive border-destructive/20 animate-bounce"
                              : log.tipo === "warning"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          )}>
                            {log.tipo === "error" ? "Falha" : log.tipo === "warning" ? "Alerta" : "Normal"}
                          </span>
                        </td>
                        <td className={cn(
                          "text-left p-4 font-semibold leading-normal",
                          log.tipo === "error"
                            ? "text-destructive"
                            : log.tipo === "warning"
                            ? "text-amber-500"
                            : "text-foreground"
                        )}>
                          {log.mensagem}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "auditoria" && <AuditoriaSeguranca />}

      {activeTab === "bloqueios" && <DeteccaoAcessos />}
    </div>
  );
}
