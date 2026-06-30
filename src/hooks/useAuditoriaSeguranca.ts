"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface EventoAuditoria {
  id: string;
  tipoEvento: string;
  moduloAfetado: "Autenticação" | "Estoque" | "Financeiro" | "Logística" | "Produção" | "Documentos";
  statusEvento: "Sucesso" | "Alerta" | "Falha";
  enderecoAcesso: string;
  codigoRegistro: string;
  usuarioResponsavel: string;
  dataOcorrencia: string;
}

export const MODULOS_AUDITAVEIS = [
  "Autenticação",
  "Estoque",
  "Financeiro",
  "Logística",
  "Produção",
  "Documentos",
] as const;

const mockAuditoriaInicial: EventoAuditoria[] = [
  {
    id: "AUD-482019",
    tipoEvento: "Alteração de Chave Criptográfica",
    moduloAfetado: "Autenticação",
    statusEvento: "Alerta",
    enderecoAcesso: "192.168.1.100",
    codigoRegistro: "KEY-2026-X881",
    usuarioResponsavel: "Usuário Suporte",
    dataOcorrencia: new Date(Date.now() - 3600000 * 3).toISOString(), // 3h atrás
  },
  {
    id: "AUD-991032",
    tipoEvento: "Restauração de Versão de Documento",
    moduloAfetado: "Documentos",
    statusEvento: "Sucesso",
    enderecoAcesso: "192.168.1.105",
    codigoRegistro: "DOC-RESTORE-V2.0",
    usuarioResponsavel: "Usuário Suporte",
    dataOcorrencia: new Date(Date.now() - 3600000 * 24).toISOString(), // 24h atrás
  },
  {
    id: "AUD-104928",
    tipoEvento: "Exportação de Dados Financeiros",
    moduloAfetado: "Financeiro",
    statusEvento: "Sucesso",
    enderecoAcesso: "192.168.1.200",
    codigoRegistro: "EXP-FECH-VENDAS",
    usuarioResponsavel: "Maria Santos",
    dataOcorrencia: new Date(Date.now() - 3600000 * 48).toISOString(), // 48h atrás
  },
];

export function useAuditoriaSeguranca() {
  const { user } = useAuth();
  const { addLog } = useLogs();

  const [logs, setLogs] = useState<EventoAuditoria[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_auditoria_seguranca");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar auditoria de segurança:", e);
        }
      }
    }
    return mockAuditoriaInicial;
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_auditoria_seguranca", JSON.stringify(logs));
  }, [logs]);

  // Sync entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLogs = localStorage.getItem("erp_auditoria_seguranca");
      if (savedLogs) {
        try { setLogs(JSON.parse(savedLogs)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar permissões de segurança restrita (verLogsAuditoria)
  const verificarAcessoLeitura = useCallback(() => {
    return user.role === "admin" || user.permissions.verLogsAuditoria;
  }, [user]);

  // Registrar Evento de Auditoria de Segurança de Forma Autônoma
  const registrarEventoAuditoria = useCallback(
    (
      tipoEvento: string,
      moduloAfetado: EventoAuditoria["moduloAfetado"],
      statusEvento: EventoAuditoria["statusEvento"],
      enderecoAcesso: string,
      codigoRegistro: string
    ) => {
      setError(null);

      // Validação de segurança sobre parâmetros
      if (!tipoEvento.trim() || !enderecoAcesso.trim() || !codigoRegistro.trim()) {
        return false;
      }

      if (!MODULOS_AUDITAVEIS.includes(moduloAfetado)) {
        return false;
      }

      // Prevenir Código de Registro Duplicado no mesmo evento técnico
      const jaExisteCodigo = logs.some((l) => l.codigoRegistro === codigoRegistro && l.tipoEvento === tipoEvento);
      if (jaExisteCodigo) {
        return false;
      }

      const id = `AUD-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataAtual = new Date().toISOString();

      const novoLog: EventoAuditoria = {
        id,
        tipoEvento: tipoEvento.trim(),
        moduloAfetado,
        statusEvento,
        enderecoAcesso: enderecoAcesso.trim(),
        codigoRegistro: codigoRegistro.trim(),
        usuarioResponsavel: user.name || "Sistema",
        dataOcorrencia: dataAtual,
      };

      setLogs((prev) => [novoLog, ...prev]);

      addLog(`Registrou evento de auditoria ${id}: ${tipoEvento.trim()}`, "seguranca");

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [logs, user]
  );

  return {
    logs,
    error,
    setError,
    registrarEventoAuditoria,
    verificarAcessoLeitura,
  };
}
