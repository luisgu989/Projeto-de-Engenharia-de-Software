"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useLogs } from "@/contexts/logs-context";

export interface HistoricoAprovacao {
  timestamp: string;
  acao: "criacao" | "aprovacao" | "rejeicao";
  usuario: string;
  justificativa: string;
}

export interface SolicitacaoInterna {
  id: string;
  codigoSolicitacao: string;
  tipoSolicitacao: "Material" | "Serviço" | "Acesso" | "Reembolso" | "Férias" | "Outros";
  solicitante: string;
  responsavelAprovacao: string;
  statusSolicitacao: "pendente" | "aprovada" | "rejeitada";
  dataSolicitacao: string;
  dataAprovacao: string;
  historicoAprovacoes: HistoricoAprovacao[];
}

export const CATEGORIAS_SOLICITACAO = [
  "Material",
  "Serviço",
  "Acesso",
  "Reembolso",
  "Férias",
  "Outros",
];

const mockSolicitacoesIniciais: SolicitacaoInterna[] = [
  {
    id: "SOL-104928",
    codigoSolicitacao: "REQ-2026-X881",
    tipoSolicitacao: "Material",
    solicitante: "Maria Santos",
    responsavelAprovacao: "Usuário Suporte",
    statusSolicitacao: "pendente",
    dataSolicitacao: new Date(Date.now() - 3600000 * 5).toISOString(),
    dataAprovacao: "",
    historicoAprovacoes: [
      {
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        acao: "criacao",
        usuario: "Maria Santos",
        justificativa: "Solicitação inicial de ressuprimento de bobinas térmicas para o setor financeiro.",
      }
    ]
  },
  {
    id: "SOL-991032",
    codigoSolicitacao: "REQ-2026-A223",
    tipoSolicitacao: "Acesso",
    solicitante: "João da Silva",
    responsavelAprovacao: "Usuário Suporte",
    statusSolicitacao: "aprovada",
    dataSolicitacao: new Date(Date.now() - 3600000 * 48).toISOString(),
    dataAprovacao: new Date(Date.now() - 3600000 * 46).toISOString(),
    historicoAprovacoes: [
      {
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        acao: "criacao",
        usuario: "João da Silva",
        justificativa: "Acesso temporário ao servidor de homologação para auditoria de TI.",
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 46).toISOString(),
        acao: "aprovacao",
        usuario: "Usuário Suporte",
        justificativa: "Aprovado após validação de credenciais de segurança.",
      }
    ]
  }
];

export function useSolicitacoesInternas() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addNotification } = useNotifications();

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoInterna[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_solicitacoes_internas");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar solicitacoes:", e);
        }
      }
    }
    return mockSolicitacoesIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_solicitacoes_internas", JSON.stringify(solicitacoes));
  }, [solicitacoes]);

  // Sync entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_solicitacoes_internas");
      if (saved) {
        try { setSolicitacoes(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar se usuário tem permissão para aprovar (Admin, Gerente ou Diretor)
  const verificarPermissaoAprovacao = useCallback(() => {
    const cargo = user.cargo?.toLowerCase() || "";
    return (
      user.role === "admin" ||
      cargo.includes("gerente") ||
      cargo.includes("diretor")
    );
  }, [user]);

  // Criar nova solicitação
  const criarSolicitacao = useCallback(
    (
      codigoSolicitacao: string,
      tipoSolicitacao: SolicitacaoInterna["tipoSolicitacao"],
      responsavelAprovacao: string,
      justificativa: string
    ) => {
      setError(null);

      const cleanedCodigo = codigoSolicitacao.trim().toUpperCase();
      if (!cleanedCodigo) {
        setError("O código da solicitação é obrigatório.");
        return false;
      }

      // Validação de duplicidade de código
      const jaExisteCodigo = solicitacoes.some(
        (s) => s.codigoSolicitacao.trim().toUpperCase() === cleanedCodigo
      );
      if (jaExisteCodigo) {
        setError(`O código "${cleanedCodigo}" já está cadastrado para outra solicitação.`);
        return false;
      }

      if (!CATEGORIAS_SOLICITACAO.includes(tipoSolicitacao)) {
        setError("Tipo de solicitação inválido.");
        return false;
      }

      if (!responsavelAprovacao.trim()) {
        setError("O responsável pela aprovação é obrigatório.");
        return false;
      }

      const id = `SOL-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataAtual = new Date().toISOString();

      const novaSolicitacao: SolicitacaoInterna = {
        id,
        codigoSolicitacao: cleanedCodigo,
        tipoSolicitacao,
        solicitante: user.name, // Vinculado ao usuário autenticado de forma imutável
        responsavelAprovacao: responsavelAprovacao.trim(),
        statusSolicitacao: "pendente",
        dataSolicitacao: dataAtual,
        dataAprovacao: "",
        historicoAprovacoes: [
          {
            timestamp: dataAtual,
            acao: "criacao",
            usuario: user.name,
            justificativa: justificativa.trim() || "Criação da solicitação administrativa interna.",
          },
        ],
      };

      setSolicitacoes((prev) => [novaSolicitacao, ...prev]);

      addNotification(
        "Solicitação Interna Criada",
        `Solicitação de ${tipoSolicitacao} (${cleanedCodigo}) aberta para o responsável ${responsavelAprovacao}.`,
        "info",
        "geral"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      addLog(`Criou nova solicitação interna ${cleanedCodigo}`, "sistema");

      return true;
    },
    [solicitacoes, user, addNotification]
  );

  // Decidir aprovação ou rejeição
  const decidirSolicitacao = useCallback(
    (id: string, acao: "aprovada" | "rejeitada", justificativa: string) => {
      setError(null);

      if (!verificarPermissaoAprovacao()) {
        setError("Apenas gerentes, diretores e administradores podem aprovar ou rejeitar solicitações.");
        return false;
      }

      const solicitacao = solicitacoes.find((s) => s.id === id);
      if (!solicitacao) {
        setError("Solicitação não encontrada.");
        return false;
      }

      // Impedir alterações manuais em solicitações concluídas ou já aprovadas
      if (solicitacao.statusSolicitacao !== "pendente") {
        setError("Esta solicitação já foi encerrada e não pode mais receber alterações.");
        return false;
      }

      if (!justificativa.trim()) {
        setError("A justificativa para a decisão é obrigatória.");
        return false;
      }

      const dataAtual = new Date().toISOString();
      const novoHistorico: HistoricoAprovacao = {
        timestamp: dataAtual,
        acao: acao === "aprovada" ? "aprovacao" : "rejeicao",
        usuario: user.name,
        justificativa: justificativa.trim(),
      };

      setSolicitacoes((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            return {
              ...s,
              statusSolicitacao: acao,
              dataAprovacao: dataAtual,
              historicoAprovacoes: [...s.historicoAprovacoes, novoHistorico],
            };
          }
          return s;
        })
      );

      addNotification(
        `Solicitação ${acao === "aprovada" ? "Aprovada" : "Rejeitada"}`,
        `O fluxo ${solicitacao.codigoSolicitacao} foi concluído com status ${acao.toUpperCase()} por ${user.name}.`,
        acao === "aprovada" ? "success" : "error",
        "geral"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      addLog(`Decidiu sobre a solicitação interna ${solicitacao.codigoSolicitacao}: ${acao}`, "sistema");

      return true;
    },
    [solicitacoes, user, verificarPermissaoAprovacao, addNotification]
  );

  return {
    solicitacoes,
    error,
    setError,
    criarSolicitacao,
    decidirSolicitacao,
    verificarPermissaoAprovacao,
  };
}
