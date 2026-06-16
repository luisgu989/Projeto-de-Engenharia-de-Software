"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface ConsentimentoLGPD {
  id: string; // ID do Consentimento imutável
  tipoConsentimento: string; // Tipo de Consentimento
  usuario: string; // Usuário Vinculado (Nome)
  email: string; // Usuário Vinculado (Email)
  status: "Concedido" | "Revogado"; // Status do Consentimento
  dataConcessao: string; // Data da Concessão
  dataRevogacao: string | null; // Data da Revogação
}

export interface LogAlteracaoLGPD {
  id: string;
  timestamp: string;
  usuario: string;
  email: string;
  consentimentoId: string;
  tipoConsentimento: string;
  acao: string;
  statusAnterior: "Concedido" | "Revogado";
  statusNovo: "Concedido" | "Revogado";
}

const CATEGORIAS_CONSENTIMENTO = [
  "Termos de Uso Gerais do ERP",
  "Política de Privacidade & Proteção de Dados",
  "Cookies e Rastreamento de Telemetria",
  "Envio de Comunicados e Campanhas de Marketing",
  "Compartilhamento com Parceiros de Cobrança (Faturamento)",
];

const getConsentimentosIniciais = (nome: string, email: string): ConsentimentoLGPD[] => {
  return CATEGORIAS_CONSENTIMENTO.map((cat, idx) => ({
    id: `CNS-LGPD-00${idx + 1}`, // ID do Consentimento imutável
    tipoConsentimento: cat,
    usuario: nome,
    email: email,
    status: "Concedido",
    dataConcessao: new Date(Date.now() - 3600000 * 24 * 10).toISOString(), // 10 dias atrás
    dataRevogacao: null,
  }));
};

const ALTERACOES_INICIAIS: LogAlteracaoLGPD[] = [
  {
    id: "ALT-LGPD-1001",
    timestamp: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    usuario: "Usuário Suporte",
    email: "admin@erppro.com",
    consentimentoId: "CNS-LGPD-001",
    tipoConsentimento: "Termos de Uso Gerais do ERP",
    acao: "Consentimento concedido na ativação inicial da conta.",
    statusAnterior: "Revogado",
    statusNovo: "Concedido",
  },
];

export function useLGPD() {
  const { user } = useAuth();
  const [consentimentos, setConsentimentos] = useState<ConsentimentoLGPD[]>([]);
  const [historicoAlteracoes, setHistoricoAlteracoes] = useState<LogAlteracaoLGPD[]>([]);

  // Carregar dados e logs de consentimento
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConsentimentos = localStorage.getItem(`erp_lgpd_consentimentos_${user.email}`);
      const savedAlteracoes = localStorage.getItem("erp_lgpd_alteracoes");

      if (savedConsentimentos) {
        try {
          setConsentimentos(JSON.parse(savedConsentimentos));
        } catch (e) {
          setConsentimentos(getConsentimentosIniciais(user.name, user.email));
        }
      } else {
        const iniciais = getConsentimentosIniciais(user.name, user.email);
        setConsentimentos(iniciais);
        localStorage.setItem(`erp_lgpd_consentimentos_${user.email}`, JSON.stringify(iniciais));
      }

      if (savedAlteracoes) {
        try {
          setHistoricoAlteracoes(JSON.parse(savedAlteracoes));
        } catch (e) {
          setHistoricoAlteracoes(ALTERACOES_INICIAIS);
        }
      } else {
        setHistoricoAlteracoes(ALTERACOES_INICIAIS);
        localStorage.setItem("erp_lgpd_alteracoes", JSON.stringify(ALTERACOES_INICIAIS));
      }
    }
  }, [user.email, user.name]);

  const alterarStatusConsentimento = (consentimentoId: string, novoStatus: "Concedido" | "Revogado") => {
    const timestamp = new Date().toISOString(); // Processa internamente e automaticamente timestamps

    const consentimentosAtualizados = consentimentos.map((c) => {
      if (c.id === consentimentoId) {
        return {
          ...c,
          status: novoStatus, // Atualiza status
          dataConcessao: novoStatus === "Concedido" ? timestamp : c.dataConcessao,
          dataRevogacao: novoStatus === "Revogado" ? timestamp : null, // timestamps controlados
        };
      }
      return c;
    });

    setConsentimentos(consentimentosAtualizados);
    localStorage.setItem(`erp_lgpd_consentimentos_${user.email}`, JSON.stringify(consentimentosAtualizados));

    const consentimentoModificado = consentimentos.find((c) => c.id === consentimentoId);
    if (consentimentoModificado) {
      const novaAlteracao: LogAlteracaoLGPD = {
        id: `ALT-LGPD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp,
        usuario: user.name, // Vincula o usuário logado
        email: user.email,
        consentimentoId,
        tipoConsentimento: consentimentoModificado.tipoConsentimento,
        acao: novoStatus === "Concedido"
          ? `Consentimento concedido para a categoria "${consentimentoModificado.tipoConsentimento}".`
          : `Consentimento revogado/cancelado para a categoria "${consentimentoModificado.tipoConsentimento}".`,
        statusAnterior: consentimentoModificado.status,
        statusNovo: novoStatus,
      };

      const alteracoesAtualizadas = [novaAlteracao, ...historicoAlteracoes];
      setHistoricoAlteracoes(alteracoesAtualizadas);
      localStorage.setItem("erp_lgpd_alteracoes", JSON.stringify(alteracoesAtualizadas));
    }
  };

  return {
    consentimentos,
    historicoAlteracoes,
    alterarStatusConsentimento,
  };
}
