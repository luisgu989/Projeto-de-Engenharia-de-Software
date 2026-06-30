"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface LoteItem {
  id: string;
  numeroLote: string;
  numeroSerie: string;
  dataValidade: string;
  produtoId: string;
  produtoNome: string;
  criadoEm: string;
  criadoPor: string;
}

const lotesIniciais: LoteItem[] = [
  {
    id: "LT-001",
    numeroLote: "L-2026-A1",
    numeroSerie: "SN-98723-K",
    dataValidade: "2027-12-31",
    produtoId: "PROD-001",
    produtoNome: "Teclado Mecânico RGB Pro",
    criadoEm: "2026-05-15T09:00:00.000Z",
    criadoPor: "Renata Souza",
  },
];

export function useLotes() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [lotes, setLotes] = useState<LoteItem[]>(lotesIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_lotes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setLotes(parsed);
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
      localStorage.setItem("erp_lotes", JSON.stringify(lotes));
    }
  }, [lotes, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_lotes");
      if (saved) {
        try {
          setLotes(JSON.parse(saved));
        } catch (exception) {
          console.error(exception);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const checkDuplicateLote = (numeroLote: string, excludeId?: string) => {
    const cleanedLote = numeroLote.trim().toUpperCase();
    if (!cleanedLote) return false;
    return lotes.some(
      (item) => item.id !== excludeId && item.numeroLote.trim().toUpperCase() === cleanedLote
    );
  };

  const adicionarLote = (
    numeroLote: string,
    numeroSerie: string,
    dataValidade: string,
    produtoId: string,
    produtoNome: string
  ) => {
    setErrorMessage(null);

    if (!numeroLote.trim()) {
      setErrorMessage("O número do lote é obrigatório.");
      return false;
    }
    if (checkDuplicateLote(numeroLote)) {
      setErrorMessage("Este número de lote já está cadastrado.");
      return false;
    }
    if (!numeroSerie.trim()) {
      setErrorMessage("O número de série é obrigatório.");
      return false;
    }
    if (!dataValidade) {
      setErrorMessage("A data de validade é obrigatória.");
      return false;
    }

    const validadeDate = new Date(dataValidade + "T23:59:59");
    const today = new Date();
    if (validadeDate <= today) {
      setErrorMessage("A data de validade deve ser uma data futura.");
      return false;
    }
    if (!produtoId) {
      setErrorMessage("O produto deve ser selecionado.");
      return false;
    }

    const idGerado = `LT-${String(lotes.length + 1).padStart(3, "0")}`;
    const novoLote: LoteItem = {
      id: idGerado,
      numeroLote: numeroLote.trim().toUpperCase(),
      numeroSerie: numeroSerie.trim().toUpperCase(),
      dataValidade,
      produtoId,
      produtoNome,
      criadoEm: new Date().toISOString(),
      criadoPor: user.name || "Usuário do Sistema",
    };

    setLotes((prev) => [novoLote, ...prev]);
    addLog(`Cadastrou o lote ${numeroLote} para o produto ${produtoNome}`, "estoque");
    return true;
  };

  const removerLote = (id: string) => {
    setErrorMessage(null);
    setLotes((prev) => prev.filter((item) => {
      if (item.id === id) addLog(`Removeu o lote ${item.numeroLote}`, "estoque");
      return item.id !== id;
    }));
    return true;
  };

  return {
    lotes,
    adicionarLote,
    removerLote,
    errorMessage,
    setErrorMessage,
  };
}
