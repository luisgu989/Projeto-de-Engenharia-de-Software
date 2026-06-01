"use client";

import { useState } from "react";

export interface ItemEstoque {
  id: string;
  sku: string;
  nome: string;
  categoria: string;
  quantidade: number;
  estoqueMinimo: number;
  precoCusto: number;
  precoVenda: number;
}

const mockEstoqueInicial: ItemEstoque[] = [
  {
    id: "PROD-001",
    sku: "PRD-TEC-001",
    nome: "Teclado Mecânico RGB Pro",
    categoria: "Periféricos",
    quantidade: 45,
    estoqueMinimo: 10,
    precoCusto: 180.0,
    precoVenda: 349.9,
  },
  {
    id: "PROD-002",
    sku: "PRD-MOU-002",
    nome: "Mouse Gamer Sem Fio 16000DPI",
    categoria: "Periféricos",
    quantidade: 8,
    estoqueMinimo: 12, // LOW STOCK
    precoCusto: 120.0,
    precoVenda: 229.9,
  },
  {
    id: "PROD-003",
    sku: "PRD-MON-003",
    nome: "Monitor 27' IPS 144Hz UltraWide",
    categoria: "Monitores",
    quantidade: 15,
    estoqueMinimo: 5,
    precoCusto: 900.0,
    precoVenda: 1699.0,
  },
  {
    id: "PROD-004",
    sku: "PRD-CAB-004",
    nome: "Cabo HDMI 2.1 Trançado 2m",
    categoria: "Acessórios",
    quantidade: 120,
    estoqueMinimo: 20,
    precoCusto: 15.0,
    precoVenda: 49.9,
  },
  {
    id: "PROD-005",
    sku: "PRD-HEA-005",
    nome: "Headset Noise Cancelling Wireless",
    categoria: "Áudio",
    quantidade: 4,
    estoqueMinimo: 8, // LOW STOCK
    precoCusto: 250.0,
    precoVenda: 499.0,
  },
];

export function useEstoque() {
  const [estoque, setEstoque] = useState<ItemEstoque[]>(mockEstoqueInicial);
  const [busca, setBusca] = useState("");

  const adicionarItem = (novoItem: Omit<ItemEstoque, "id">) => {
    const idGerado = `PROD-00${estoque.length + 1}`;
    const itemCompleto: ItemEstoque = {
      ...novoItem,
      id: idGerado,
    };
    setEstoque((prev) => [...prev, itemCompleto]);
  };

  const ajustarEstoque = (id: string, novaQuantidade: number) => {
    setEstoque((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantidade: Math.max(0, novaQuantidade) } : item
      )
    );
  };

  const estoqueFiltrado = estoque.filter(
    (item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.sku.toLowerCase().includes(busca.toLowerCase()) ||
      item.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  // Calcs
  const valorTotalEstoque = estoque.reduce((acc, item) => acc + item.quantidade * item.precoCusto, 0);
  const totalItens = estoque.reduce((acc, item) => acc + item.quantidade, 0);
  const alertasBaixoEstoque = estoque.filter((item) => item.quantidade <= item.estoqueMinimo).length;

  return {
    estoque: estoqueFiltrado,
    busca,
    setBusca,
    adicionarItem,
    ajustarEstoque,
    valorTotalEstoque,
    totalItens,
    alertasBaixoEstoque,
  };
}
