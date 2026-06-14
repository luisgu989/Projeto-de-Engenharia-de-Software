"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";

export interface SystemLog {
  id: string;
  timestamp: string;
  usuario: string;
  email: string;
  acao: string;
  categoria: "estoque" | "funcionarios" | "seguranca" | "relatorios" | "vendas" | "financeiro";
  detalhes?: string;
}

interface LogsContextType {
  logs: SystemLog[];
  addLog: (acao: string, categoria: SystemLog["categoria"], detalhes?: string) => void;
  clearLogs: () => void;
}

const LogsContext = createContext<LogsContextType | undefined>(undefined);

const mockLogsIniciais: SystemLog[] = [
  {
    id: "LOG-1718384400000-01",
    timestamp: "2026-06-14T10:30:00.000Z",
    usuario: "Usuário Suporte",
    email: "admin@erppro.com",
    acao: "Login efetuado com sucesso no sistema",
    categoria: "seguranca"
  },
  {
    id: "LOG-1716215400000-02",
    timestamp: "2026-05-20T14:30:00.000Z",
    usuario: "Luís Fernando",
    email: "luis.fernando@erppro.com",
    acao: "Registrou saída de 5 un. de Teclado Mecânico RGB Pro - Motivo: Venda cupom #8832",
    categoria: "estoque"
  },
  {
    id: "LOG-1716048000000-03",
    timestamp: "2026-05-18T16:00:00.000Z",
    usuario: "Usuário Suporte",
    email: "admin@erppro.com",
    acao: "Registrou saída de 2 un. de Mouse Gamer Sem Fio 16000DPI - Motivo: Uso interno TI",
    categoria: "estoque"
  },
  {
    id: "LOG-1715855400000-04",
    timestamp: "2026-05-16T10:30:00.000Z",
    usuario: "Luís Fernando",
    email: "luis.fernando@erppro.com",
    acao: "Cadastrou o produto Mouse Gamer Sem Fio 16000DPI (SKU: PRD-MOU-002)",
    categoria: "estoque"
  },
  {
    id: "LOG-1715763600000-05",
    timestamp: "2026-05-15T09:00:00.000Z",
    usuario: "Renata Souza",
    email: "renata.souza@erppro.com",
    acao: "Cadastrou o produto Teclado Mecânico RGB Pro (SKU: PRD-TEC-001)",
    categoria: "estoque"
  }
];

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SystemLog[]>(mockLogsIniciais);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load logs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("erp_logs");
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar logs de auditoria:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save logs to localStorage when changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_logs", JSON.stringify(logs));
    }
  }, [logs, isLoaded]);

  const addLog = (acao: string, categoria: SystemLog["categoria"], detalhes?: string) => {
    const newLog: SystemLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      usuario: user?.name || "Sistema",
      email: user?.email || "sistema@erppro.com",
      acao,
      categoria,
      detalhes
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <LogsContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogsContext);
  if (context === undefined) {
    throw new Error("useLogs deve ser usado dentro de um LogsProvider");
  }
  return context;
}
