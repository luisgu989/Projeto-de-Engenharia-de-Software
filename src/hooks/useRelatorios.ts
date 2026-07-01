"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface RelatorioGerado {
  id: string;
  tipo: string;
  modulo: string;
  periodo: string;
  usuarioSolicitante: string;
  dataGeracao: string;
  status: "processando" | "concluido";
  parametros: {
    tipoRelatorio: "giro" | "producao_demanda" | "margem_logistica" | "anomalias" | "comercial_crm" | "financeiro_contratos" | "rh_produtividade" | "suporte_ti" | "ativos_ti";
    dataInicio: string;
    dataFim: string;
    categoriaSel: string;
    valorMinimo: number;
  };
}

export function useRelatorios() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [relatorios, setRelatorios] = useState<RelatorioGerado[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_relatorios_gerados");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar relatórios:", e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("erp_relatorios_gerados", JSON.stringify(relatorios));
  }, [relatorios]);

  const gerarRelatorioRun = (
    tipo: "giro" | "producao_demanda" | "margem_logistica" | "anomalias" | "comercial_crm" | "financeiro_contratos" | "rh_produtividade" | "suporte_ti" | "ativos_ti",
    modulo: string,
    dataInicio: string,
    dataFim: string,
    categoriaSel: string,
    valorMinimo: number
  ) => {
    const reportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const dataAtual = new Date().toISOString();
    const periodo = `${dataInicio || "Início"} até ${dataFim || "Fim"}`;

    const mapNomes = {
      giro: "Giro de Estoque",
      producao_demanda: "Produção vs Demanda",
      margem_logistica: "Margens vs Fretes",
      anomalias: "Anomalias Detectadas",
      comercial_crm: "Desempenho Comercial & CRM",
      financeiro_contratos: "Saúde Financeira & Contratos",
      rh_produtividade: "Eficiência e Custo de Pessoal",
      suporte_ti: "Eficiência de Suporte (TI)",
      ativos_ti: "Gestão de Ativos e Manutenções",
    };

    const novoRelatorio: RelatorioGerado = {
      id: reportId,
      tipo: mapNomes[tipo],
      modulo,
      periodo,
      usuarioSolicitante: user?.name || "Usuário",
      dataGeracao: dataAtual,
      status: "processando",
      parametros: {
        tipoRelatorio: tipo,
        dataInicio,
        dataFim,
        categoriaSel,
        valorMinimo,
      },
    };

    setRelatorios((prev) => [novoRelatorio, ...prev]);
    addLog(`Solicitou a geração do relatório ${novoRelatorio.tipo} (Módulo: ${modulo})`, "relatorios");

    setTimeout(() => {
      setRelatorios((prev) =>
        prev.map((rep) =>
          rep.id === reportId ? { ...rep, status: "concluido" } : rep
        )
      );
      addLog(`Relatório ${novoRelatorio.tipo} (${reportId}) gerado com sucesso`, "relatorios");
    }, 1000);

    return reportId;
  };

  const limparHistorico = () => {
    setRelatorios([]);
    addLog("Limpou o histórico de relatórios gerados", "relatorios");
  };

  return {
    relatorios,
    gerarRelatorioRun,
    limparHistorico,
  };
}
