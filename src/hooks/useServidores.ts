"use client";

import { useState, useEffect, useCallback } from "react";
import { useNotifications } from "@/contexts/notifications-context";
import { useLogs } from "@/contexts/logs-context";

export interface Servidor {
  id: string; // Imutável
  nome: string;
  status: "Operacional" | "Instável" | "Fora do Ar";
  cpu: number; // %
  ram: number; // %
  disco: number; // %
  nivelCriticidade: "Baixa" | "Média" | "Alta" | "Crítica"; // Calculado
  dataVerificacao: string; // Timestamp imutável por atualização
}

export interface EventoServidor {
  id: string;
  servidorId: string;
  nomeServidor: string;
  tipo: "info" | "warning" | "error";
  mensagem: string;
  timestamp: string;
}

const SERVIDORES_INICIAIS: Servidor[] = [
  {
    id: "SRV-001",
    nome: "Servidor de Banco de Dados PostgreSQL",
    status: "Operacional",
    cpu: 34.2,
    ram: 62.5,
    disco: 45.8,
    nivelCriticidade: "Média",
    dataVerificacao: new Date().toISOString(),
  },
  {
    id: "SRV-002",
    nome: "Servidor de Aplicação Principal (Vercel/Next.js)",
    status: "Operacional",
    cpu: 28.5,
    ram: 44.1,
    disco: 30.2,
    nivelCriticidade: "Baixa",
    dataVerificacao: new Date().toISOString(),
  },
  {
    id: "SRV-003",
    nome: "Servidor de Cache & Filas Redis",
    status: "Operacional",
    cpu: 12.1,
    ram: 78.4,
    disco: 15.0,
    nivelCriticidade: "Média",
    dataVerificacao: new Date().toISOString(),
  },
  {
    id: "SRV-004",
    nome: "Servidor de Gateway de APIs & Nginx",
    status: "Operacional",
    cpu: 18.9,
    ram: 35.6,
    disco: 22.4,
    nivelCriticidade: "Baixa",
    dataVerificacao: new Date().toISOString(),
  },
];

