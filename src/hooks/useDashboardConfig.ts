"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface DashboardConfig {
  nomeDashboard: string;
  kpisAtivos: string[];
  widgetsAtivos: string[];
  periodoFiltro: string;
  usuarioResponsavel: string;
  ultimaAtualizacao: string;
}

const defaultConfig: DashboardConfig = {
  nomeDashboard: "Painel Principal",
  kpisAtivos: ["faturamento", "vendas", "estoque", "clientes"],
  widgetsAtivos: ["vendasRecentes", "statusSistema"],
  periodoFiltro: "30",
  usuarioResponsavel: "Sistema",
  ultimaAtualizacao: new Date().toISOString(),
};

export function useDashboardConfig() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("erp_dashboard_config");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar configuração do painel:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const salvarConfig = (novasConfigs: Omit<DashboardConfig, "usuarioResponsavel" | "ultimaAtualizacao">) => {
    const atualizado: DashboardConfig = {
      ...novasConfigs,
      usuarioResponsavel: user?.name || "Usuário",
      ultimaAtualizacao: new Date().toISOString(),
    };

    setConfig(atualizado);
    localStorage.setItem("erp_dashboard_config", JSON.stringify(atualizado));
    addLog(`Personalizou as configurações do painel "${novasConfigs.nomeDashboard}"`, "seguranca");
    return true;
  };

  const restaurarPadrao = () => {
    const padrao: DashboardConfig = {
      ...defaultConfig,
      usuarioResponsavel: user?.name || "Usuário",
      ultimaAtualizacao: new Date().toISOString(),
    };

    setConfig(padrao);
    localStorage.setItem("erp_dashboard_config", JSON.stringify(padrao));
    addLog("Restaurou as configurações padrão do painel", "seguranca");
    return true;
  };

  return {
    config,
    isLoaded,
    salvarConfig,
    restaurarPadrao,
  };
}
