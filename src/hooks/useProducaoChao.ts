"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useEstoque } from "./useEstoque";
import { useProducao } from "./useProducao";
import { useLogs } from "@/contexts/logs-context";

export interface ProducaoChao {
  id: string;
  ordemProdutivaId: string;
  produtoNome: string;
  etapaProducao: "Corte" | "Montagem" | "Pintura" | "Controle de Qualidade" | "Embalagem";
  insumoId: string;
  insumoNome: string;
  quantidadeConsumida: number;
  status: "em_andamento" | "homologado";
  dataAtualizacao: string;
  usuario: string;
}

export interface LogOperacionalProducao {
  id: string;
  producaoChaoId: string;
  ordemProdutivaId: string;
  etapaProducao: string;
  insumoNome: string;
  quantidadeConsumida: number;
  dataHomologacao: string;
  usuario: string;
  detalhes: string;
}

export const ETAPAS_PRODUCAO = [
  "Corte",
  "Montagem",
  "Pintura",
  "Controle de Qualidade",
  "Embalagem",
];

const mockProducoesIniciais: ProducaoChao[] = [
  {
    id: "PRC-301",
    ordemProdutivaId: "OP-001",
    produtoNome: "Teclado Mecânico RGB Pro",
    etapaProducao: "Montagem",
    insumoId: "PROD-004", // Cabo HDMI
    insumoNome: "Cabo HDMI 2.1 Trançado 2m",
    quantidadeConsumida: 5,
    status: "em_andamento",
    dataAtualizacao: new Date().toISOString(),
    usuario: "Usuário Suporte",
  },
];

