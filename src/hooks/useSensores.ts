"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/contexts/logs-context";

export interface LeituraSensor {
  valor: number;
  data: string;
}

export interface DispositivoSensor {
  id: string;
  nome: string;
  tipoLeitura: string;
  valorCapturado: number;
  dataColeta: string;
  status: "ativo" | "inativo" | "manutencao" | "offline";
  historicoLeituras: LeituraSensor[];
}

const sensoresIniciais: DispositivoSensor[] = [
  {
    id: "DEV-001",
    nome: "Sensor de Temperatura CNC 1",
    tipoLeitura: "Temperatura (°C)",
    valorCapturado: 62.5,
    dataColeta: new Date().toISOString(),
    status: "ativo",
    historicoLeituras: [
      { valor: 61.2, data: new Date(Date.now() - 12000).toISOString() },
      { valor: 62.0, data: new Date(Date.now() - 8000).toISOString() },
      { valor: 62.5, data: new Date(Date.now() - 4000).toISOString() }
    ]
  },
  {
    id: "DEV-002",
    nome: "Sensor de Pressão Prensa Hidráulica",
    tipoLeitura: "Pressão (bar)",
    valorCapturado: 118.0,
    dataColeta: new Date().toISOString(),
    status: "ativo",
    historicoLeituras: [
      { valor: 115.0, data: new Date(Date.now() - 12000).toISOString() },
      { valor: 117.5, data: new Date(Date.now() - 8000).toISOString() },
      { valor: 118.0, data: new Date(Date.now() - 4000).toISOString() }
    ]
  },
  {
    id: "DEV-003",
    nome: "Sensor de Vibração Turbina B",
    tipoLeitura: "Vibração (Hz)",
    valorCapturado: 45.1,
    dataColeta: new Date().toISOString(),
    status: "ativo",
    historicoLeituras: [
      { valor: 44.8, data: new Date(Date.now() - 12000).toISOString() },
      { valor: 45.0, data: new Date(Date.now() - 8000).toISOString() },
      { valor: 45.1, data: new Date(Date.now() - 4000).toISOString() }
    ]
  },
  {
    id: "DEV-004",
    nome: "Medidor de Consumo Elétrico Linha A",
    tipoLeitura: "Consumo Elétrico (kWh)",
    valorCapturado: 3.5,
    dataColeta: new Date().toISOString(),
    status: "ativo",
    historicoLeituras: [
      { valor: 3.4, data: new Date(Date.now() - 12000).toISOString() },
      { valor: 3.5, data: new Date(Date.now() - 8000).toISOString() },
      { valor: 3.5, data: new Date(Date.now() - 4000).toISOString() }
    ]
  }
];

export function useSensores() {
  const { addLog } = useLogs();
  const [sensores, setSensores] = useState<DispositivoSensor[]>(sensoresIniciais);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("erp_sensores");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setSensores(parsed);
          setIsLoaded(true);
        }, 0);
        return;
      } catch (exception) {
        console.error(exception);
      }
    }
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_sensores", JSON.stringify(sensores));
    }
  }, [sensores, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_sensores");
      if (saved) {
        try {
          setSensores(JSON.parse(saved));
        } catch (exception) {
          console.error(exception);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSensores((prevSensores) =>
        prevSensores.map((sensor) => {
          if (sensor.status !== "ativo") {
            return sensor;
          }

          let delta = 0;
          if (sensor.id === "DEV-001") {
            delta = (Math.random() - 0.5) * 3;
          } else if (sensor.id === "DEV-002") {
            delta = (Math.random() - 0.5) * 8;
          } else if (sensor.id === "DEV-003") {
            delta = (Math.random() - 0.5) * 1.2;
          } else {
            delta = (Math.random() - 0.5) * 0.4;
          }

          const novoValor = parseFloat((sensor.valorCapturado + delta).toFixed(2));
          const timestamp = new Date().toISOString();
          const novaLeitura = { valor: novoValor, data: timestamp };

          const novoHistorico = [...sensor.historicoLeituras, novaLeitura].slice(-10);

          return {
            ...sensor,
            valorCapturado: novoValor,
            dataColeta: timestamp,
            historicoLeituras: novoHistorico
          };
        })
      );
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  const alterarStatusDispositivo = (id: string, novoStatus: DispositivoSensor["status"]) => {
    setSensores((prev) =>
      prev.map((sensor) => {
        if (sensor.id === id && sensor.status !== novoStatus) {
          addLog(`Alterou status do sensor ${sensor.nome} para ${novoStatus}`, "infraestrutura");
          return { ...sensor, status: novoStatus };
        }
        return sensor;
      })
    );
  };

  return {
    sensores,
    alterarStatusDispositivo
  };
}
