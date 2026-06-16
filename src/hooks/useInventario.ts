"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useEstoque } from "./useEstoque";

export interface SessaoInventario {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidadeAtual: number;
  quantidadeContada: number | null;
  quantidadeAjustada: number | null;
  status: "pendente" | "concluido";
  dataContagem: string;
  responsavel: string;
}

export interface AjusteInventario {
  id: string;
  inventarioId: string;
  produtoId: string;
  produtoNome: string;
  quantidadeAtual: number;
  quantidadeContada: number;
  quantidadeAjustada: number;
  dataAjuste: string;
  responsavel: string;
}

export function useInventario() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { estoque, ajustarEstoque } = useEstoque();

  const [sessoes, setSessoes] = useState<SessaoInventario[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_inventarios");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar inventarios:", e);
        }
      }
    }
    return [];
  });

  const [historicoAjustes, setHistoricoAjustes] = useState<AjusteInventario[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_ajustes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico de ajustes:", e);
        }
      }
    }
    return [];
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar estados no localStorage
  useEffect(() => {
    localStorage.setItem("erp_inventarios", JSON.stringify(sessoes));
  }, [sessoes]);

  useEffect(() => {
    localStorage.setItem("erp_historico_ajustes", JSON.stringify(historicoAjustes));
  }, [historicoAjustes]);

  // Sincronização entre abas/janelas
  useEffect(() => {
    const handleStorageChange = () => {
      const savedSessoes = localStorage.getItem("erp_inventarios");
      const savedHistorico = localStorage.getItem("erp_historico_ajustes");
      if (savedSessoes) {
        try { setSessoes(JSON.parse(savedSessoes)); } catch (e) {}
      }
      if (savedHistorico) {
        try { setHistoricoAjustes(JSON.parse(savedHistorico)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Criar nova contagem/inventário
  const criarSessao = useCallback((produtoId: string) => {
    setError(null);
    const produto = estoque.find((p) => p.id === produtoId && p.status === "ativo");
    if (!produto) {
      setError("Produto não encontrado no estoque.");
      return null;
    }

    // Impede iniciar uma contagem nova para o mesmo produto se já houver uma pendente
    const jaExistePendente = sessoes.some(
      (s) => s.produtoId === produtoId && s.status === "pendente"
    );
    if (jaExistePendente) {
      setError(`Já existe um inventário pendente para o produto "${produto.nome}".`);
      return null;
    }

    const novaSessao: SessaoInventario = {
      id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      produtoId,
      produtoNome: produto.nome,
      quantidadeAtual: produto.quantidade,
      quantidadeContada: null,
      quantidadeAjustada: null,
      status: "pendente",
      dataContagem: new Date().toISOString(),
      responsavel: user.name,
    };

    setSessoes((prev) => [novaSessao, ...prev]);
    addNotification(
      "Sessão de Inventário Aberta",
      `Inventário ${novaSessao.id} iniciado para ${produto.nome} (Saldo atual: ${produto.quantidade} un.).`,
      "info",
      "gerente"
    );

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);

    return novaSessao;
  }, [estoque, sessoes, user, addNotification]);

  // Editar apenas o campo Quantidade Contada
  const salvarContagem = useCallback((id: string, quantidadeContada: number) => {
    setError(null);

    if (quantidadeContada < 0 || isNaN(quantidadeContada)) {
      setError("A quantidade contada deve ser um número inteiro maior ou igual a zero.");
      return false;
    }

    const sessao = sessoes.find((s) => s.id === id);
    if (!sessao) {
      setError("Inventário não encontrado.");
      return false;
    }

    if (sessao.status === "concluido") {
      setError("Não é possível alterar uma sessão de inventário concluída.");
      return false;
    }

    setSessoes((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const quantidadeAjustada = quantidadeContada - s.quantidadeAtual;
          return {
            ...s,
            quantidadeContada,
            quantidadeAjustada,
            dataContagem: new Date().toISOString(),
            responsavel: user.name,
          };
        }
        return s;
      })
    );

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);

    return true;
  }, [sessoes, user]);

  // Efetivar ajustes no estoque
  const finalizarConciliacao = useCallback((id: string) => {
    setError(null);

    // Permissão: Exige perfil com gerenciarEstoque ou movimentarEstoque
    const temPermissao = user.permissions.gerenciarEstoque || user.permissions.movimentarEstoque;
    if (!temPermissao) {
      setError("Seu perfil de usuário não tem permissão para efetivar ajustes de estoque.");
      return false;
    }

    const sessao = sessoes.find((s) => s.id === id);
    if (!sessao) {
      setError("Inventário não encontrado.");
      return false;
    }

    if (sessao.status === "concluido") {
      setError("Esta conciliação já foi finalizada.");
      return false;
    }

    if (sessao.quantidadeContada === null || sessao.quantidadeAjustada === null) {
      setError("Insira a quantidade contada antes de finalizar a conciliação.");
      return false;
    }

    // Executa o ajuste físico no catálogo principal
    ajustarEstoque(sessao.produtoId, sessao.quantidadeContada);

    const dataAtual = new Date().toISOString();

    // Atualiza status da sessão
    setSessoes((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: "concluido",
            dataContagem: dataAtual,
            responsavel: user.name,
          };
        }
        return s;
      })
    );

    // Salva no Histórico de Ajustes imutável
    const novoAjuste: AjusteInventario = {
      id: `AJU-${Math.floor(100000 + Math.random() * 900000)}`,
      inventarioId: id,
      produtoId: sessao.produtoId,
      produtoNome: sessao.produtoNome,
      quantidadeAtual: sessao.quantidadeAtual,
      quantidadeContada: sessao.quantidadeContada,
      quantidadeAjustada: sessao.quantidadeAjustada,
      dataAjuste: dataAtual,
      responsavel: user.name,
    };

    setHistoricoAjustes((prev) => [novoAjuste, ...prev]);

    addNotification(
      "Inventário Finalizado",
      `Inventário ${id} para ${sessao.produtoNome} foi reconciliado. Ajuste: ${sessao.quantidadeAjustada > 0 ? "+" : ""}${sessao.quantidadeAjustada} un.`,
      "success",
      "gerente"
    );

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);

    return true;
  }, [sessoes, user, ajustarEstoque, addNotification]);

  return {
    sessoes,
    historicoAjustes,
    error,
    setError,
    criarSessao,
    salvarContagem,
    finalizarConciliacao,
  };
}
