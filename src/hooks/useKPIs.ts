"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";
import { useVendas } from "./useVendas";
import { useEstoque } from "./useEstoque";

export interface KPIHistorico {
  data: string;
  valor: number;
}

export interface KPIIndicador {
  idIndicador: string;
  nomeKPI: string;
  areaVinculada: "Vendas" | "Financeiro" | "Estoque" | "Logística" | "Produção";
  formulaCalculo: string;
  resultadoAtual: number;
  dataAtualizacao: string;
  historicoMetricas: KPIHistorico[];
}

const mockKPIsIniciais: KPIIndicador[] = [
  {
    idIndicador: "KPI-2026-001",
    nomeKPI: "Ticket Médio de Vendas",
    areaVinculada: "Vendas",
    formulaCalculo: "Faturamento / Qtd Vendas",
    resultadoAtual: 1495.2,
    dataAtualizacao: "2026-06-14T18:00:00.000Z",
    historicoMetricas: [
      { data: "2026-06-10", valor: 1420.0 },
      { data: "2026-06-12", valor: 1450.5 },
      { data: "2026-06-14", valor: 1495.2 },
    ],
  },
  {
    idIndicador: "KPI-2026-002",
    nomeKPI: "Giro de Estoque Médio",
    areaVinculada: "Estoque",
    formulaCalculo: "Unidades Vendidas / Total em Estoque",
    resultadoAtual: 28.5,
    dataAtualizacao: "2026-06-14T18:00:00.000Z",
    historicoMetricas: [
      { data: "2026-06-10", valor: 26.0 },
      { data: "2026-06-12", valor: 27.2 },
      { data: "2026-06-14", valor: 28.5 },
    ],
  },
  {
    idIndicador: "KPI-2026-003",
    nomeKPI: "Margem de Contribuição Geral",
    areaVinculada: "Financeiro",
    formulaCalculo: "(Faturamento - Custos) / Faturamento * 100",
    resultadoAtual: 48.0,
    dataAtualizacao: "2026-06-14T18:00:00.000Z",
    historicoMetricas: [
      { data: "2026-06-10", valor: 45.0 },
      { data: "2026-06-12", valor: 47.0 },
      { data: "2026-06-14", valor: 48.0 },
    ],
  },
];

