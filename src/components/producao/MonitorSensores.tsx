import React from "react";
import { useSensores, DispositivoSensor } from "@/hooks/useSensores";
import { Cpu, Power, Wrench, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function MonitorSensores() {
  const { sensores, alterarStatusDispositivo } = useSensores();

  const renderEvolutionChart = (sensor: DispositivoSensor) => {
    const readings = sensor.historicoLeituras;
    if (readings.length < 2) {
      return null;
    }

    const values = readings.map((r) => r.valor);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const width = 160;
    const height = 32;

    const points = readings
      .map((r, index) => {
        const x = (index / (readings.length - 1)) * width;
        const y = height - ((r.valor - minVal) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="flex flex-col items-end gap-1 select-none">
        <svg height={height} width={width} className="overflow-visible text-primary">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
        <span className="text-[9px] text-muted-foreground font-mono">
          Mín: {minVal} | Máx: {maxVal}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Dispositivos & Sensores IoT</h3>
            <p className="text-xs text-muted-foreground">Monitoramento operacional em tempo real da manufatura</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-muted-foreground">Transmissão Ativa</span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {sensores.map((sensor) => {
          const isSensorActive = sensor.status === "ativo";
          const isSensorInMaintenance = sensor.status === "manutencao";

          return (
            <div
              key={sensor.id}
              className={cn(
                "p-5 rounded-xl border bg-card shadow-sm flex flex-col justify-between gap-4 transition-all duration-300",
                isSensorActive && "border-primary/20 bg-primary/[0.01]",
                isSensorInMaintenance && "border-amber-500/20 bg-amber-500/[0.01]"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground font-mono uppercase">
                      {sensor.id}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide whitespace-nowrap",
                        sensor.status === "ativo"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : sensor.status === "manutencao"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {sensor.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{sensor.nome}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      alterarStatusDispositivo(sensor.id, isSensorActive ? "inativo" : "ativo")
                    }
                    className={cn(
                      "p-1.5 rounded-lg border text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors",
                      isSensorActive && "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                    )}
                    title={isSensorActive ? "Desativar Sensor" : "Ativar Sensor"}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      alterarStatusDispositivo(
                        sensor.id,
                        isSensorInMaintenance ? "ativo" : "manutencao"
                      )
                    }
                    className={cn(
                      "p-1.5 rounded-lg border text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors",
                      isSensorInMaintenance && "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    )}
                    title="Modo Manutenção"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-4 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Leitura Atual
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-foreground">
                      {isSensorActive ? sensor.valorCapturado : "---"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {sensor.tipoLeitura.split(" ")[1] || ""}
                    </span>
                  </div>
                </div>

                {isSensorActive ? (
                  renderEvolutionChart(sensor)
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium py-3">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Sem transmissão de sinal</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
