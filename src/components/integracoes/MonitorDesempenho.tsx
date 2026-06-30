"use client";

import React, { useState } from "react";
import { useDesempenho } from "@/hooks/useDesempenho";
import { useAuth } from "@/contexts/auth-context";
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  Database,
  Trash2,
  Clock,
  AlertTriangle,
  Settings,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MonitorDesempenho() {
  const { user } = useAuth();
  const {
    intervaloColeta,
    metricas,
    historico,
    atualizarIntervaloColeta,
    limparHistorico,
    error,
    setError
  } = useDesempenho();

  const [novoIntervalo, setNovoIntervalo] = useState<string>(String(intervaloColeta));
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (user.role !== "admin") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Acesso Restrito</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Apenas administradores do sistema possuem permissão para visualizar e configurar o monitor de desempenho do servidor.
          </p>
        </div>
      </div>
    );
  }

  const handleUpdateInterval = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const valor = parseInt(novoIntervalo, 10);
    const ok = atualizarIntervaloColeta(valor);
    if (ok) {
      setSuccessMsg("Intervalo de coleta atualizado com sucesso!");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Tem certeza que deseja apagar todo o histórico de leituras de desempenho?")) {
      limparHistorico();
      setSuccessMsg("Histórico de desempenho limpo.");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Uso de CPU</span>
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <span className="text-xl font-bold font-mono text-foreground">{metricas.cpu}%</span>
            <div className="h-2 w-full bg-accent/40 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metricas.cpu > 80 ? "bg-destructive" : metricas.cpu > 50 ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${metricas.cpu}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Memória RAM</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <span className="text-xl font-bold font-mono text-foreground">{metricas.memoria}%</span>
            <div className="h-2 w-full bg-accent/40 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metricas.memoria > 85 ? "bg-destructive" : metricas.memoria > 60 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${metricas.memoria}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Espaço em Disco</span>
            <HardDrive className="h-4 w-4 text-blue-500" />
          </div>
          <div className="space-y-1">
            <span className="text-xl font-bold font-mono text-foreground">{metricas.disco}%</span>
            <div className="h-2 w-full bg-accent/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${metricas.disco}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Latência de Rede</span>
            <Network className="h-4 w-4 text-purple-500" />
          </div>
          <div className="space-y-1">
            <span className="text-xl font-bold font-mono text-foreground">{metricas.latencia}ms</span>
            <div className="h-2 w-full bg-accent/40 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metricas.latencia > 120 ? "bg-destructive" : metricas.latencia > 60 ? "bg-amber-500" : "bg-purple-500"
                )}
                style={{ width: `${(metricas.latencia / 200) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Conexões Ativas DB</span>
            <Database className="h-4 w-4 text-amber-500" />
          </div>
          <div className="space-y-1">
            <span className="text-xl font-bold font-mono text-foreground">{metricas.conexoesDb}</span>
            <div className="h-2 w-full bg-accent/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(metricas.conexoesDb / 50) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Histórico de Leituras de Estabilidade</h3>
                <p className="text-xs text-muted-foreground">Rastreabilidade temporal das métricas do ERP</p>
              </div>
            </div>

            {historico.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-destructive/20 hover:bg-destructive/10 text-destructive font-semibold text-[10px] rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                Limpar Histórico
              </button>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[350px] flex-1">
            {successMsg && (
              <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {historico.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Nenhuma leitura de desempenho registrada no histórico local. Aguarde o próximo ciclo.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                    <th className="p-3 text-center">Carimbo</th>
                    <th className="p-3 text-center">Monitoramento ID</th>
                    <th className="p-3 text-center">CPU</th>
                    <th className="p-3 text-center">RAM</th>
                    <th className="p-3 text-center">Disco</th>
                    <th className="p-3 text-center">Latência</th>
                    <th className="p-3 text-center">Conexões DB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                  {historico.map((item) => (
                    <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-3 text-muted-foreground flex items-center gap-1 font-sans text-center">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                        {new Date(item.timestamp).toLocaleTimeString("pt-BR")}
                      </td>
                      <td className="p-3 text-muted-foreground font-semibold text-center">{item.id}</td>
                      <td className="text-center" className={cn("p-3 font-bold", item.cpu > 80 ? "text-destructive" : "text-foreground")}>
                        {item.cpu}%
                      </td>
                      <td className="text-center" className={cn("p-3 font-bold", item.memoria > 80 ? "text-destructive" : "text-foreground")}>
                        {item.memoria}%
                      </td>
                      <td className="p-3 text-foreground text-center">{item.disco}%</td>
                      <td className="p-3 text-foreground text-center">{item.latencia}ms</td>
                      <td className="p-3 text-foreground text-center">{item.conexoesDb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Frequência do Monitor</h3>
              <p className="text-xs text-muted-foreground">Configure a periodicidade de coleta de dados</p>
            </div>
          </div>

          <form onSubmit={handleUpdateInterval} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-xs font-semibold text-destructive bg-destructive/5 border border-destructive/10 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Intervalo de Coleta (em Segundos)
              </label>
              <input
                type="number"
                required
                min={5}
                max={300}
                placeholder="Ex: 10"
                value={novoIntervalo}
                onChange={(e) => setNovoIntervalo(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground font-mono"
              />
            </div>

            <div className="space-y-2 text-xs text-muted-foreground bg-accent/40 rounded-xl p-4 border border-border/50">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-foreground">Aviso sobre Performance:</span>
                  <p className="leading-snug text-[11px]">
                    Intervalos menores que 10 segundos aumentam o tráfego de pooling local e a frequência de escritas no localStorage. Ajuste conforme necessário.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 h-9 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-primary/20 transition-colors"
            >
              <span>Salvar Intervalo</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
