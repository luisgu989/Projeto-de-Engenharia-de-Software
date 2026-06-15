"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface AvaliacaoFornecedor {
  id: string;
  fornecedorId: string;
  fornecedorNome: string;
  prazoEntrega: number;
  qualidadeEntrega: number;
  frequenciaEntrega: number;
  indiceDesempenho: number;
  dataAvaliacao: string;
  usuarioResponsavel: string;
  comentarios: string;
}

const avaliacoesIniciais: AvaliacaoFornecedor[] = [
  {
    id: "AVAL-001",
    fornecedorId: "FORN-001",
    fornecedorNome: "TechDistrib LTDA",
    prazoEntrega: 5,
    qualidadeEntrega: 4,
    frequenciaEntrega: 5,
    indiceDesempenho: 4.7,
    dataAvaliacao: "2026-06-05T10:00:00.000Z",
    usuarioResponsavel: "Administrador Geral",
    comentarios: "Excelente tempo de resposta e qualidade consistente de entrega."
  },
  {
    id: "AVAL-002",
    fornecedorId: "FORN-003",
    fornecedorNome: "Sul Eletro Distribuidora",
    prazoEntrega: 3,
    qualidadeEntrega: 5,
    frequenciaEntrega: 4,
    indiceDesempenho: 4.0,
    dataAvaliacao: "2026-06-10T14:30:00.000Z",
    usuarioResponsavel: "Administrador Geral",
    comentarios: "Produtos de altíssima qualidade, mas apresentaram atrasos na última remessa."
  }
];

export function useAvaliacaoFornecedores() {
  const { user } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFornecedor[]>(avaliacoesIniciais);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("erp_avaliacoes_fornecedores");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setAvaliacoes(parsed);
          setIsLoaded(true);
        }, 0);
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_avaliacoes_fornecedores", JSON.stringify(avaliacoes));
    }
  }, [avaliacoes, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_avaliacoes_fornecedores");
      if (saved) {
        try {
          setAvaliacoes(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const adicionarAvaliacao = (nova: Omit<AvaliacaoFornecedor, "id" | "indiceDesempenho" | "dataAvaliacao" | "usuarioResponsavel">) => {
    const media = (nova.prazoEntrega + nova.qualidadeEntrega + nova.frequenciaEntrega) / 3;
    const indice = Math.round(media * 10) / 10;

    const idGerado = `AVAL-${String(avaliacoes.length + 1).padStart(3, "0")}`;
    const avaliacaoCompleta: AvaliacaoFornecedor = {
      ...nova,
      id: idGerado,
      indiceDesempenho: indice,
      dataAvaliacao: new Date().toISOString(),
      usuarioResponsavel: user.name || "Avaliador Logística"
    };

    setAvaliacoes((prev) => [avaliacaoCompleta, ...prev]);
    return true;
  };

  return {
    avaliacoes,
    adicionarAvaliacao
  };
}
