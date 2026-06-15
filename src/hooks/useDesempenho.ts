"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface MetricaDesempenho {
  cpu: number;
  memoria: number;
  disco: number;
  latencia: number;
  conexoesDb: number;
}

export interface RegistroDesempenho {
  id: string;
  timestamp: string;
  cpu: number;
  memoria: number;
  disco: number;
  latencia: number;
  conexoesDb: number;
  usuarioResponsavel: string;
}

export function useDesempenho() {
  const { user } = useAuth();
  const { addLog } = useLogs();

  const [intervaloColeta, setIntervaloColeta] = useState<number>(10);
  const [metricas, setMetricas] = useState<MetricaDesempenho>({
    cpu: 22,
    memoria: 48,
    disco: 72,
    latencia: 35,
    conexoesDb: 12
  });
  const [historico, setHistorico] = useState<RegistroDesempenho[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const savedInterval = localStorage.getItem("erp_desempenho_intervalo");
    let intervalVal = 10;
    if (savedInterval) {
      const parsed = parseInt(savedInterval, 10);
      if (!isNaN(parsed) && parsed >= 5 && parsed <= 300) {
        intervalVal = parsed;
      }
    }

    const savedHistory = localStorage.getItem("erp_desempenho_historico");
    let historyVal: RegistroDesempenho[] = [];
    if (savedHistory) {
      try {
        historyVal = JSON.parse(savedHistory);
      } catch (e) {
        console.error(e);
      }
    }

    setTimeout(() => {
      setIntervaloColeta(intervalVal);
      setHistorico(historyVal);
      setIsLoaded(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_desempenho_intervalo", String(intervaloColeta));
    }
  }, [intervaloColeta, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_desempenho_historico", JSON.stringify(historico));
    }
  }, [historico, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedInterval = localStorage.getItem("erp_desempenho_intervalo");
      if (savedInterval) {
        const parsed = parseInt(savedInterval, 10);
        if (!isNaN(parsed) && parsed >= 5 && parsed <= 300) {
          setIntervaloColeta(parsed);
        }
      }
      const savedHistory = localStorage.getItem("erp_desempenho_historico");
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          setHistorico((current) => {
            if (JSON.stringify(current) === savedHistory) {
              return current;
            }
            return parsed;
          });
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const intervalId = setInterval(() => {
      setMetricas((prev) => {
        const cpuNew = Math.min(100, Math.max(0, prev.cpu + (Math.random() > 0.5 ? 2 : -2)));
        const memoriaNew = Math.min(100, Math.max(0, prev.memoria + (Math.random() > 0.5 ? 1 : -1)));
        const discoNew = Math.min(100, Math.max(0, prev.disco + (Math.random() > 0.5 ? 0.1 : -0.1)));
        const latenciaNew = Math.min(200, Math.max(5, prev.latencia + (Math.random() > 0.5 ? 5 : -5)));
        const conexoesDbNew = Math.min(50, Math.max(1, prev.conexoesDb + (Math.random() > 0.5 ? 1 : -1)));

        const novoRegistro: RegistroDesempenho = {
          id: `MON-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          timestamp: new Date().toISOString(),
          cpu: Math.round(cpuNew),
          memoria: Math.round(memoriaNew),
          disco: parseFloat(discoNew.toFixed(2)),
          latencia: Math.round(latenciaNew),
          conexoesDb: Math.round(conexoesDbNew),
          usuarioResponsavel: userRef.current?.name || "Sistema Monitor"
        };

        setHistorico((prevHistory) => [novoRegistro, ...prevHistory.slice(0, 49)]);

        return {
          cpu: Math.round(cpuNew),
          memoria: Math.round(memoriaNew),
          disco: parseFloat(discoNew.toFixed(2)),
          latencia: Math.round(latenciaNew),
          conexoesDb: Math.round(conexoesDbNew)
        };
      });
    }, intervaloColeta * 1000);

    return () => clearInterval(intervalId);
  }, [intervaloColeta, isLoaded]);

  const atualizarIntervaloColeta = (segundos: number) => {
    setError(null);
    if (isNaN(segundos) || segundos < 5 || segundos > 300) {
      setError("O intervalo de coleta deve ser de no mínimo 5 e no máximo 300 segundos.");
      return false;
    }
    setIntervaloColeta(segundos);
    addLog(`Alterou intervalo de coleta de métricas para ${segundos}s`, "seguranca");
    return true;
  };

  const limparHistorico = () => {
    setHistorico([]);
    addLog("Limpou histórico de monitoramento de desempenho", "seguranca");
  };

  return {
    intervaloColeta,
    metricas,
    historico,
    atualizarIntervaloColeta,
    limparHistorico,
    error,
    setError
  };
}
