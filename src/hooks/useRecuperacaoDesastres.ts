"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface ExecucaoRecuperacao {
  id: string; // ID da Execução gerado automaticamente (imutável)
  tipoRecuperacao: string; // Tipo de Recuperação (Cenário aplicado)
  status: "Iniciando" | "Validando Backup" | "Restaurando Serviços" | "Concluído" | "Falhou"; // Status da Execução
  servicosRestaurados: string; // Serviços Restaurados
  dadosRecuperados: string; // Dados Recuperados (Validação de integridade do backup)
  dataExecucao: string; // Data da Execução (timestamp)
}

export interface LogOperacaoRecuperacao {
  id: string;
  timestamp: string;
  execucaoId: string;
  usuario: string;
  email: string;
  tipoRecuperacao: string;
  mensagem: string;
  statusEtapa: string;
}

const EXECUCOES_INICIAIS: ExecucaoRecuperacao[] = [
  {
    id: "REC-DES-001",
    tipoRecuperacao: "Failover de Cluster de APIs & Microsserviços",
    status: "Concluído",
    servicosRestaurados: "Gateway API Nginx, Serviço de Autenticação",
    dadosRecuperados: "Snapshot Secundário AWS (Integridade: 100% OK)",
    dataExecucao: new Date(Date.now() - 3600000 * 24 * 7).toISOString(), // 7 dias atrás
  },
];

const LOGS_INICIAIS: LogOperacaoRecuperacao[] = [
  {
    id: "OPR-REC-1001",
    timestamp: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    execucaoId: "REC-DES-001",
    usuario: "Usuário Suporte",
    email: "admin@erppro.com",
    tipoRecuperacao: "Failover de Cluster de APIs & Microsserviços",
    mensagem: "Execução concluída com sucesso. Todos os microsserviços reestabelecidos no ambiente secundário.",
    statusEtapa: "Concluído",
  },
];

export function useRecuperacaoDesastres() {
  const { user } = useAuth();
  const { addLog: addGlobalLog } = useLogs();
  const [execucoes, setExecucoes] = useState<ExecucaoRecuperacao[]>([]);
  const [historicoOperacoes, setHistoricoOperacoes] = useState<LogOperacaoRecuperacao[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  // Carregar do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedExecucoes = localStorage.getItem("erp_desastre_execucoes");
      const savedLogs = localStorage.getItem("erp_desastre_logs");

      if (savedExecucoes) {
        try {
          setExecucoes(JSON.parse(savedExecucoes));
        } catch (e) {
          setExecucoes(EXECUCOES_INICIAIS);
        }
      } else {
        setExecucoes(EXECUCOES_INICIAIS);
        localStorage.setItem("erp_desastre_execucoes", JSON.stringify(EXECUCOES_INICIAIS));
      }

      if (savedLogs) {
        try {
          setHistoricoOperacoes(JSON.parse(savedLogs));
        } catch (e) {
          setHistoricoOperacoes(LOGS_INICIAIS);
        }
      } else {
        setHistoricoOperacoes(LOGS_INICIAIS);
        localStorage.setItem("erp_desastre_logs", JSON.stringify(LOGS_INICIAIS));
      }
    }
  }, []);

  const rodarRecuperacao = (scenario: string, backupName: string, services: string) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setProgressStep(1);

    const execId = `REC-DES-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Criar registro inicial da execução
    const novaExec: ExecucaoRecuperacao = {
      id: execId, // Gerado automaticamente
      tipoRecuperacao: scenario, // Cenário validado
      status: "Iniciando", // Atualizado automaticamente
      servicosRestaurados: services, // Recuperado automaticamente
      dadosRecuperados: `${backupName} (Integridade: Analisando...)`, // Validando backup
      dataExecucao: timestamp, // Registrar timestamp
    };

    setExecucoes((prev) => [novaExec, ...prev]);

    addGlobalLog(`Iniciou plano de recuperação de desastres: ${scenario}`, "sistema");

    // Helper para adicionar log
    const addLog = (msg: string, etapa: string, statusExec: ExecucaoRecuperacao["status"]) => {
      const novoLog: LogOperacaoRecuperacao = {
        id: `OPR-REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        execucaoId: execId,
        usuario: user.name,
        email: user.email,
        tipoRecuperacao: scenario,
        mensagem: msg,
        statusEtapa: etapa,
      };

      setHistoricoOperacoes((prev) => [novoLog, ...prev]);

      // Atualizar status da execução ativa na lista
      setExecucoes((prevList) =>
        prevList.map((ex) => {
          if (ex.id === execId) {
            return {
              ...ex,
              status: statusExec,
              dadosRecuperados: statusExec === "Concluído"
                ? `${backupName} (Integridade: 100% VÁLIDA & CONCISA)`
                : statusExec === "Validando Backup"
                ? `${backupName} (Integridade: Backup Íntegro de Dados)`
                : ex.dadosRecuperados,
            };
          }
          return ex;
        })
      );
    };

    // Registrar início
    setTimeout(() => {
      addLog("Operação de recuperação iniciada. Mapeamento de serviços ativos.", "Iniciando", "Iniciando");
      setProgressStep(2);

      // Validar Backup
      setTimeout(() => {
        addLog(`Integridade do backup "${backupName}" validada com sucesso. Estrutura de chaves OK.`, "Validação de Backup", "Validando Backup");
        setProgressStep(3);

        // Restaurar Serviços
        setTimeout(() => {
          addLog(`Restaurando serviços afetados: ${services}. Reconectando gateways de rede.`, "Restauração de Serviços", "Restaurando Serviços");
          setProgressStep(4);

          // Concluir
          setTimeout(() => {
            addLog("Plano de recuperação de desastres concluído com sucesso. Serviços reestabelecidos.", "Conclusão", "Concluído");
            setIsExecuting(false);
            setProgressStep(0);

            // Persistir resultados no localStorage
            setExecucoes((finalList) => {
              localStorage.setItem("erp_desastre_execucoes", JSON.stringify(finalList));
              return finalList;
            });
            setHistoricoOperacoes((finalLogs) => {
              localStorage.setItem("erp_desastre_logs", JSON.stringify(finalLogs));
              return finalLogs;
            });
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  return {
    execucoes,
    historicoOperacoes,
    rodarRecuperacao,
    isExecuting,
    progressStep,
  };
}