export function useKPIs() {
  const { addLog } = useLogs();
  const { vendas } = useVendas();
  const { estoque } = useEstoque();

  const [kpis, setKpis] = useState<KPIIndicador[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_kpi_indicadores");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar KPIs:", e);
        }
      }
    }
    return mockKPIsIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  const calcularKPIResultado = useCallback((
    nome: string,
    formula: string,
    area: string
  ): number => {
    const confirmedSales = vendas.filter((v) => v.status === "confirmado");
    const faturamentoTotal = confirmedSales.reduce((acc, v) => acc + v.valorTotal, 0);
    const qtdVendas = confirmedSales.length;

    const itensAtivos = estoque.filter((item) => item.status === "ativo");
    const totalItensQtd = itensAtivos.reduce((acc, item) => acc + item.quantidade, 0);

    const lowercaseNome = nome.toLowerCase();
    const lowercaseFormula = formula.toLowerCase();

    // 1. Ticket Médio
    if (lowercaseNome.includes("ticket") || lowercaseFormula.includes("faturamento / qtd")) {
      return qtdVendas > 0 ? Math.round((faturamentoTotal / qtdVendas) * 100) / 100 : 0;
    }

    // 2. Giro de Estoque
    if (lowercaseNome.includes("giro") || lowercaseFormula.includes("estoque")) {
      const totalVendidas = confirmedSales.reduce((acc, v) => acc + v.itens, 0);
      const totalBase = totalVendidas + totalItensQtd;
      return totalBase > 0 ? Math.round((totalVendidas / totalBase) * 100 * 10) / 10 : 25.0; // default simulation fallback
    }

    // 3. Faturamento Total
    if (lowercaseNome.includes("faturamento") || lowercaseFormula.includes("faturamento")) {
      return Math.round(faturamentoTotal * 100) / 100;
    }

    // 4. Lucro / Margem
    if (lowercaseNome.includes("margem") || lowercaseNome.includes("lucro") || lowercaseFormula.includes("margem")) {
      // Cost simulation
      const totalCusto = itensAtivos.reduce((acc, item) => acc + item.quantidade * item.precoCusto, 0) || 5000;
      const margem = faturamentoTotal > 0 ? ((faturamentoTotal - totalCusto) / faturamentoTotal) * 100 : 45.0;
      return Math.round(Math.max(0, margem) * 10) / 10;
    }

    // 5. Eficiência de Logística ou Produção
    if (area === "Logística" || area === "Produção") {
      return 88.5; // Simulate score
    }

    // Default simulation fallback
    return 65.4;
  }, [vendas, estoque]);

  // Recalcular KPIs automaticamente quando bancos mudarem
  const recalcularKPIs = useCallback((kpisLista: KPIIndicador[]): KPIIndicador[] => {
    const dataAtualString = new Date().toLocaleDateString("pt-BR");

    return kpisLista.map((kpi) => {
      const novoResultado = calcularKPIResultado(kpi.nomeKPI, kpi.formulaCalculo, kpi.areaVinculada);

      if (novoResultado !== kpi.resultadoAtual) {
        // Se mudou, atualiza resultado e adiciona ao histórico
        const novoHistorico = [...kpi.historicoMetricas];
        
        // Evitar duplicar no mesmo dia
        const indexMesmoDia = novoHistorico.findIndex((h) => h.data === dataAtualString);
        if (indexMesmoDia !== -1) {
          novoHistorico[indexMesmoDia].valor = novoResultado;
        } else {
          novoHistorico.push({ data: dataAtualString, valor: novoResultado });
        }

        // Cap hist at last 10 entries
        if (novoHistorico.length > 10) {
          novoHistorico.shift();
        }

        return {
          ...kpi,
          resultadoAtual: novoResultado,
          dataAtualizacao: new Date().toISOString(),
          historicoMetricas: novoHistorico,
        };
      }
      return kpi;
    });
  }, [calcularKPIResultado]);

  // Sincronizar e recalcular
  useEffect(() => {
    const listRecalculada = recalcularKPIs(kpis);
    const hasChanges = JSON.stringify(listRecalculada) !== JSON.stringify(kpis);
    if (hasChanges) {
      setKpis(listRecalculada);
      localStorage.setItem("erp_kpi_indicadores", JSON.stringify(listRecalculada));
    }
  }, [vendas, estoque, recalcularKPIs, kpis]);

  const adicionarKPI = (
    nomeKPI: string,
    areaVinculada: KPIIndicador["areaVinculada"],
    formulaCalculo: string
  ): boolean => {
    setError(null);

    if (!nomeKPI || !areaVinculada || !formulaCalculo) {
      setError("Por favor, preencha todos os campos obrigatórios (Nome, Área Vinculada e Fórmula).");
      return false;
    }

    const idIndicador = `KPI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
    const dataAtual = new Date().toISOString();
    const dataAtualString = new Date().toLocaleDateString("pt-BR");
    
    const resultadoAtual = calcularKPIResultado(nomeKPI, formulaCalculo, areaVinculada);

    const novoKPI: KPIIndicador = {
      idIndicador,
      nomeKPI,
      areaVinculada,
      formulaCalculo,
      resultadoAtual,
      dataAtualizacao: dataAtual,
      historicoMetricas: [{ data: dataAtualString, valor: resultadoAtual }],
    };

    setKpis((prev) => [novoKPI, ...prev]);
    addLog(`Cadastrou novo indicador KPI '${nomeKPI}' (Área: ${areaVinculada}). ID: ${idIndicador}`, "relatorios");

    return true;
  };

  const removerKPI = (id: string) => {
    setKpis((prev) => prev.filter((k) => k.idIndicador !== id));
    addLog(`Removeu indicador KPI ID: ${id}`, "relatorios");
  };

  return {
    kpis,
    error,
    setError,
    adicionarKPI,
    removerKPI,
  };
}
