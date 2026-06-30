"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface HistoricoAlteracaoFinanceira {
  id: string;
  codigoAuditoria: string;
  registroFinanceiro: string; // ID do lançamento (Ex: LAN-001)
  usuarioResponsavel: string;
  tipoAlteracao: "Edição de Valor" | "Alteração de Status" | "Mudança de Categoria";
  valorAnterior: string;
  valorAtualizado: string;
  dataAlteracao: string;
}

const mockAuditoriaIniciais: HistoricoAlteracaoFinanceira[] = [
  {
    id: "AUD-FIN-881203",
    codigoAuditoria: "AUD-COD-99A1",
    registroFinanceiro: "LAN-001",
    usuarioResponsavel: "Maria Santos",
    tipoAlteracao: "Edição de Valor",
    valorAnterior: "R$ 1.500,00",
    valorAtualizado: "R$ 1.800,00",
    dataAlteracao: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "AUD-FIN-203194",
    codigoAuditoria: "AUD-COD-12B2",
    registroFinanceiro: "LAN-002",
    usuarioResponsavel: "Usuário Suporte",
    tipoAlteracao: "Alteração de Status",
    valorAnterior: "Pendente",
    valorAtualizado: "Pago",
    dataAlteracao: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

export function useHistoricoAlteracoesFinanceiras() {
  const { user } = useAuth();
  const { addLog } = useLogs();

  const [logs, setLogs] = useState<HistoricoAlteracaoFinanceira[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_alteracoes_financeiras");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico financeiro:", e);
        }
      }
    }
    return mockAuditoriaIniciais;
  });

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_historico_alteracoes_financeiras", JSON.stringify(logs));
  }, [logs]);

  // Sync entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_historico_alteracoes_financeiras");
      if (saved) {
        try { setLogs(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar acesso de auditoria (Contador ou Admin)
  const verificarAcessoAuditoria = useCallback(() => {
    const cargo = user.cargo?.toLowerCase() || "";
    return (
      user.role === "admin" ||
      cargo.includes("contabil") ||
      cargo.includes("contador") ||
      cargo.includes("financeiro") ||
      user.permissions.visualizarFinanceiro
    );
  }, [user]);

  // Registrar alteração financeira de forma autônoma
  const registrarAlteracaoFinanceira = useCallback(
    (
      registroFinanceiro: string,
      tipoAlteracao: HistoricoAlteracaoFinanceira["tipoAlteracao"],
      valorAnterior: string,
      valorAtualizado: string
    ) => {
      if (!registroFinanceiro.trim() || !valorAnterior.trim() || !valorAtualizado.trim()) {
        return false;
      }

      const id = `AUD-FIN-${Math.floor(100000 + Math.random() * 900000)}`;
      const codigoAuditoria = `AUD-COD-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;
      const dataAtual = new Date().toISOString();

      const novoLog: HistoricoAlteracaoFinanceira = {
        id,
        codigoAuditoria,
        registroFinanceiro: registroFinanceiro.trim(),
        usuarioResponsavel: user.name, // Vinculado ao usuário autenticado
        tipoAlteracao,
        valorAnterior: valorAnterior.trim(), // Imutável para garantir integridade
        valorAtualizado: valorAtualizado.trim(),
        dataAlteracao: dataAtual,
      };

      setLogs((prev) => [novoLog, ...prev]);

      addLog(`Registrou alteração financeira no registro ${registroFinanceiro}`, "financeiro");

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [user]
  );

  return {
    logs,
    registrarAlteracaoFinanceira,
    verificarAcessoAuditoria,
  };
}
