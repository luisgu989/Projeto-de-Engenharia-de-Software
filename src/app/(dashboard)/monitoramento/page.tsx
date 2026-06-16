"use client";

import React from "react";
import { useMonitoramento } from "@/hooks/useMonitoramento";
import { Activity, ShieldAlert, Cpu, HardDrive, Database, Network, Clock, BarChart3, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MonitoramentoPage() {
  const { metricas, historicoDeMonitoramento } = useMonitoramento();

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

      {/* Resource Metrics Cards */}
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
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl", bg)}>
                    <Icon className={cn("h-5 w-5", color)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-muted-foreground uppercase">{m.tipoRecurso}</h3>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
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

              {/* Progress visual bar or metric gauge */}
              <div className="space-y-2">
                <div className="flex justify-between items-end text-xs font-semibold">
                  <span className="text-muted-foreground">Consumo Registrado</span>
                  <span className="text-foreground font-mono">
                    {m.consumoRegistrado} {m.consumoUnidade}
                  </span>
                </div>

                {/* Draw progress bar for % fields */}
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

              {/* Status */}
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

      {/* SVG Performance Line Graph */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Histórico de Telemetria (Últimas 8 Coletas)
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* CPU telemetry trend */}
          <div className="p-5 rounded-xl border border-border/80 bg-accent/5 space-y-3">
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-blue-500" /> Tendência de Consumo CPU (%)
            </h4>
            <div className="flex justify-center p-3 bg-background border border-border/50 rounded-xl aspect-[4/1] max-h-[140px]">
              <svg viewBox="0 0 400 100" className="w-full h-full text-[8px] font-mono">
                {/* Horizontal grid lines */}
                <line x1="20" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="50" x2="380" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="80" x2="380" y2="80" stroke="#cbd5e1" strokeWidth="1" />

                {/* Draw path */}
                <path
                  d={`M ${historicoDeMonitoramento.CPU.map((val, idx) => {
                    const x = 30 + idx * 45;
                    const y = 80 - (val / 100) * 70;
                    return `${x} ${y}`;
                  }).join(" L ")}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Nodes */}
                {historicoDeMonitoramento.CPU.map((val, idx) => {
                  const x = 30 + idx * 45;
                  const y = 80 - (val / 100) * 70;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                      <text x={x} y={y - 6} textAnchor="middle" fill="#1e3a8a" fontSize="6.5" fontWeight="bold">
                        {val}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Latency telemetry trend */}
          <div className="p-5 rounded-xl border border-border/80 bg-accent/5 space-y-3">
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-pink-500" /> Histórico de Latência API (ms)
            </h4>
            <div className="flex justify-center p-3 bg-background border border-border/50 rounded-xl aspect-[4/1] max-h-[140px]">
              <svg viewBox="0 0 400 100" className="w-full h-full text-[8px] font-mono">
                <line x1="20" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="50" x2="380" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="80" x2="380" y2="80" stroke="#cbd5e1" strokeWidth="1" />

                <path
                  d={`M ${historicoDeMonitoramento["Latência API"].map((val, idx) => {
                    const x = 30 + idx * 45;
                    const y = 80 - (val / 400) * 70; // Latency range max 400 ms
                    return `${x} ${y}`;
                  }).join(" L ")}`}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {historicoDeMonitoramento["Latência API"].map((val, idx) => {
                  const x = 30 + idx * 45;
                  const y = 80 - (val / 400) * 70;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="3" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
                      <text x={x} y={y - 6} textAnchor="middle" fill="#9d174d" fontSize="6.5" fontWeight="bold">
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
  );
}
