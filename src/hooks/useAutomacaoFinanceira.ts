"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useLogs } from "@/contexts/logs-context";

export interface RotinaFinanceira {
  id: string;
  codigoRotina: string;
  tipoOperacao: "Pagamento" | "Recebimento" | "Transferência" | "Conciliação";
  frequencia: "Diária" | "Semanal" | "Mensal" | "Anual";
  status: "ativa" | "inativa";
  resultadoUltimaExecucao: "Sucesso" | "Falha" | "Pendente";
  dataExecucao: string;
  responsavel: string;
}

export interface ProcessamentoFinanceiro {
  id: string;
  rotinaId: string;
  codigoRotina: string;
  tipoOperacao: string;
  frequencia: string;
  resultado: "Sucesso" | "Falha";
  dataExecucao: string;
  responsavel: string;
  detalhes: string;
}

export const CATEGORIAS_FINANCEIRAS = [
  "Pagamento",
  "Recebimento",
  "Transferência",
  "Conciliação",
];

export const FREQUENCIAS_FINANCEIRAS = [
  "Diária",
  "Semanal",
  "Mensal",
  "Anual",
];

const mockRotinasIniciais: RotinaFinanceira[] = [
  {
    id: "ROT-FIN-301",
    codigoRotina: "ROT-PAG-FOLHA",
    tipoOperacao: "Pagamento",
    frequencia: "Mensal",
    status: "ativa",
    resultadoUltimaExecucao: "Sucesso",
    dataExecucao: "2026-06-05T08:00:00.000Z",
    responsavel: "Usuário Suporte",
  },
  {
    id: "ROT-FIN-302",
    codigoRotina: "ROT-CONC-DIARIA",
    tipoOperacao: "Conciliação",
    frequencia: "Diária",
    status: "ativa",
    resultadoUltimaExecucao: "Sucesso",
    dataExecucao: "2026-06-16T17:45:00.000Z",
    responsavel: "Maria Santos",
  },
];