export function useProducaoChao() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addNotification } = useNotifications();
  const { estoque, registrarMovimentacaoEstoque } = useEstoque();
  const { ordens } = useProducao();

  const [producoesChao, setProducoesChao] = useState<ProducaoChao[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_producao_chao");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar produções de chão de fábrica:", e);
        }
      }
    }
    return mockProducoesIniciais;
  });

  const [historicoOperacional, setHistoricoOperacional] = useState<LogOperacionalProducao[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_operacional_producao");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico operacional:", e);
        }
      }
    }
    return [];
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_producao_chao", JSON.stringify(producoesChao));
  }, [producoesChao]);

  useEffect(() => {
    localStorage.setItem("erp_historico_operacional_producao", JSON.stringify(historicoOperacional));
  }, [historicoOperacional]);

  // Sync entre abas/simulações
  useEffect(() => {
    const handleStorageChange = () => {
      const savedChao = localStorage.getItem("erp_producao_chao");
      const savedHist = localStorage.getItem("erp_historico_operacional_producao");
      if (savedChao) {
        try { setProducoesChao(JSON.parse(savedChao)); } catch (e) {}
      }
      if (savedHist) {
        try { setHistoricoOperacional(JSON.parse(savedHist)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Iniciar acompanhamento de chão de fábrica
  const iniciarAcompanhamento = useCallback(
    (
      ordemProdutivaId: string,
      insumoId: string,
      etapaProducao: ProducaoChao["etapaProducao"],
      quantidadeConsumida: number
    ) => {
      setError(null);

      if (quantidadeConsumida <= 0 || isNaN(quantidadeConsumida)) {
        setError("A quantidade consumida do insumo deve ser maior do que zero.");
        return false;
      }

      // Validar se a ordem de produção existe
      const op = ordens.find((o) => o.id === ordemProdutivaId);
      if (!op) {
        setError("Ordem de Produção não encontrada.");
        return false;
      }

      // Evita duplicidade de rastreamentos ativos para a mesma Ordem Produtiva
      const jaRastreandoAtiva = producoesChao.some(
        (p) => p.ordemProdutivaId === ordemProdutivaId && p.status === "em_andamento"
      );
      if (jaRastreandoAtiva) {
        setError(`A ordem produtiva ${ordemProdutivaId} já possui um rastreamento em andamento no chão de fábrica.`);
        return false;
      }

      // Validar insumo
      const insumo = estoque.find((e) => e.id === insumoId && e.status === "ativo");
      if (!insumo) {
        setError("Insumo não encontrado no estoque.");
        return false;
      }

      if (!ETAPAS_PRODUCAO.includes(etapaProducao)) {
        setError("Etapa de produção inválida.");
        return false;
      }

      const id = `PRC-${Math.floor(100000 + Math.random() * 900000)}`;
      const novaProducao: ProducaoChao = {
        id,
        ordemProdutivaId,
        produtoNome: op.produtoNome,
        etapaProducao,
        insumoId,
        insumoNome: insumo.nome,
        quantidadeConsumida,
        status: "em_andamento",
        dataAtualizacao: new Date().toISOString(),
        usuario: user.name,
      };

      setProducoesChao((prev) => [novaProducao, ...prev]);

      addLog(`Iniciou acompanhamento de chão de fábrica para OP ${ordemProdutivaId} (Rastreio: ${id})`, "producao");

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [ordens, estoque, producoesChao, user]
  );

  // Atualizar Etapa da Produção e Quantidade Consumida (únicos campos editáveis)
  const atualizarProducao = useCallback(
    (
      id: string,
      etapaProducao: ProducaoChao["etapaProducao"],
      quantidadeConsumida: number
    ) => {
      setError(null);

      if (quantidadeConsumida <= 0 || isNaN(quantidadeConsumida)) {
        setError("A quantidade consumida deve ser maior do que zero.");
        return false;
      }

      const producao = producoesChao.find((p) => p.id === id);
      if (!producao) {
        setError("Registro de chão de fábrica não encontrado.");
        return false;
      }

      if (producao.status === "homologado") {
        setError("Não é possível editar dados de uma produção já homologada.");
        return false;
      }

      if (!ETAPAS_PRODUCAO.includes(etapaProducao)) {
        setError("Etapa de produção inválida.");
        return false;
      }

      setProducoesChao((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            // ordemProdutivaId e insumoId permanecem IMUTÁVEIS
            return {
              ...p,
              etapaProducao,
              quantidadeConsumida,
              dataAtualizacao: new Date().toISOString(),
              usuario: user.name,
            };
          }
          return p;
        })
      );

      addLog(`Atualizou etapa de produção do rastreio ${id} para ${etapaProducao}`, "producao");

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [producoesChao, user]
  );

  // Homologar Produção (Validação crítica de estoque + Baixa física de materiais)
  const homologarProducao = useCallback(
    (id: string) => {
      setError(null);

      const producao = producoesChao.find((p) => p.id === id);
      if (!producao) {
        setError("Registro de chão de fábrica não encontrado.");
        return false;
      }

      if (producao.status === "homologado") {
        setError("Esta produção já foi homologada.");
        return false;
      }

      // VALIDAÇÃO CRÍTICA: Busca o insumo atualizado em estoque
      const insumoEstoque = estoque.find((e) => e.id === producao.insumoId && e.status === "ativo");
      if (!insumoEstoque) {
        setError(`Insumo "${producao.insumoNome}" não encontrado ou inativo no estoque.`);
        return false;
      }

      // Valida se o saldo físico disponível é suficiente para a baixa
      if (insumoEstoque.quantidade < producao.quantidadeConsumida) {
        setError(
          `Saldo insuficiente em estoque do insumo "${producao.insumoNome}". Disponível: ${insumoEstoque.quantidade} un. Solicitado: ${producao.quantidadeConsumida} un.`
        );
        return false;
      }

      // Se passou na validação, executa a baixa física de materiais
      const sucessoBaixa = registrarMovimentacaoEstoque(
        producao.insumoId,
        "saida",
        producao.quantidadeConsumida,
        "Depósito Central",
        `Consumo chão de fábrica - Ordem Produtiva ${producao.ordemProdutivaId} (Rastreio: ${id})`
      );

      if (!sucessoBaixa) {
        setError("Erro ao processar baixa de materiais em estoque.");
        return false;
      }

      const dataAtual = new Date().toISOString();

      // Homologa status
      setProducoesChao((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            return {
              ...p,
              status: "homologado",
              dataAtualizacao: dataAtual,
              usuario: user.name,
            };
          }
          return p;
        })
      );

      // Salva no Histórico Operacional imutável de fabricação
      const novoLog: LogOperacionalProducao = {
        id: `LOG-OP-${Math.floor(100000 + Math.random() * 900000)}`,
        producaoChaoId: id,
        ordemProdutivaId: producao.ordemProdutivaId,
        etapaProducao: producao.etapaProducao,
        insumoNome: producao.insumoNome,
        quantidadeConsumida: producao.quantidadeConsumida,
        dataHomologacao: dataAtual,
        usuario: user.name,
        detalhes: `Homologação de consumo de insumo e finalização da etapa ${producao.etapaProducao}.`,
      };

      setHistoricoOperacional((prev) => [novoLog, ...prev]);

      addLog(`Homologou produção de chão de fábrica (Rastreio: ${id}) consumindo ${producao.quantidadeConsumida} un. de ${producao.insumoNome}`, "producao");

      addNotification(
        "Produção Chão de Fábrica Homologada",
        `Consumo de ${producao.quantidadeConsumida} un. do insumo "${producao.insumoNome}" homologado para a OP ${producao.ordemProdutivaId}.`,
        "success",
        "logistica"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [producoesChao, estoque, user, registrarMovimentacaoEstoque, addNotification]
  );

  return {
    producoesChao,
    historicoOperacional,
    error,
    setError,
    iniciarAcompanhamento,
    atualizarProducao,
    homologarProducao,
  };
}
