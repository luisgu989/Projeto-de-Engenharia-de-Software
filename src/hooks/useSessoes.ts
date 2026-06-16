"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface SessaoUsuario {
  id: string; // ID da Sessão imutável
  dispositivo: string; // Dispositivo Identificado
  usuario: string; // Usuário Vinculado (Nome)
  email: string; // Usuário Vinculado (Email)
  status: "Ativa" | "Encerrada"; // Status da Sessão
  dataConexao: string; // Data de Conexão
  dataEncerramento: string | null; // Data de Encerramento
}

const SESSOES_INICIAIS: SessaoUsuario[] = [
  {
    id: "SES-9001",
    dispositivo: "Chrome 125 / Windows 11",
    usuario: "Usuário Suporte",
    email: "admin@erppro.com",
    status: "Ativa",
    dataConexao: new Date(Date.now() - 3600000 * 4).toISOString(),
    dataEncerramento: null,
  },
  {
    id: "SES-9002",
    dispositivo: "Safari / iPhone 15",
    usuario: "Maria Santos",
    email: "maria.santos@erppro.com",
    status: "Ativa",
    dataConexao: new Date(Date.now() - 3600000 * 2).toISOString(),
    dataEncerramento: null,
  },
  {
    id: "SES-9003",
    dispositivo: "Firefox / macOS Sonoma",
    usuario: "João da Silva",
    email: "joao.silva@erppro.com",
    status: "Ativa",
    dataConexao: new Date(Date.now() - 3600000 * 8).toISOString(),
    dataEncerramento: null,
  },
];

export function useSessoes() {
  const { user } = useAuth();
  const [sessoes, setSessoes] = useState<SessaoUsuario[]>([]);
  const [historicoAcessos, setHistoricoAcessos] = useState<any[]>([]);

  // Carregar dados de sessões e histórico de acessos
  const loadData = () => {
    if (typeof window !== "undefined") {
      const savedSessoes = localStorage.getItem("erp_sessoes_ativas");
      const savedAcessos = localStorage.getItem("erp_historico_acessos");

      if (savedSessoes) {
        try {
          setSessoes(JSON.parse(savedSessoes));
        } catch (e) {
          setSessoes(SESSOES_INICIAIS);
        }
      } else {
        setSessoes(SESSOES_INICIAIS);
        localStorage.setItem("erp_sessoes_ativas", JSON.stringify(SESSOES_INICIAIS));
      }

      if (savedAcessos) {
        try {
          setHistoricoAcessos(JSON.parse(savedAcessos));
        } catch (e) {
          setHistoricoAcessos([]);
        }
      }
    }
  };

  useEffect(() => {
    loadData();

    // Sincronizar em tempo real quando alterado em outro hook
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  const encerrarSessao = (sessaoId: string) => {
    const timestamp = new Date().toISOString(); // Processa automaticamente Data de Encerramento

    const sessoesAtualizadas = sessoes.map((s) => {
      if (s.id === sessaoId) {
        return {
          ...s,
          status: "Encerrada" as const, // Atualiza status
          dataEncerramento: timestamp,
        };
      }
      return s;
    });

    setSessoes(sessoesAtualizadas);
    localStorage.setItem("erp_sessoes_ativas", JSON.stringify(sessoesAtualizadas));

    // Encontrar a sessão derrubada para registrar no histórico de acessos
    const sessaoDerrubada = sessoes.find((s) => s.id === sessaoId);
    if (sessaoDerrubada) {
      const novoLogAcesso = {
        id: `ACS-OUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp,
        usuario: sessaoDerrubada.usuario,
        email: sessaoDerrubada.email,
        tipo: "DERRUBADA",
        dispositivo: sessaoDerrubada.dispositivo,
        metodo: "-",
        status: "Derrubada",
      };

      const acessosAtualizados = [novoLogAcesso, ...historicoAcessos];
      setHistoricoAcessos(acessosAtualizados);
      localStorage.setItem("erp_historico_acessos", JSON.stringify(acessosAtualizados));
    }

    // Disparar evento para outras abas/componentes
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
  };

  return {
    sessoes,
    historicoAcessos,
    encerrarSessao,
  };
}