export function useAutomacaoFinanceira() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addNotification } = useNotifications();

  const [rotinas, setRotinas] = useState<RotinaFinanceira[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_rotinas_financeiras");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar rotinas financeiras:", e);
        }
      }
    }
    return mockRotinasIniciais;
  });

  const [historicoProcessamentos, setHistoricoProcessamentos] = useState<ProcessamentoFinanceiro[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_processamentos_financeiros");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico financeiro:", e);
        }
      }
    }
    return [];
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_rotinas_financeiras", JSON.stringify(rotinas));
  }, [rotinas]);

  useEffect(() => {
    localStorage.setItem("erp_historico_processamentos_financeiros", JSON.stringify(historicoProcessamentos));
  }, [historicoProcessamentos]);

  // Sincronizar entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const savedRotinas = localStorage.getItem("erp_rotinas_financeiras");
      const savedHist = localStorage.getItem("erp_historico_processamentos_financeiros");
      if (savedRotinas) {
        try { setRotinas(JSON.parse(savedRotinas)); } catch (e) {}
      }
      if (savedHist) {
        try { setHistoricoProcessamentos(JSON.parse(savedHist)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar permissão contábil (role admin, cargo contábil ou financeiro)
  const verificarAcessoContador = useCallback(() => {
    const cargo = user.cargo?.toLowerCase() || "";
    return (
      user.role === "admin" ||
      cargo.includes("contabil") ||
      cargo.includes("contador") ||
      cargo.includes("analista") ||
      cargo.includes("financeiro") ||
      user.permissions.visualizarFinanceiro
    );
  }, [user]);

  // Verificar duplicidade de código de rotina
  const checkDuplicateCodigo = useCallback(
    (codigo: string, excludeId?: string) => {
      const cleaned = codigo.trim().toUpperCase();
      if (!cleaned) return false;
      return rotinas.some((r) => r.id !== excludeId && r.codigoRotina.trim().toUpperCase() === cleaned);
    },
    [rotinas]
  );

  // Cadastrar Rotina Financeira
  const cadastrarRotina = useCallback(
    (codigoRotina: string, tipoOperacao: RotinaFinanceira["tipoOperacao"], frequencia: RotinaFinanceira["frequencia"]) => {
      setError(null);

      if (!verificarAcessoContador()) {
        setError("Apenas contadores e administradores financeiros podem configurar rotinas recorrentes.");
        return false;
      }

      const cleanedCodigo = codigoRotina.trim().toUpperCase();
      if (!cleanedCodigo) {
        setError("O código da rotina é obrigatório.");
        return false;
      }

      if (checkDuplicateCodigo(cleanedCodigo)) {
        setError(`A rotina com código "${cleanedCodigo}" já está cadastrada.`);
        return false;
      }

      if (!CATEGORIAS_FINANCEIRAS.includes(tipoOperacao)) {
        setError("Tipo de operação financeira inválida.");
        return false;
      }

      if (!FREQUENCIAS_FINANCEIRAS.includes(frequencia)) {
        setError("Frequência de execução inválida.");
        return false;
      }

      const id = `ROT-FIN-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataAtual = new Date().toISOString();

      const novaRotina: RotinaFinanceira = {
        id,
        codigoRotina: cleanedCodigo,
        tipoOperacao,
        frequencia,
        status: "ativa",
        resultadoUltimaExecucao: "Pendente",
        dataExecucao: dataAtual,
        responsavel: user.name,
      };

      setRotinas((prev) => [...prev, novaRotina]);

      addLog(`Cadastrou rotina financeira ${cleanedCodigo}`, "financeiro");

      addNotification(
        "Rotina Financeira Criada",
        `Rotina de ${tipoOperacao} (${frequencia}) cadastrada sob o código ${cleanedCodigo}.`,
        "info",
        "gerente"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [rotinas, user, verificarAcessoContador, checkDuplicateCodigo, addNotification]
  );

  // Editar Rotina
  const editarRotina = useCallback(
    (
      id: string,
      novosDados: {
        tipoOperacao: RotinaFinanceira["tipoOperacao"];
        frequencia: RotinaFinanceira["frequencia"];
        status: RotinaFinanceira["status"];
      }
    ) => {
      setError(null);

      if (!verificarAcessoContador()) {
        setError("Apenas contadores e administradores de faturamento podem modificar rotinas.");
        return false;
      }

      const rotina = rotinas.find((r) => r.id === id);
      if (!rotina) {
        setError("Rotina não encontrada.");
        return false;
      }

      if (!CATEGORIAS_FINANCEIRAS.includes(novosDados.tipoOperacao)) {
        setError("Tipo de operação financeira inválida.");
        return false;
      }

      if (!FREQUENCIAS_FINANCEIRAS.includes(novosDados.frequencia)) {
        setError("Frequência de execução inválida.");
        return false;
      }

      const dataAtual = new Date().toISOString();

      setRotinas((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            // codigoRotina permanece completamente IMUTÁVEL
            return {
              ...r,
              tipoOperacao: novosDados.tipoOperacao,
              frequencia: novosDados.frequencia,
              status: novosDados.status,
              dataExecucao: dataAtual,
              responsavel: user.name,
            };
          }
          return r;
        })
      );

      addLog(`Editou a rotina financeira ${id}`, "financeiro");

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [rotinas, user, verificarAcessoContador]
  );

  // Simular processamento automático da rotina
  const executarRotina = useCallback(
    (id: string) => {
      setError(null);

      const rotina = rotinas.find((r) => r.id === id);
      if (!rotina) {
        setError("Rotina não encontrada.");
        return false;
      }

      if (rotina.status === "inativa") {
        setError("Não é possível processar uma rotina inativa.");
        return false;
      }

      const dataAtual = new Date().toISOString();

      // Simulação aleatória de sucesso/falha operacional (90% sucesso)
      const resultado: "Sucesso" | "Falha" = Math.random() > 0.1 ? "Sucesso" : "Falha";

      // Atualiza a rotina com o resultado
      setRotinas((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            return {
              ...r,
              resultadoUltimaExecucao: resultado,
              dataExecucao: dataAtual,
              responsavel: user.name,
            };
          }
          return r;
        })
      );

      // Grava histórico de processamento imutável (bloqueado de edições manuais)
      const novoProcessamento: ProcessamentoFinanceiro = {
        id: `PRC-FIN-${Math.floor(100000 + Math.random() * 900000)}`,
        rotinaId: id,
        codigoRotina: rotina.codigoRotina,
        tipoOperacao: rotina.tipoOperacao,
        frequencia: rotina.frequencia,
        resultado,
        dataExecucao: dataAtual,
        responsavel: user.name,
        detalhes: resultado === "Sucesso"
          ? `Execução periódica concluída com sucesso para a rotina contábil ${rotina.codigoRotina}.`
          : `Falha técnica no envio/processamento do lote da rotina contábil ${rotina.codigoRotina}.`,
      };

      setHistoricoProcessamentos((prev) => [novoProcessamento, ...prev]);

      addLog(`Executou rotina financeira ${rotina.codigoRotina} com resultado: ${resultado}`, "financeiro");

      addNotification(
        `Execução de Rotina Financeira: ${resultado}`,
        `A rotina contábil ${rotina.codigoRotina} foi executada. Resultado: ${resultado}`,
        resultado === "Sucesso" ? "success" : "error",
        "gerente"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [rotinas, user, addNotification]
  );

  // Remover Rotina (Apenas se não houver processamentos ativos ou se tiver permissão)
  const removerRotina = useCallback(
    (id: string) => {
      setError(null);

      if (!verificarAcessoContador()) {
        setError("Apenas administradores e contadores podem remover rotinas.");
        return false;
      }

      setRotinas((prev) => prev.filter((r) => r.id !== id));
      
      addLog(`Removeu a rotina financeira ${id}`, "financeiro");

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [verificarAcessoContador]
  );

  return {
    rotinas,
    historicoProcessamentos,
    error,
    setError,
    cadastrarRotina,
    editarRotina,
    executarRotina,
    removerRotina,
    verificarAcessoContador,
  };
}
