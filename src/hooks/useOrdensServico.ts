"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/contexts/logs-context";

export interface OrdemServico {
  id: string;
  tipoServico: string;
  responsavelOperacional: string;
  status: "aberta" | "em_progresso" | "concluida" | "cancelada";
  dataAbertura: string;
  dataConclusao?: string;
}

const mockOrdensServico: OrdemServico[] = [
  {
    id: "OS-001",
    tipoServico: "Manutenção Preventiva CNC",
    responsavelOperacional: "João da Silva",
    status: "em_progresso",
    dataAbertura: "2026-06-14T08:00:00.000Z",
  },
];

export function useOrdensServico() {
  const { addLog } = useLogs();
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>(mockOrdensServico);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_ordens_servico");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setOrdensServico(parsed);
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
      localStorage.setItem("erp_ordens_servico", JSON.stringify(ordensServico));
    }
  }, [ordensServico, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_ordens_servico");
      if (saved) {
        try {
          setOrdensServico(JSON.parse(saved));
        } catch (exception) {
          console.error(exception);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const adicionarOrdemServico = (tipoServico: string, responsavelOperacional: string) => {
    setErrorMessage(null);

    if (!tipoServico.trim()) {
      setErrorMessage("O tipo de serviço é obrigatório.");
      return false;
    }
    if (!responsavelOperacional.trim()) {
      setErrorMessage("O responsável operacional é obrigatório.");
      return false;
    }

    const idGerado = `OS-${String(ordensServico.length + 1).padStart(3, "0")}`;
    const novaOrdem: OrdemServico = {
      id: idGerado,
      tipoServico: tipoServico.trim(),
      responsavelOperacional: responsavelOperacional.trim(),
      status: "aberta",
      dataAbertura: new Date().toISOString(),
    };

    setOrdensServico((prev) => [novaOrdem, ...prev]);
    addLog(`Cadastrou a ordem de serviço ${idGerado}`, "manutencao");
    return true;
  };

  const atualizarStatusOrdemServico = (id: string, novoStatus: OrdemServico["status"]) => {
    setErrorMessage(null);
    setOrdensServico((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedConclusao = novoStatus === "concluida" ? new Date().toISOString() : undefined;
          return { ...item, status: novoStatus, dataConclusao: updatedConclusao };
        }
        return item;
      })
    );
    addLog(`Atualizou o status da ordem de serviço ${id} para ${novoStatus}`, "manutencao");
    return true;
  };

  const removerOrdemServico = (id: string) => {
    setErrorMessage(null);
    setOrdensServico((prev) => prev.filter((item) => {
      if (item.id === id) addLog(`Removeu a ordem de serviço ${id}`, "manutencao");
      return item.id !== id;
    }));
    return true;
  };

  return {
    ordensServico,
    adicionarOrdemServico,
    atualizarStatusOrdemServico,
    removerOrdemServico,
    errorMessage,
    setErrorMessage,
  };
}
