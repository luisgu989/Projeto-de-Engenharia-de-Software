"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";
import { ItemEstoque } from "./useEstoque";

export interface RegistroImportado {
  id: string;
  sku: string;
  nome: string;
  categoria: string;
  quantidade: number;
  estoqueMinimo: number;
  precoCusto: number;
  precoVenda: number;
  status: "ativo" | "excluido";
  criadoEm: string;
  criadoPor: string;
}

export interface VersaoImportacao {
  id: string;
  versao: number;
  origemImportacao: string;
  dataImportacao: string;
  statusVersao: "ativa" | "arquivada";
  dados: RegistroImportado[];
  usuarioResponsavel: string;
}

const importacoesIniciais: VersaoImportacao[] = [
  {
    id: "IMP-001",
    versao: 1,
    origemImportacao: "Planilha de Estoque Inicial",
    dataImportacao: "2026-06-01T08:00:00.000Z",
    statusVersao: "arquivada",
    usuarioResponsavel: "Administrador Geral",
    dados: [
      {
        id: "PROD-001",
        sku: "PRD-TEC-001",
        nome: "Teclado Mecânico RGB Pro",
        categoria: "Periféricos",
        quantidade: 40,
        estoqueMinimo: 10,
        precoCusto: 180.0,
        precoVenda: 349.9,
        status: "ativo",
        criadoEm: "2026-05-15T09:00:00.000Z",
        criadoPor: "Renata Souza"
      },
      {
        id: "PROD-002",
        sku: "PRD-MOU-002",
        nome: "Mouse Gamer Sem Fio 16000DPI",
        categoria: "Periféricos",
        quantidade: 10,
        estoqueMinimo: 12,
        precoCusto: 120.0,
        precoVenda: 229.9,
        status: "ativo",
        criadoEm: "2026-05-16T10:30:00.000Z",
        criadoPor: "Luís Fernando"
      }
    ]
  },
  {
    id: "IMP-002",
    versao: 2,
    origemImportacao: "Planilha Semanal de Reposição",
    dataImportacao: "2026-06-08T09:30:00.000Z",
    statusVersao: "ativa",
    usuarioResponsavel: "Administrador Geral",
    dados: [
      {
        id: "PROD-001",
        sku: "PRD-TEC-001",
        nome: "Teclado Mecânico RGB Pro",
        categoria: "Periféricos",
        quantidade: 45,
        estoqueMinimo: 10,
        precoCusto: 180.0,
        precoVenda: 349.9,
        status: "ativo",
        criadoEm: "2026-05-15T09:00:00.000Z",
        criadoPor: "Renata Souza"
      },
      {
        id: "PROD-002",
        sku: "PRD-MOU-002",
        nome: "Mouse Gamer Sem Fio 16000DPI",
        categoria: "Periféricos",
        quantidade: 8,
        estoqueMinimo: 12,
        precoCusto: 120.0,
        precoVenda: 229.9,
        status: "ativo",
        criadoEm: "2026-05-16T10:30:00.000Z",
        criadoPor: "Luís Fernando"
      }
    ]
  }
];

export function useIntegracoes() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [versoes, setVersoes] = useState<VersaoImportacao[]>(importacoesIniciais);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("erp_importacoes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setVersoes(parsed);
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
      localStorage.setItem("erp_importacoes", JSON.stringify(versoes));
    }
  }, [versoes, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_importacoes");
      if (saved) {
        try {
          setVersoes(JSON.parse(saved));
        } catch (exception) {
          console.error(exception);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const importarNovaVersao = (origem: string, payload: RegistroImportado[]) => {
    if (!origem.trim()) return false;

    const idGerado = `IMP-${String(versoes.length + 1).padStart(3, "0")}`;
    const novaVersao: VersaoImportacao = {
      id: idGerado,
      versao: versoes.length + 1,
      origemImportacao: origem.trim(),
      dataImportacao: new Date().toISOString(),
      statusVersao: "ativa",
      dados: payload,
      usuarioResponsavel: user.name || "Usuário de Integração"
    };

    setVersoes((prev) =>
      prev.map((item) => ({ ...item, statusVersao: "arquivada" as const } as VersaoImportacao)).concat(novaVersao)
    );
    addLog(`Importou nova versão de integração ${idGerado} da origem ${origem.trim()}`, "sistema");
    return true;
  };

  const restaurarVersaoAnterior = (id: string) => {
    const targetVersao = versoes.find((item) => item.id === id);
    if (!targetVersao) return false;

    const savedEstoque = localStorage.getItem("erp_estoque");
    let currentEstoque = [];
    if (savedEstoque) {
      try {
        currentEstoque = JSON.parse(savedEstoque);
      } catch (e) {
        console.error(e);
      }
    }

    const updatedEstoque = currentEstoque.map((estoqueItem: ItemEstoque) => {
      const importItem = targetVersao.dados.find((i) => i.id === estoqueItem.id);
      if (importItem) {
        return {
          ...estoqueItem,
          quantidade: importItem.quantidade,
          precoCusto: importItem.precoCusto,
          precoVenda: importItem.precoVenda
        };
      }
      return estoqueItem;
    });

    localStorage.setItem("erp_estoque", JSON.stringify(updatedEstoque));
    window.dispatchEvent(new Event("storage"));

    setVersoes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, statusVersao: "ativa" as const } : { ...item, statusVersao: "arquivada" as const }
      )
    );

    addLog(`Restaurou a versão de integração ${id}`, "sistema");

    return true;
  };

  return {
    versoes,
    importarNovaVersao,
    restaurarVersaoAnterior
  };
}
