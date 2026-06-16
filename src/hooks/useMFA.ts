"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface LogAcesso {
  id: string;
  timestamp: string;
  usuario: string;
  email: string;
  tipo: "MFA_VALIDACAO" | "CONEXAO" | "DERRUBADA";
  dispositivo: string;
  metodo: string;
  status: "Sucesso" | "Falha" | "Ativa" | "Derrubada";
}

export function useMFA() {
  const { user } = useAuth();
  const [mfaMethod, setMfaMethod] = useState<string>("email");
  const [loginSimuladoAtivo, setLoginSimuladoAtivo] = useState(false);
  const [codigoSecreto, setCodigoSecreto] = useState<string>("");
  const [historicoAcessos, setHistoricoAcessos] = useState<LogAcesso[]>([]);

  // Carregar configurações de MFA e logs do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMethod = localStorage.getItem(`erp_mfa_method_${user.email}`);
      if (savedMethod) {
        setMfaMethod(savedMethod);
      } else {
        localStorage.setItem(`erp_mfa_method_${user.email}`, "email");
      }

      const savedAcessos = localStorage.getItem("erp_historico_acessos");
      if (savedAcessos) {
        try {
          setHistoricoAcessos(JSON.parse(savedAcessos));
        } catch (e) {
          setHistoricoAcessos([]);
        }
      }
    }
  }, [user.email]);

  const alterarMetodoMFA = (metodo: string) => {
    setMfaMethod(metodo);
    localStorage.setItem(`erp_mfa_method_${user.email}`, metodo);
  };

  const iniciarLoginSimulado = () => {
    // Gerar código de 6 dígitos secreto e oculto
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoSecreto(code);
    setLoginSimuladoAtivo(true);
  };

  const cancelarLoginSimulado = () => {
    setLoginSimuladoAtivo(false);
    setCodigoSecreto("");
  };

  const registrarLogAcesso = (
    tipo: LogAcesso["tipo"],
    metodo: string,
    status: LogAcesso["status"],
    dispositivo: string = "Chrome / Windows 11"
  ) => {
    const novoLog: LogAcesso = {
      id: `ACS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(), // Processado internamente
      usuario: user.name, // Recupera o Usuário Vinculado
      email: user.email,
      tipo,
      dispositivo,
      metodo,
      status,
    };

    const updatedLogs = [novoLog, ...historicoAcessos];
    setHistoricoAcessos(updatedLogs);
    localStorage.setItem("erp_historico_acessos", JSON.stringify(updatedLogs));

    // Se o login foi um sucesso, vamos registrar uma sessão ativa também!
    if (tipo === "MFA_VALIDACAO" && status === "Sucesso") {
      const novaSessao = {
        id: `SES-${Date.now()}`, // ID da Sessão imutável
        dispositivo,
        usuario: user.name,
        email: user.email,
        status: "Ativa",
        dataConexao: new Date().toISOString(),
        dataEncerramento: null,
      };

      const savedSessoes = localStorage.getItem("erp_sessoes_ativas") || "[]";
      try {
        const sessoes = JSON.parse(savedSessoes);
        sessoes.unshift(novaSessao);
        localStorage.setItem("erp_sessoes_ativas", JSON.stringify(sessoes));
      } catch (e) {
        localStorage.setItem("erp_sessoes_ativas", JSON.stringify([novaSessao]));
      }
    }

    // Disparar evento de storage para sincronizar outras abas de sessões
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
  };

  const validarCodigoMFA = (codigo: string, dispositivo: string = "Chrome / Windows 11"): boolean => {
    if (codigo === codigoSecreto) {
      registrarLogAcesso("MFA_VALIDACAO", mfaMethod, "Sucesso", dispositivo);
      setLoginSimuladoAtivo(false);
      setCodigoSecreto("");
      return true;
    } else {
      registrarLogAcesso("MFA_VALIDACAO", mfaMethod, "Falha", dispositivo);
      return false;
    }
  };

  return {
    mfaMethod,
    alterarMetodoMFA,
    loginSimuladoAtivo,
    codigoSecreto,
    iniciarLoginSimulado,
    cancelarLoginSimulado,
    validarCodigoMFA,
    historicoAcessos,
  };
}
