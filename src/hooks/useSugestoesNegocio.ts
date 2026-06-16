"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";
import { useEstoque } from "./useEstoque";
import { useVendas } from "./useVendas";

export interface SugestaoNegocio {
  idRecomendacao: string;
  dataAnalise: string;
  sugestaoGerada: string;
  areaNegocio: "Estoque" | "Vendas" | "Financeiro" | "Produção" | "Logística";
  nivelPrioridade: "Alta" | "Média" | "Baixa";
  impactoEstimado: string;
}

const mockSugestoesIniciais: SugestaoNegocio[] = [
  {
    idRecomendacao: "REC-2026-101",
    dataAnalise: "2026-06-14T15:30:00.000Z",
    sugestaoGerada: "O estoque de 'Mouse Gamer Sem Fio 16000DPI' (8 un.) está abaixo do limite de segurança (12 un.). Recomendamos emitir pedido de reposição de 15 unidades.",
    areaNegocio: "Estoque",
    nivelPrioridade: "Alta",
    impactoEstimado: "Evita a perda de R$ 3.448,50 em vendas estimadas para a quinzena.",
  },
  {
    idRecomendacao: "REC-2026-102",
    dataAnalise: "2026-06-14T15:30:00.000Z",
    sugestaoGerada: "O faturamento via Pix cresceu 18.5% no último mês. Sugerimos implantar desconto progressivo de 5% em periféricos para pagamentos à vista.",
    areaNegocio: "Vendas",
    nivelPrioridade: "Média",
    impactoEstimado: "Potencial aumento de volume de vendas em 10% e aceleração de capital de giro.",
  },
  {
    idRecomendacao: "REC-2026-103",
    dataAnalise: "2026-06-14T15:30:00.000Z",
    sugestaoGerada: "Custos com frete logístico na Rota Campinas aumentaram 15% devido ao combustível. Sugerimos consolidar cargas às terças e quintas-feiras.",
    areaNegocio: "Logística",
    nivelPrioridade: "Média",
    impactoEstimado: "Redução estimada de 8% nos custos de transporte rodoviário.",
  },
];

export function useSugestoesNegocio() {
  const { addLog } = useLogs();
  const { estoque } = useEstoque();
  const { vendas } = useVendas();

  const [sugestoes, setSugestoes] = useState<SugestaoNegocio[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_sugestoes_negocio");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar sugestões:", e);
        }
      }
    }
    return mockSugestoesIniciais;
  });

  useEffect(() => {
    localStorage.setItem("erp_sugestoes_negocio", JSON.stringify(sugestoes));
  }, [sugestoes]);

  const executarAnaliseIA = () => {
    const dataAtual = new Date().toISOString();
    const novasSugestoes: SugestaoNegocio[] = [];

    // 1. Analisar Estoque Baixo
    const itensBaixoEstoque = estoque.filter((item) => item.quantidade <= item.estoqueMinimo);
    if (itensBaixoEstoque.length > 0) {
      itensBaixoEstoque.forEach((item) => {
        novasSugestoes.push({
          idRecomendacao: `REC-EST-${Math.floor(1000 + Math.random() * 9000)}`,
          dataAnalise: dataAtual,
          sugestaoGerada: `O produto '${item.nome}' está com estoque crítico de ${item.quantidade} unidades (mínimo: ${item.estoqueMinimo}). Realize a emissão urgente de ordem de compra ou produção.`,
          areaNegocio: "Estoque",
          nivelPrioridade: "Alta",
          impactoEstimado: `Garante a disponibilidade do produto. Evita ruptura e perda de faturamento estimado em R$ ${(item.precoVenda * (item.estoqueMinimo - item.quantidade + 10)).toFixed(2)}.`,
        });
      });
    }

    // 2. Analisar Faturamento de Vendas
    const vendasConfirmadas = vendas.filter((v) => v.status === "confirmado");
    const totalFaturado = vendasConfirmadas.reduce((sum, v) => sum + v.valorTotal, 0);
    const mediaVenda = totalFaturado / (vendasConfirmadas.length || 1);

    if (totalFaturado > 0) {
      novasSugestoes.push({
        idRecomendacao: `REC-VEN-${Math.floor(1000 + Math.random() * 9000)}`,
        dataAnalise: dataAtual,
        sugestaoGerada: `Ticket médio de vendas consolidado em R$ ${mediaVenda.toFixed(2)}. Recomendamos incentivar a venda cruzada (Cross-selling) oferecendo acessórios no carrinho de compras.`,
        areaNegocio: "Vendas",
        nivelPrioridade: "Média",
        impactoEstimado: "Elevação estimada de 15% no ticket médio dos próximos pedidos.",
      });
    }

    // 3. Analisar Financeiro
    if (totalFaturado < 10000) {
      novasSugestoes.push({
        idRecomendacao: `REC-FIN-${Math.floor(1000 + Math.random() * 9000)}`,
        dataAnalise: dataAtual,
        sugestaoGerada: "Faturamento mensal consolidado abaixo do ponto de equilíbrio planejado. Sugerimos reavaliar despesas operacionais ou antecipar recebíveis de cartão de crédito.",
        areaNegocio: "Financeiro",
        nivelPrioridade: "Alta",
        impactoEstimado: "Melhora a liquidez imediata em até R$ 5.000,00.",
      });
    } else {
      novasSugestoes.push({
        idRecomendacao: `REC-FIN-${Math.floor(1000 + Math.random() * 9000)}`,
        dataAnalise: dataAtual,
        sugestaoGerada: "Fluxo de caixa saudável registrado. Recomendamos investir 20% do superávit em campanhas de marketing digital ou otimização de infraestrutura logística.",
        areaNegocio: "Financeiro",
        nivelPrioridade: "Baixa",
        impactoEstimado: "Crescimento sustentável de marca e redução de gargalos logísticos no médio prazo.",
      });
    }

    // Se nenhuma sugestão operacional foi gerada, adicionar uma padrão
    if (novasSugestoes.length === 0) {
      novasSugestoes.push({
        idRecomendacao: `REC-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
        dataAnalise: dataAtual,
        sugestaoGerada: "Operações dentro da normalidade estatística. Recomendamos manter a rotina semanal de análise de giro de estoques.",
        areaNegocio: "Estoque",
        nivelPrioridade: "Baixa",
        impactoEstimado: "Manutenção da estabilidade de giro operacional.",
      });
    }

    setSugestoes(novasSugestoes);
    addLog(
      `Executou análise operacional de IA e gerou ${novasSugestoes.length} recomendações inteligentes de negócio.`,
      "relatorios"
    );
  };

  const limparRecomendacoes = () => {
    setSugestoes([]);
    addLog("Limpou o histórico de sugestões inteligentes de negócio.", "relatorios");
  };

  return {
    sugestoes,
    executarAnaliseIA,
    limparRecomendacoes,
  };
}
