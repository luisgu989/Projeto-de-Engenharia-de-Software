"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useAtivos, Ativo } from "./useAtivos";
import { useLogs } from "@/contexts/logs-context";

export interface Manutencao {
  id: string;
  ativoId: string;
  ativoCodigo: string;
  ativoDescricao: string;
  tipoManutencao: "Preventiva" | "Corretiva" | "Preditiva" | "Calibração";
  periodicidade: "Semanal" | "Mensal" | "Trimestral" | "Semestral" | "Anual";
  status: "agendada" | "em_execucao" | "concluida" | "cancelada";
  dataAgendada: string;
  dataExecucao: string | null;
  responsavel: string;
  detalhes: string;
}

export const CATEGORIAS_MANUTENCAO = [
  "Preventiva",
  "Corretiva",
  "Preditiva",
  "Calibração",
];

export const PERIODICIDADES_VALIDAS = [
  "Semanal",
  "Mensal",
  "Trimestral",
  "Semestral",
  "Anual",
];

const mockManutencoesIniciais: Manutencao[] = [
  {
    id: "MAN-201",
    ativoId: "ATV-101",
    ativoCodigo: "PAT-CNC-001",
    ativoDescricao: "Corte e Dobra CNC Laser 500W",
    tipoManutencao: "Preventiva",
    periodicidade: "Trimestral",
    status: "agendada",
    dataAgendada: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0], // 5 dias à frente
    dataExecucao: null,
    responsavel: "Usuário Suporte",
    detalhes: "Revisão periódica de alinhamento das lentes ópticas e limpeza geral.",
  },
  {
    id: "MAN-202",
    ativoId: "ATV-102",
    ativoCodigo: "PAT-3DP-002",
    ativoDescricao: "Impressora 3D Resina Elegoo",
    tipoManutencao: "Calibração",
    periodicidade: "Mensal",
    status: "concluida",
    dataAgendada: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0], // 2 dias atrás
    dataExecucao: new Date(Date.now() - 86400000 * 2).toISOString(),
    responsavel: "João da Silva",
    detalhes: "Calibração do eixo Z e nivelamento do prato de impressão.",
  },
];

