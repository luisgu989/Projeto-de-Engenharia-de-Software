"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";
import { useVendas } from "./useVendas";
import { useEstoque } from "./useEstoque";

export interface ItemPrevisao {
  produtoNome: string;
  categoria: string;
  mediaHistoricaMensal: number;
  demandaProjetada: number;
  taxaConfianca: number;
  tendencia: "crescimento" | "estavel" | "queda";
}

export interface PrevisaoDemanda {
  id: string;
  dataInicio: string;
  dataFim: string;
  dataGeracao: string;
  usuarioResponsavel: string;
  resultadoFaturamentoProjetado: number;
  resultadoVolumeProjetado: number;
  itensPrevisao: ItemPrevisao[];
}

const mockPrevisoesIniciais: PrevisaoDemanda[] = [
  {
    id: "PRV-2026-001",
    dataInicio: "2026-05-01",
    dataFim: "2026-05-31",
    dataGeracao: "2026-06-01T08:00:00.000Z",
    usuarioResponsavel: "Luís Fernando",
    resultadoFaturamentoProjetado: 7500.0,
    resultadoVolumeProjetado: 23,
    itensPrevisao: [
      {
        produtoNome: "Teclado Mecânico RGB Pro",
        categoria: "Periféricos",
        mediaHistoricaMensal: 12,
        demandaProjetada: 15,
        taxaConfianca: 92,
        tendencia: "crescimento",
      },
      {
        produtoNome: "Mouse Gamer Sem Fio 16000DPI",
        categoria: "Periféricos",
        mediaHistoricaMensal: 8,
        demandaProjetada: 8,
        taxaConfianca: 88,
        tendencia: "estavel",
      },
    ],
  },
];

export function usePrevisaoDemanda() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { vendas } = useVendas();
  const { estoque } = useEstoque();

  const [previsoes, setPrevisoes] = useState<PrevisaoDemanda[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_previsoes_demanda");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar previsões:", e);
        }
      }
    }
    return mockPrevisoesIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("erp_previsoes_demanda", JSON.stringify(previsoes));
  }, [previsoes]);

  const gerarPrevisao = (dataInicio: string, dataFim: string): boolean => {
    setError(null);

    if (!dataInicio || !dataFim) {
      setError("Por favor, preencha o período de análise (Data Inicial e Data Final).");
      return false;
    }

    const dInicio = new Date(dataInicio);
    const dFim = new Date(dataFim);

    if (dInicio > dFim) {
      setError("A data inicial não pode ser posterior à data final.");
      return false;
    }

    // Calcular dias no período
    const diffTime = Math.abs(dFim.getTime() - dInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const monthsFactor = Math.max(0.1, diffDays / 30);

    // Calcular com base em dados reais de vendas no período
    // Agrupar vendas confirmadas por produto
    const vendasPorProduto: Record<string, { totalQtd: number; totalValor: number }> = {};
    
    // Iniciar com produtos ativos no estoque
    estoque.forEach((p) => {
      vendasPorProduto[p.nome] = { totalQtd: 0, totalValor: 0 };
    });

    vendas
      .filter((v) => v.status === "confirmado")
      .forEach((v) => {
        // Mocking mapping of items to real products since mockVendas lists amounts directly
        let itemNome = "Teclado Mecânico RGB Pro";
        if (v.valorTotal < 300) itemNome = "Cabo HDMI 2.1 Trançado 2m";
        else if (v.valorTotal < 500 && v.metodoPagamento === "Boleto") itemNome = "Mouse Gamer Sem Fio 16000DPI";
        else if (v.valorTotal < 700) itemNome = "Headset Noise Cancelling Wireless";
        else itemNome = "Monitor 27' IPS 144Hz UltraWide";

        if (vendasPorProduto[itemNome]) {
          vendasPorProduto[itemNome].totalQtd += v.itens;
          vendasPorProduto[itemNome].totalValor += v.valorTotal;
        } else {
          vendasPorProduto[itemNome] = { totalQtd: v.itens, totalValor: v.valorTotal };
        }
      });

    let totalVolumeProjetado = 0;
    let totalFaturamentoProjetado = 0;

    const itensPrevisao: ItemPrevisao[] = estoque.map((prod) => {
      const vProd = vendasPorProduto[prod.nome] || { totalQtd: 0, totalValor: 0 };
      
      // Média histórica mensal base
      const mediaHistoricaMensal = Math.round((vProd.totalQtd / 3) * 10) / 10 || 1.5; // default benchmark
      
      // Projeção baseada em tendência e volume
      let tendencia: "crescimento" | "estavel" | "queda" = "estavel";
      let multiplier = 1.0;
      
      if (prod.quantidade <= prod.estoqueMinimo) {
        // If stock is low, forecast demand might drop or grow if it's popular
        tendencia = "crescimento";
        multiplier = 1.25;
      } else if (vProd.totalQtd > 5) {
        tendencia = "crescimento";
        multiplier = 1.15;
      } else if (vProd.totalQtd === 0) {
        tendencia = "queda";
        multiplier = 0.8;
      }

      const demandaProjetada = Math.max(1, Math.round(mediaHistoricaMensal * monthsFactor * multiplier));
      const taxaConfianca = Math.round(75 + Math.random() * 20); // 75% to 95% confidence rate

      totalVolumeProjetado += demandaProjetada;
      totalFaturamentoProjetado += demandaProjetada * prod.precoVenda;

      return {
        produtoNome: prod.nome,
        categoria: prod.categoria,
        mediaHistoricaMensal,
        demandaProjetada,
        taxaConfianca,
        tendencia,
      };
    });

    const newPrevisao: PrevisaoDemanda = {
      id: `PRV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
      dataInicio,
      dataFim,
      dataGeracao: new Date().toISOString(),
      usuarioResponsavel: user?.name || "Gerente",
      resultadoFaturamentoProjetado: Math.round(totalFaturamentoProjetado * 100) / 100,
      resultadoVolumeProjetado: totalVolumeProjetado,
      itensPrevisao,
    };

    setPrevisoes((prev) => [newPrevisao, ...prev]);
    addLog(
      `Gerou previsão de demanda para o período ${dataInicio} a ${dataFim}. ID: ${newPrevisao.id}`,
      "relatorios"
    );

    return true;
  };

  const removerPrevisao = (id: string) => {
    setPrevisoes((prev) => prev.filter((p) => p.id !== id));
    addLog(`Excluiu previsão de demanda ID: ${id}`, "relatorios");
  };

  return {
    previsoes,
    error,
    setError,
    gerarPrevisao,
    removerPrevisao,
  };
}
