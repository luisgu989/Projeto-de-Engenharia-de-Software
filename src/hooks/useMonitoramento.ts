"use client";

import { useState, useEffect, useCallback } from "react";
import { useNotifications } from "@/contexts/notifications-context";

export interface MetricaPerformance {
  id: string;
  tipoRecurso: "CPU" | "RAM" | "Banco de Dados" | "Rede" | "Latência API";
  consumoRegistrado: number;
  consumoUnidade: string;
  statusServico: "Operacional" | "Instável" | "Inativo";
  nivelCriticidade: "Baixa" | "Média" | "Alta" | "Crítica";
  dataColeta: string;
}

const mockMetricasIniciais: MetricaPerformance[] = [
  {
    id: "METR-101",
    tipoRecurso: "CPU",
    consumoRegistrado: 42.5,
    consumoUnidade: "%",
    statusServico: "Operacional",
    nivelCriticidade: "Baixa",
    dataColeta: new Date().toISOString(),
  },
  {
    id: "METR-102",
    tipoRecurso: "RAM",
    consumoRegistrado: 72.8,
    consumoUnidade: "%",
    statusServico: "Operacional",
    nivelCriticidade: "Média",
    dataColeta: new Date().toISOString(),
  },
  {
    id: "METR-103",
    tipoRecurso: "Banco de Dados",
    consumoRegistrado: 15.2,
    consumoUnidade: "ms",
    statusServico: "Operacional",
    nivelCriticidade: "Baixa",
    dataColeta: new Date().toISOString(),
  },
  {
    id: "METR-104",
    tipoRecurso: "Rede",
    consumoRegistrado: 125.0,
    consumoUnidade: "Mbps",
    statusServico: "Operacional",
    nivelCriticidade: "Baixa",
    dataColeta: new Date().toISOString(),
  },
  {
    id: "METR-105",
    tipoRecurso: "Latência API",
    consumoRegistrado: 85.0,
    consumoUnidade: "ms",
    statusServico: "Operacional",
    nivelCriticidade: "Baixa",
    dataColeta: new Date().toISOString(),
  },
];

export function useMonitoramento() {
  const { addNotification } = useNotifications();
  const [metricas, setMetricas] = useState<MetricaPerformance[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_monitoramento_performance");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar métricas de performance:", e);
        }
      }
    }
    return mockMetricasIniciais;
  });

  const [historicoDeMonitoramento, setHistoricoDeMonitoramento] = useState<Record<string, number[]>>({
    CPU: [35, 45, 52, 42],
    RAM: [70, 71, 72, 73],
    "Latência API": [90, 85, 80, 85],
  });

  useEffect(() => {
    localStorage.setItem("erp_monitoramento_performance", JSON.stringify(metricas));
  }, [metricas]);

  // Função para calcular o nível de criticidade com base no consumo e recurso
  const calcularCriticidade = useCallback((
    tipo: MetricaPerformance["tipoRecurso"],
    consumo: number,
    status: MetricaPerformance["statusServico"]
  ): MetricaPerformance["nivelCriticidade"] => {
    if (status === "Inativo") return "Crítica";
    if (status === "Instável") return "Alta";

    if (tipo === "CPU") {
      if (consumo > 90) return "Crítica";
      if (consumo > 75) return "Alta";
      if (consumo > 45) return "Média";
      return "Baixa";
    }

    if (tipo === "RAM") {
      if (consumo > 90) return "Crítica";
      if (consumo > 80) return "Alta";
      if (consumo > 55) return "Média";
      return "Baixa";
    }

    if (tipo === "Latência API") {
      if (consumo > 400) return "Crítica";
      if (consumo > 250) return "Alta";
      if (consumo > 120) return "Média";
      return "Baixa";
    }

    if (tipo === "Banco de Dados") {
      if (consumo > 150) return "Crítica";
      if (consumo > 80) return "Alta";
      if (consumo > 40) return "Média";
      return "Baixa";
    }

    return "Baixa";
  }, []);

  // Simular alteração dinâmica em tempo real para fins gerenciais e automatizados
  useEffect(() => {
    const interval = setInterval(() => {
      setMetricas((prev) =>
        prev.map((metric) => {
          // Pequena oscilação no consumo
          let delta = (Math.random() - 0.5) * 8;
          
          // Ocasionalmente causar um pico crítico para demonstrar o alerta automático (5% chance)
          const forceSpike = Math.random() < 0.05;
          if (forceSpike && metric.tipoRecurso === "CPU") {
            delta = 45; // Jump to high critical level
          }

          let novoConsumo = Math.round((metric.consumoRegistrado + delta) * 10) / 10;
          if (metric.tipoRecurso === "CPU" || metric.tipoRecurso === "RAM") {
            novoConsumo = Math.max(10, Math.min(99, novoConsumo));
          } else {
            novoConsumo = Math.max(5, novoConsumo);
          }

          // Simular alteração ocasional de status do serviço
          let novoStatus = metric.statusServico;
          if (metric.tipoRecurso === "Latência API" && novoConsumo > 300) {
            novoStatus = "Instável";
          } else if (novoConsumo < 250) {
            novoStatus = "Operacional";
          }

          const novoNivel = calcularCriticidade(metric.tipoRecurso, novoConsumo, novoStatus);

          // Disparar alertas automáticos ao detectar falhas ou comportamentos críticos
          if (novoNivel === "Crítica" || novoNivel === "Alta") {
            // Apenas alertar se a criticidade piorou ou se manteve alta
            if (metric.nivelCriticidade !== "Crítica" && metric.nivelCriticidade !== "Alta") {
              addNotification(
                `Alerta de Performance: ${metric.tipoRecurso}`,
                `O recurso ${metric.tipoRecurso} atingiu consumo crítico de ${novoConsumo}${metric.consumoUnidade} (Nível: ${novoNivel}).`,
                "error",
                "gerente"
              );
            }
          }

          // Atualizar o histórico
          if (metric.tipoRecurso === "CPU" || metric.tipoRecurso === "RAM" || metric.tipoRecurso === "Latência API") {
            setHistoricoDeMonitoramento((current) => {
              const list = current[metric.tipoRecurso] || [];
              const updatedList = [...list, novoConsumo];
              if (updatedList.length > 8) updatedList.shift();
              return { ...current, [metric.tipoRecurso]: updatedList };
            });
          }

          return {
            ...metric,
            consumoRegistrado: novoConsumo,
            statusServico: novoStatus,
            nivelCriticidade: novoNivel,
            dataColeta: new Date().toISOString(),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [calcularCriticidade, addNotification]);

  return {
    metricas,
    historicoDeMonitoramento,
  };
}