export function useManutencaoPreventiva() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addNotification } = useNotifications();
  const { ativos } = useAtivos();

  const [manutencoes, setManutencoes] = useState<Manutencao[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_manutencoes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar manutenções:", e);
        }
      }
    }
    return mockManutencoesIniciais;
  });

  const [historicoIntervencoes, setHistoricoIntervencoes] = useState<Manutencao[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_intervencoes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico de intervenções:", e);
        }
      }
    }
    // Filtra as concluídas dos mocks iniciais como histórico inicial
    return mockManutencoesIniciais.filter((m) => m.status === "concluida");
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_manutencoes", JSON.stringify(manutencoes));
  }, [manutencoes]);

  useEffect(() => {
    localStorage.setItem("erp_historico_intervencoes", JSON.stringify(historicoIntervencoes));
  }, [historicoIntervencoes]);

  // Sync entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const savedManut = localStorage.getItem("erp_manutencoes");
      const savedHist = localStorage.getItem("erp_historico_intervencoes");
      if (savedManut) {
        try { setManutencoes(JSON.parse(savedManut)); } catch (e) {}
      }
      if (savedHist) {
        try { setHistoricoIntervencoes(JSON.parse(savedHist)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar permissão: Gerente, Administrador ou cargo ligado a Logística/Manutenção
  const verificarPrivilegio = useCallback(() => {
    const cargo = user.cargo?.toLowerCase() || "";
    return (
      user.role === "admin" ||
      cargo.includes("gerente") ||
      cargo.includes("diretor") ||
      cargo.includes("logística") ||
      cargo.includes("manutenção")
    );
  }, [user]);

  // Agendar manutenção
  const agendarManutencao = useCallback(
    (
      ativoId: string,
      tipoManutencao: Manutencao["tipoManutencao"],
      periodicidade: Manutencao["periodicidade"],
      dataAgendada: string,
      detalhes: string
    ) => {
      setError(null);

      if (!verificarPrivilegio()) {
        setError("Apenas usuários com privilégios de logística ou administração podem agendar manutenções.");
        return false;
      }

      const ativo = ativos.find((a) => a.id === ativoId);
      if (!ativo) {
        setError("Equipamento/Ativo não encontrado.");
        return false;
      }

      if (ativo.status === "baixado") {
        setError("Este ativo foi baixado e não pode receber agendamentos.");
        return false;
      }

      if (!CATEGORIAS_MANUTENCAO.includes(tipoManutencao)) {
        setError("Categoria de manutenção inválida.");
        return false;
      }

      if (!PERIODICIDADES_VALIDAS.includes(periodicidade)) {
        setError("Periodicidade inválida.");
        return false;
      }

      const id = `MAN-${Math.floor(100000 + Math.random() * 900000)}`;

      const novaManutencao: Manutencao = {
        id,
        ativoId,
        ativoCodigo: ativo.codigoPatrimonial,
        ativoDescricao: ativo.descricao,
        tipoManutencao,
        periodicidade,
        status: "agendada",
        dataAgendada,
        dataExecucao: null,
        responsavel: user.name,
        detalhes: detalhes.trim(),
      };

      setManutencoes((prev) => [novaManutencao, ...prev]);

      addLog(`Agendou manutenção preventiva ${id} para o ativo ${ativo.descricao}`, "manutencao");

      // Alertas de Programação automáticos para logística/gerência
      addNotification(
        "Manutenção Preventiva Agendada",
        `Maquinário "${ativo.descricao}" agendado para revisão (${tipoManutencao} - ${periodicidade}) no dia ${dataAgendada}.`,
        "info",
        "logistica"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [ativos, user, addNotification, verificarPrivilegio]
  );

  // Editar Agendamento
  const editarAgendamento = useCallback(
    (
      id: string,
      tipoManutencao: Manutencao["tipoManutencao"],
      periodicidade: Manutencao["periodicidade"],
      dataAgendada: string,
      detalhes: string
    ) => {
      setError(null);

      if (!verificarPrivilegio()) {
        setError("Você não possui privilégios de acesso para modificar agendamentos.");
        return false;
      }

      const manutencao = manutencoes.find((m) => m.id === id);
      if (!manutencao) {
        setError("Agendamento de manutenção não encontrado.");
        return false;
      }

      if (manutencao.status === "concluida" || manutencao.status === "cancelada") {
        setError("Não é possível modificar cronogramas de manutenções já finalizadas ou canceladas.");
        return false;
      }

      if (!CATEGORIAS_MANUTENCAO.includes(tipoManutencao)) {
        setError("Categoria de manutenção inválida.");
        return false;
      }

      if (!PERIODICIDADES_VALIDAS.includes(periodicidade)) {
        setError("Periodicidade inválida.");
        return false;
      }

      setManutencoes((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            // ativoId, ativoCodigo e ativoDescricao permanecem completamente IMUTÁVEIS
            return {
              ...m,
              tipoManutencao,
              periodicidade,
              dataAgendada,
              detalhes: detalhes.trim(),
              responsavel: user.name,
            };
          }
          return m;
        })
      );

      addLog(`Editou o agendamento da manutenção preventiva ${id}`, "manutencao");

      addNotification(
        "Cronograma de Manutenção Alterado",
        `O agendamento da manutenção ${id} foi reprogramado para ${dataAgendada}.`,
        "warning",
        "logistica"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [manutencoes, user, addNotification, verificarPrivilegio]
  );

  // Alterar Status da Manutenção (Execução e Conclusão)
  const atualizarStatusManutencao = useCallback(
    (id: string, novoStatus: Manutencao["status"], detalhesExecucao?: string) => {
      setError(null);

      const manutencao = manutencoes.find((m) => m.id === id);
      if (!manutencao) {
        setError("Manutenção não encontrada.");
        return false;
      }

      // Se já estava concluída, não permite alterar
      if (manutencao.status === "concluida") {
        setError("Esta manutenção já foi finalizada e os logs históricos estão blindados.");
        return false;
      }

      const dataAtual = new Date().toISOString();

      setManutencoes((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            return {
              ...m,
              status: novoStatus,
              dataExecucao: novoStatus === "concluida" ? dataAtual : m.dataExecucao,
              detalhes: detalhesExecucao ? detalhesExecucao.trim() : m.detalhes,
              responsavel: user.name,
            };
          }
          return m;
        })
      );

      // Se for concluída, grava no Histórico de Intervenções imutável
      if (novoStatus === "concluida") {
        const intervencaoConcluida: Manutencao = {
          ...manutencao,
          status: "concluida",
          dataExecucao: dataAtual,
          detalhes: detalhesExecucao ? detalhesExecucao.trim() : manutencao.detalhes,
          responsavel: user.name,
        };

        setHistoricoIntervencoes((prev) => [intervencaoConcluida, ...prev]);

        addLog(`Concluiu a manutenção preventiva ${id} para o ativo ${manutencao.ativoDescricao}`, "manutencao");

        addNotification(
          "Manutenção Preventiva Concluída",
          `Revisão ${id} do equipamento "${manutencao.ativoDescricao}" finalizada com sucesso.`,
          "success",
          "logistica"
        );
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [manutencoes, user, addNotification]
  );

  // Excluir Manutenção (Apenas agendadas/canceladas, impede de concluídas)
  const removerManutencao = useCallback(
    (id: string) => {
      setError(null);

      if (!verificarPrivilegio()) {
        setError("Apenas administradores ou gestores de logística podem remover manutenções.");
        return false;
      }

      const manutencao = manutencoes.find((m) => m.id === id);
      if (!manutencao) {
        setError("Manutenção não encontrada.");
        return false;
      }

      // Impede a exclusão de históricos finalizados
      if (manutencao.status === "concluida") {
        setError("Não é permitido excluir logs de intervenções concluídas (histórico blindado).");
        return false;
      }

      setManutencoes((prev) => prev.filter((m) => m.id !== id));
      addLog(`Removeu o agendamento de manutenção preventiva ${id}`, "manutencao");
      addNotification(
        "Agendamento de Manutenção Removido",
        `O agendamento da manutenção ${id} foi excluído do cronograma de controle.`,
        "warning",
        "logistica"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [manutencoes, addNotification, verificarPrivilegio]
  );

  return {
    manutencoes,
    historicoIntervencoes,
    error,
    setError,
    agendarManutencao,
    editarAgendamento,
    atualizarStatusManutencao,
    removerManutencao,
    verificarPrivilegio,
  };
}
