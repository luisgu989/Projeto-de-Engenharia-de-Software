"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";
import { useVendas } from "./useVendas";
import { useEstoque } from "./useEstoque";

export interface MetaOrganizacional {
  idMeta: string;
  tipoMeta: string;
  indicadorVinculado: string;
  valorDefinido: number;
  progressoAtual: number; // percentage
  valorAtual: number; // raw value
  dataCadastro: string;
  usuarioResponsavel: string;
}

const mockMetasIniciais: MetaOrganizacional[] = [
  {
    idMeta: "MET-2026-001",
    tipoMeta: "Financeira",
    indicadorVinculado: "Faturamento Mensal",
    valorDefinido: 50000.0,
    progressoAtual: 90, // mock base
    valorAtual: 45231.89,
    dataCadastro: "2026-06-01T09:00:00.000Z",
    usuarioResponsavel: "Luís Fernando",
  },
  {
    idMeta: "MET-2026-002",
    tipoMeta: "Vendas",
    indicadorVinculado: "Quantidade de Vendas",
    valorDefinido: 10,
    progressoAtual: 40,
    valorAtual: 4,
    dataCadastro: "2026-06-02T10:30:00.000Z",
    usuarioResponsavel: "Renata Souza",
  },
  {
    idMeta: "MET-2026-003",
    tipoMeta: "Estoque",
    indicadorVinculado: "Alertas de Baixo Estoque",
    valorDefinido: 0, // Lower is better
    progressoAtual: 100, // No alerts = 100%
    valorAtual: 2,
    dataCadastro: "2026-06-03T11:00:00.000Z",
    usuarioResponsavel: "Luís Fernando",
  },
];

export function useMetas() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { vendas } = useVendas();
  const { estoque } = useEstoque();

  const [metas, setMetas] = useState<MetaOrganizacional[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_metas_organizacionais");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar metas:", e);
        }
      }
    }
    return mockMetasIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  // Recalcular progresso das metas com base em dados em tempo real
  const calcularMetasProgresso = useCallback((metasLista: MetaOrganizacional[]): MetaOrganizacional[] => {
    // 1. Faturamento total
    const faturamentoTotal = vendas
      .filter((v) => v.status === "confirmado")
      .reduce((acc, v) => acc + v.valorTotal, 0);

    // 2. Quantidade total de vendas
    const totalVendasCount = vendas.filter((v) => v.status === "confirmado").length;

    // 3. Alertas de estoque
    const itensAtivos = estoque.filter((item) => item.status === "ativo");
    const baixoEstoqueCount = itensAtivos.filter((item) => item.quantidade <= item.estoqueMinimo).length;

    // 4. Volume total de estoque
    const volumeTotalEstoque = itensAtivos.reduce((acc, item) => acc + item.quantidade, 0);

    return metasLista.map((meta) => {
      let valorAtual = 0;
      let progressoAtual = 0;

      switch (meta.indicadorVinculado) {
        case "Faturamento Mensal":
          valorAtual = faturamentoTotal;
          progressoAtual = meta.valorDefinido > 0 ? Math.min(100, Math.round((valorAtual / meta.valorDefinido) * 100)) : 100;
          break;
        case "Quantidade de Vendas":
          valorAtual = totalVendasCount;
          progressoAtual = meta.valorDefinido > 0 ? Math.min(100, Math.round((valorAtual / meta.valorDefinido) * 100)) : 100;
          break;
        case "Alertas de Baixo Estoque":
          valorAtual = baixoEstoqueCount;
          // Se o valor definido é 0 e temos 0 alertas, progresso é 100%. Se temos alertas, cai.
          if (meta.valorDefinido === 0) {
            progressoAtual = valorAtual === 0 ? 100 : Math.max(0, 100 - valorAtual * 20); // 20% drop per alert
          } else {
            progressoAtual = Math.min(100, Math.round((valorAtual / meta.valorDefinido) * 100));
          }
          break;
        case "Volume Total de Peças":
          valorAtual = volumeTotalEstoque;
          progressoAtual = meta.valorDefinido > 0 ? Math.min(100, Math.round((valorAtual / meta.valorDefinido) * 100)) : 100;
          break;
        default:
          valorAtual = meta.valorAtual;
          progressoAtual = meta.progressoAtual;
      }

      return {
        ...meta,
        valorAtual,
        progressoAtual,
      };
    });
  }, [vendas, estoque]);

  // Sincronizar e recalcular
  useEffect(() => {
    const listComProgresso = calcularMetasProgresso(metas);
    const hasChanges = JSON.stringify(listComProgresso) !== JSON.stringify(metas);
    if (hasChanges) {
      setMetas(listComProgresso);
      localStorage.setItem("erp_metas_organizacionais", JSON.stringify(listComProgresso));
    }
  }, [vendas, estoque, calcularMetasProgresso, metas]);

  const adicionarMeta = (
    tipoMeta: string,
    indicadorVinculado: string,
    valorDefinido: number
  ): boolean => {
    setError(null);

    if (!tipoMeta || !indicadorVinculado) {
      setError("Por favor, preencha todos os campos obrigatórios (Tipo de Meta e Indicador Vinculado).");
      return false;
    }

    if (valorDefinido < 0 || isNaN(valorDefinido)) {
      setError("O valor definido deve ser maior ou igual a zero.");
      return false;
    }

    const idMeta = `MET-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
    const dataCadastro = new Date().toISOString();

    const novaMeta: MetaOrganizacional = {
      idMeta,
      tipoMeta,
      indicadorVinculado,
      valorDefinido,
      progressoAtual: 0,
      valorAtual: 0,
      dataCadastro,
      usuarioResponsavel: user?.name || "Gerente",
    };

    // Calcular progresso inicial
    const novaMetaComProgresso = calcularMetasProgresso([novaMeta])[0];

    setMetas((prev) => [novaMetaComProgresso, ...prev]);
    addLog(
      `Definiu nova meta do tipo ${tipoMeta} vinculada ao indicador '${indicadorVinculado}' com valor alvo de ${valorDefinido}. ID: ${idMeta}`,
      "relatorios"
    );

    return true;
  };

  const removerMeta = (id: string) => {
    setMetas((prev) => prev.filter((m) => m.idMeta !== id));
    addLog(`Removeu meta organizacional ID: ${id}`, "relatorios");
  };

  return {
    metas,
    error,
    setError,
    adicionarMeta,
    removerMeta,
  };
}
