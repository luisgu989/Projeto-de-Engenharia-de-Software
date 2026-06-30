"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface Filial {
  id: string;
  nome: string;
  centroCusto: string;
  status: "ativo" | "inativo";
  dataCadastro: string;
  usuarioResponsavel: string;
  vinculacaoOrganizacional: string;
}

const filiaisIniciais: Filial[] = [
  {
    id: "FIL-001",
    nome: "CD Principal - São Paulo",
    centroCusto: "Logística SP",
    status: "ativo",
    dataCadastro: "2026-01-10T08:00:00.000Z",
    usuarioResponsavel: "Administrador Geral",
    vinculacaoOrganizacional: "12.345.678/0001-01",
  },
  {
    id: "FIL-002",
    nome: "Filial Rio de Janeiro",
    centroCusto: "Comercial RJ",
    status: "ativo",
    dataCadastro: "2026-02-15T09:30:00.000Z",
    usuarioResponsavel: "Administrador Geral",
    vinculacaoOrganizacional: "12.345.678/0002-02",
  },
];

export function useFiliais() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [filiais, setFiliais] = useState<Filial[]>(filiaisIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_filiais");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setFiliais(parsed);
          setIsLoaded(true);
        }, 0);
        return;
      } catch (exception) {
        console.error(exception);
      }
    }
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_filiais", JSON.stringify(filiais));
    }
  }, [filiais, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_filiais");
      if (saved) {
        try {
          setFiliais(JSON.parse(saved));
        } catch (exception) {
          console.error(exception);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const checkDuplicateVinculacao = (vinculacao: string, excludeId?: string) => {
    const cleanedVinculacao = vinculacao.trim().toUpperCase();
    if (!cleanedVinculacao) return false;
    return filiais.some(
      (item) => item.id !== excludeId && item.vinculacaoOrganizacional.trim().toUpperCase() === cleanedVinculacao
    );
  };

  const adicionarFilial = (nome: string, centroCusto: string, vinculacao: string) => {
    setErrorMessage(null);
    if (!nome.trim() || nome.trim().length < 3) {
      setErrorMessage("O nome da unidade deve possuir pelo menos 3 caracteres.");
      return false;
    }
    if (!centroCusto.trim()) {
      setErrorMessage("O centro de custo é obrigatório.");
      return false;
    }
    if (!vinculacao.trim()) {
      setErrorMessage("A vinculação organizacional é obrigatória.");
      return false;
    }
    if (checkDuplicateVinculacao(vinculacao)) {
      setErrorMessage("Já existe uma filial vinculada a este documento/registro.");
      return false;
    }

    const idGerado = `FIL-${String(filiais.length + 1).padStart(3, "0")}`;
    const novaFilial: Filial = {
      id: idGerado,
      nome: nome.trim(),
      centroCusto: centroCusto.trim(),
      status: "ativo",
      dataCadastro: new Date().toISOString(),
      usuarioResponsavel: user.name || "Usuário do Sistema",
      vinculacaoOrganizacional: vinculacao.trim(),
    };

    setFiliais((prev) => [...prev, novaFilial]);
    addLog(`Cadastrou a filial ${idGerado} - ${nome.trim()}`, "sistema");
    return true;
  };

  const atualizarStatusFilial = (id: string, novoStatus: "ativo" | "inativo") => {
    setErrorMessage(null);
    setFiliais((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: novoStatus } : item))
    );
    addLog(`Atualizou o status da filial ${id} para ${novoStatus}`, "sistema");
    return true;
  };

  const removerFilial = (id: string) => {
    setErrorMessage(null);
    setFiliais((prev) => prev.filter((item) => {
      if (item.id === id) addLog(`Removeu a filial ${id}`, "sistema");
      return item.id !== id;
    }));
    return true;
  };

  return {
    filiais,
    adicionarFilial,
    atualizarStatusFilial,
    removerFilial,
    errorMessage,
    setErrorMessage,
  };
}
