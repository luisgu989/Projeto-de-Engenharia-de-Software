"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useEstoque } from "./useEstoque";
import { useLogs } from "@/contexts/logs-context";

export interface OrdemCompra {
  id: string;
  fornecedor: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  status: "pendente" | "aprovada" | "entregue" | "cancelada";
  dataSolicitacao: string;
  usuarioResponsavel: string;
}

const mockOrdensCompra: OrdemCompra[] = [
  {
    id: "OC-001",
    fornecedor: "TechDistrib",
    produtoId: "PROD-002",
    produtoNome: "Mouse Gamer Sem Fio 16000DPI",
    quantidade: 20,
    status: "pendente",
    dataSolicitacao: "2026-06-10T10:00:00.000Z",
    usuarioResponsavel: "Administrador Geral",
  },
  {
    id: "OC-002",
    fornecedor: "Sul Eletro",
    produtoId: "PROD-005",
    produtoNome: "Headset Noise Cancelling Wireless",
    quantidade: 15,
    status: "aprovada",
    dataSolicitacao: "2026-06-12T11:30:00.000Z",
    usuarioResponsavel: "Administrador Geral",
  },
];

export const listaFornecedores = ["TechDistrib", "Inova Componentes", "Sul Eletro", "Macro Atacado", "Global Tech"];

export function useOrdensCompra() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { registrarMovimentacao } = useEstoque();

  const [ordensCompra, setOrdensCompra] = useState<OrdemCompra[]>(mockOrdensCompra);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_ordens_compra");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setOrdensCompra(parsed);
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
      localStorage.setItem("erp_ordens_compra", JSON.stringify(ordensCompra));
    }
  }, [ordensCompra, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_ordens_compra");
      if (saved) {
        try {
          setOrdensCompra(JSON.parse(saved));
        } catch (exception) {
          console.error(exception);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);



  const adicionarOrdemCompra = (
    fornecedor: string,
    produtoId: string,
    produtoNome: string,
    quantidade: number
  ) => {
    setErrorMessage(null);
    if (!fornecedor.trim()) {
      setErrorMessage("O fornecedor é obrigatório.");
      return false;
    }
    if (!listaFornecedores.includes(fornecedor)) {
      setErrorMessage("Fornecedor inválido ou não cadastrado.");
      return false;
    }
    if (!produtoId) {
      setErrorMessage("O produto é obrigatório.");
      return false;
    }
    if (quantidade <= 0) {
      setErrorMessage("A quantidade deve ser maior que zero.");
      return false;
    }

    const idGerado = `OC-${String(ordensCompra.length + 1).padStart(3, "0")}`;
    const novaOrdem: OrdemCompra = {
      id: idGerado,
      fornecedor: fornecedor.trim(),
      produtoId,
      produtoNome,
      quantidade,
      status: "pendente",
      dataSolicitacao: new Date().toISOString(),
      usuarioResponsavel: user.name || "Usuário do Sistema",
    };

    setOrdensCompra((prev) => [novaOrdem, ...prev]);
    addLog(`Cadastrou a ordem de compra ${idGerado} para o fornecedor ${fornecedor}`, "estoque");
    return true;
  };

  const atualizarStatusOrdemCompra = (id: string, novoStatus: OrdemCompra["status"]) => {
    setErrorMessage(null);
    let isSuccess = true;

    setOrdensCompra((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.status === novoStatus) return item;

          if (novoStatus === "entregue") {
            const added = registrarMovimentacao(
              item.produtoId,
              "entrada",
              item.quantidade,
              `Entrada por Ordem de Compra ${item.id}`
            );
            if (!added) {
              isSuccess = false;
              return item;
            }
          }

          addLog(`Atualizou o status da ordem de compra ${id} para ${novoStatus}`, "estoque");
          return { ...item, status: novoStatus };
        }
        return item;
      })
    );

    return isSuccess;
  };

  const removerOrdemCompra = (id: string) => {
    setErrorMessage(null);
    setOrdensCompra((prev) => prev.filter((item) => {
      if (item.id === id) addLog(`Removeu a ordem de compra ${id}`, "estoque");
      return item.id !== id;
    }));
    return true;
  };

  return {
    ordensCompra,
    adicionarOrdemCompra,
    atualizarStatusOrdemCompra,
    removerOrdemCompra,
    errorMessage,
    setErrorMessage,
  };
}