const EVENTOS_INICIAIS: EventoServidor[] = [
  {
    id: "EVT-1001",
    servidorId: "SRV-001",
    nomeServidor: "Servidor de Banco de Dados PostgreSQL",
    tipo: "info",
    mensagem: "Banco de dados inicializado com sucesso e conexões ativas.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "EVT-1002",
    servidorId: "SRV-002",
    nomeServidor: "Servidor de Aplicação Principal (Vercel/Next.js)",
    tipo: "info",
    mensagem: "Deploy concluído e tráfego de API operando normalmente.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function useServidores() {
  const { addNotification } = useNotifications();
  const { addLog } = useLogs();
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [historicoEventos, setHistoricoEventos] = useState<EventoServidor[]>([]);

  // Inicializar dados do LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedServidores = localStorage.getItem("erp_servidores_data");
      const savedEventos = localStorage.getItem("erp_servidores_eventos");

      if (savedServidores) {
        try {
          setServidores(JSON.parse(savedServidores));
        } catch (e) {
          setServidores(SERVIDORES_INICIAIS);
        }
      } else {
        setServidores(SERVIDORES_INICIAIS);
        localStorage.setItem("erp_servidores_data", JSON.stringify(SERVIDORES_INICIAIS));
      }

      if (savedEventos) {
        try {
          setHistoricoEventos(JSON.parse(savedEventos));
        } catch (e) {
          setHistoricoEventos(EVENTOS_INICIAIS);
        }
      } else {
        setHistoricoEventos(EVENTOS_INICIAIS);
        localStorage.setItem("erp_servidores_eventos", JSON.stringify(EVENTOS_INICIAIS));
      }
    }
  }, []);

  // Persistir mudanças
  useEffect(() => {
    if (servidores.length > 0) {
      localStorage.setItem("erp_servidores_data", JSON.stringify(servidores));
    }
  }, [servidores]);

  useEffect(() => {
    if (historicoEventos.length > 0) {
      localStorage.setItem("erp_servidores_eventos", JSON.stringify(historicoEventos));
    }
  }, [historicoEventos]);

  // Função para calcular o nível de criticidade
  const calcularCriticidade = useCallback(
    (cpu: number, ram: number, disco: number, status: Servidor["status"]): Servidor["nivelCriticidade"] => {
      if (status === "Fora do Ar") return "Crítica";
      if (status === "Instável") return "Alta";

      const maxRecurso = Math.max(cpu, ram, disco);
      if (maxRecurso > 90) return "Crítica";
      if (maxRecurso > 75) return "Alta";
      if (maxRecurso > 50) return "Média";
      return "Baixa";
    },
    []
  );

  // Simulação em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setServidores((prevServidores) => {
        if (prevServidores.length === 0) return prevServidores;

        return prevServidores.map((srv) => {
          // Pequena oscilação de recursos
          let cpuDelta = (Math.random() - 0.5) * 6;
          let ramDelta = (Math.random() - 0.5) * 4;
          let discoDelta = Math.random() * 0.2; // Apenas sobe de leve

          let novoCpu = Math.round(Math.max(5, Math.min(99.5, srv.cpu + cpuDelta)) * 10) / 10;
          let novoRam = Math.round(Math.max(10, Math.min(99.5, srv.ram + ramDelta)) * 10) / 10;
          let novoDisco = Math.round(Math.max(5, Math.min(99.9, srv.disco + discoDelta)) * 10) / 10;

          // Evento aleatório para simular instabilidade ou queda (2% de chance)
          let novoStatus = srv.status;
          const statusRoll = Math.random();
          if (statusRoll < 0.02) {
            novoStatus = "Instável";
            novoCpu = Math.round((80 + Math.random() * 19) * 10) / 10; // CPU alta na instabilidade
          } else if (statusRoll < 0.025) {
            novoStatus = "Fora do Ar";
            novoCpu = 0;
            novoRam = 0;
          } else if (statusRoll < 0.08 && (srv.status === "Instável" || srv.status === "Fora do Ar")) {
            // Se estava instável ou fora do ar, 8% de chance de restaurar
            novoStatus = "Operacional";
          }

          const novaCriticidade = calcularCriticidade(novoCpu, novoRam, novoDisco, novoStatus);

          // Verificar se houve alteração de status relevante para notificar e registrar evento
          if (novoStatus !== srv.status || novaCriticidade !== srv.nivelCriticidade) {
            const timestamp = new Date().toISOString();
            let tipoEvento: "info" | "warning" | "error" = "info";
            let mensagem = `O servidor ${srv.nome} está operando normalmente.`;

            if (novoStatus === "Fora do Ar") {
              tipoEvento = "error";
              mensagem = `CRÍTICO: O servidor ${srv.nome} ficou FORA DO AR! Ação imediata é necessária.`;
            } else if (novoStatus === "Instável") {
              tipoEvento = "warning";
              mensagem = `ALERTA: O servidor ${srv.nome} apresenta comportamento INSTÁVEL.`;
            } else if (novaCriticidade === "Crítica" && srv.nivelCriticidade !== "Crítica") {
              tipoEvento = "error";
              mensagem = `CRÍTICO: Consumo de recursos crítico no servidor ${srv.nome} (CPU: ${novoCpu}%, RAM: ${novoRam}%).`;
            } else if (novaCriticidade === "Alta" && srv.nivelCriticidade !== "Alta" && srv.nivelCriticidade !== "Crítica") {
              tipoEvento = "warning";
              mensagem = `ALERTA: Consumo elevado de recursos no servidor ${srv.nome} (CPU: ${novoCpu}%, RAM: ${novoRam}%).`;
            } else if (novoStatus === "Operacional" && srv.status !== "Operacional") {
              tipoEvento = "info";
              mensagem = `RESOLVIDO: O servidor ${srv.nome} retornou ao status operacional estável.`;
            }

            // Apenas adicionar o evento e a notificação se for relevante
            if (novoStatus !== srv.status || novaCriticidade === "Crítica" || novaCriticidade === "Alta" || (novoStatus === "Operacional" && srv.status !== "Operacional")) {
              const novoEvento: EventoServidor = {
                id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                servidorId: srv.id,
                nomeServidor: srv.nome,
                tipo: tipoEvento,
                mensagem,
                timestamp,
              };

              setHistoricoEventos((prevEvts) => {
                const list = [novoEvento, ...prevEvts];
                if (list.length > 50) list.pop(); // limitar histórico
                return list;
              });

              addNotification(
                `Telemetria: ${srv.id}`,
                mensagem,
                tipoEvento === "error" ? "error" : tipoEvento === "warning" ? "warning" : "info",
                "geral"
              );
              addLog(`Evento de servidor registrado: ${srv.nome} - ${mensagem}`, "sistema");
            }
          }

          return {
            ...srv,
            cpu: novoCpu,
            ram: novoRam,
            disco: novoDisco,
            status: novoStatus,
            nivelCriticidade: novaCriticidade,
            dataVerificacao: new Date().toISOString(), // Atualização de timestamp gerenciada pelo sistema
          };
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [calcularCriticidade, addNotification]);

  return {
    servidores,
    historicoEventos,
  };
}
