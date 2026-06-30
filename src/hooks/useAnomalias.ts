"use client";

import { useState, useEffect, useCallback } from "react";
import { useLogs } from "@/contexts/logs-context";
import { DispositivoSensor } from "./useSensores";
import { ItemEstoque } from "./useEstoque";

export interface OcorrenciaAnomalia {
  id: string;
  tipoAnomalia: string;
  areaOperacional: "Produção" | "Estoque" | "Vendas" | "Financeiro";
  nivelCriticidade: "baixo" | "media" | "alto" | "critico";
  dataDetecao: string;
  status: "pendente" | "resolvida" | "sob_analise";
  descricao: string;
}

const anomaliasIniciais: OcorrenciaAnomalia[] = [
  {
    id: "ANOM-001",
    tipoAnomalia: "Temperatura Excessiva CNC",
    areaOperacional: "Produção",
    nivelCriticidade: "critico",
    dataDetecao: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "sob_analise",
    descricao: "Sensor CNC 1 registrou 82.4°C, acima do limite seguro de 80°C."
  },
  {
    id: "ANOM-002",
    tipoAnomalia: "Estoque Crítico de Segurança",
    areaOperacional: "Estoque",
    nivelCriticidade: "alto",
    dataDetecao: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: "pendente",
    descricao: "Mouse Gamer Sem Fio 16000DPI atingiu 8 unidades no estoque (mínimo de 12)."
  }
];

export function useAnomalias() {
  const { addLog } = useLogs();
  const [anomalias, setAnomalias] = useState<OcorrenciaAnomalia[]>(anomaliasIniciais);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("erp_anomalias");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setAnomalias(parsed);
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
      localStorage.setItem("erp_anomalias", JSON.stringify(anomalias));
    }
  }, [anomalias, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_anomalias");
      if (saved) {
        try {
          setAnomalias(JSON.parse(saved));
        } catch (exception) {
          console.error(exception);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const dispararNotificacaoAnomalia = useCallback((titulo: string, mensagem: string, criticidade: OcorrenciaAnomalia["nivelCriticidade"]) => {
    const savedNotifications = localStorage.getItem("erp_notifications");
    let notificationsList = [];
    if (savedNotifications) {
      try {
        notificationsList = JSON.parse(savedNotifications);
      } catch (e) {
        console.error(e);
      }
    }

    const tipoNotif = criticidade === "critico" || criticidade === "alto" ? "error" : "warning";
    const novaNotificacao = {
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: titulo,
      message: mensagem,
      timestamp: new Date().toISOString(),
      tipo: tipoNotif,
      lida: false,
      scope: "gerente"
    };

    localStorage.setItem("erp_notifications", JSON.stringify([novaNotificacao, ...notificationsList]));
    window.dispatchEvent(new Event("storage"));
  }, []);

  const detectarEAdicionarAnomalia = useCallback((
    tipo: string,
    area: OcorrenciaAnomalia["areaOperacional"],
    criticidade: OcorrenciaAnomalia["nivelCriticidade"],
    desc: string
  ) => {
    let isDuplicate = false;
    setAnomalias((prev) => {
      const exists = prev.some(
        (anom) =>
          anom.tipoAnomalia === tipo &&
          anom.status !== "resolvida" &&
          (Date.now() - new Date(anom.dataDetecao).getTime()) < 120000
      );
      if (exists) {
        isDuplicate = true;
        return prev;
      }

      const idGerado = `ANOM-${String(prev.length + 1).padStart(3, "0")}`;
      const novaAnomalia: OcorrenciaAnomalia = {
        id: idGerado,
        tipoAnomalia: tipo,
        areaOperacional: area,
        nivelCriticidade: criticidade,
        dataDetecao: new Date().toISOString(),
        status: "pendente",
        descricao: desc
      };

      setTimeout(() => {
        dispararNotificacaoAnomalia(`Anomalia: ${tipo}`, desc, criticidade);
      }, 0);

      addLog(`Registrou nova anomalia no sistema: ${tipo}`, "sistema");

      return [novaAnomalia, ...prev];
    });

    return !isDuplicate;
  }, [dispararNotificacaoAnomalia]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const savedSensores = localStorage.getItem("erp_sensores");
      if (savedSensores) {
        try {
          const list = JSON.parse(savedSensores);
          list.forEach((sensor: DispositivoSensor) => {
            if (sensor.status === "ativo") {
              if (sensor.id === "DEV-001" && sensor.valorCapturado > 80) {
                detectarEAdicionarAnomalia(
                  "Temperatura Excessiva CNC",
                  "Produção",
                  "critico",
                  `Sensor CNC 1 registrou temperatura de ${sensor.valorCapturado}°C, superando o limite operacional de 80°C.`
                );
              } else if (sensor.id === "DEV-002" && sensor.valorCapturado > 150) {
                detectarEAdicionarAnomalia(
                  "Pressão Alta Prensa Hidráulica",
                  "Produção",
                  "critico",
                  `Prensa Hidráulica registrou pressão crítica de ${sensor.valorCapturado} bar, acima do limite máximo de 150 bar.`
                );
              }
            }
          });
        } catch (e) {
          console.error(e);
        }
      }

      const savedEstoque = localStorage.getItem("erp_estoque");
      if (savedEstoque) {
        try {
          const list = JSON.parse(savedEstoque);
          list.forEach((item: ItemEstoque) => {
            if (item.status === "ativo" && item.quantidade < item.estoqueMinimo) {
              detectarEAdicionarAnomalia(
                "Estoque Abaixo do Limite Mínimo",
                "Estoque",
                "alto",
                `O produto ${item.nome} possui apenas ${item.quantidade} unidades em estoque, abaixo do limite mínimo de ${item.estoqueMinimo}.`
              );
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [detectarEAdicionarAnomalia]);

  const atualizarStatusAnomalia = (id: string, novoStatus: OcorrenciaAnomalia["status"]) => {
    setAnomalias((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: novoStatus } : item))
    );
    addLog(`Atualizou o status da anomalia ${id} para ${novoStatus}`, "sistema");
  };

  return {
    anomalias,
    atualizarStatusAnomalia
  };
}
