"use client";

import { useState } from "react";

export interface MovimentacaoEstoque {
  tipo: "entrada" | "saida";
  quantidade: number;
  motivo: string;
  data: string;
  usuario: string;
}

export interface ItemEstoque {
  id: string;
  sku: string;
  nome: string;
  categoria: string;
  quantidade: number;
  estoqueMinimo: number;
  precoCusto: number;
  precoVenda: number;
  // Audit details
  criadoEm: string;
  criadoPor: string;
  atualizadoEm?: string;
  atualizadoPor?: string;
  movimentacoes?: MovimentacaoEstoque[];
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
    criadoEm: "2026-05-15T09:00:00.000Z",
    criadoPor: "Renata Souza",
    movimentacoes: [
      {
        tipo: "entrada",
        quantidade: 50,
        motivo: "Lote de importação inicial",
        data: "2026-05-15T09:00:00.000Z",
        usuario: "Renata Souza",
      },
      {
        tipo: "saida",
        quantidade: 5,
        motivo: "Venda cupom #8832",
        data: "2026-05-20T14:30:00.000Z",
        usuario: "Luís Fernando",
      },
    ],
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
    criadoEm: "2026-05-16T10:30:00.000Z",
    criadoPor: "Luís Fernando",
    movimentacoes: [
      {
        tipo: "entrada",
        quantidade: 10,
        motivo: "Compra fornecedor TechDistrib",
        data: "2026-05-16T10:30:00.000Z",
        usuario: "Luís Fernando",
      },
      {
        tipo: "saida",
        quantidade: 2,
        motivo: "Uso interno TI",
        data: "2026-05-18T16:00:00.000Z",
        usuario: "Admin User",
      },
    ],
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
    criadoEm: "2026-05-17T11:45:00.000Z",
    criadoPor: "Admin User",
    movimentacoes: [
      {
        tipo: "entrada",
        quantidade: 15,
        motivo: "Transferência CD Campinas",
        data: "2026-05-17T11:45:00.000Z",
        usuario: "Admin User",
      },
    ],
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
    criadoEm: "2026-05-18T08:15:00.000Z",
    criadoPor: "Renata Souza",
    movimentacoes: [
      {
        tipo: "entrada",
        quantidade: 120,
        motivo: "Lote reposição",
        data: "2026-05-18T08:15:00.000Z",
        usuario: "Renata Souza",
      },
    ],
  },
  {
    id: "PROD-005",
    sku: "PRD-HEA-005",
    nome: "Headset Noise Cancelling Wireless",
    categoria: "Áudio",
    quantidade: 4,
    estoqueMinimo: 8,
    precoCusto: 250.0,
    precoVenda: 499.0,
    criadoEm: "2026-05-19T14:20:00.000Z",
    criadoPor: "Luís Fernando",
    atualizadoEm: "2026-05-20T16:00:00.000Z",
    atualizadoPor: "Admin User",
    movimentacoes: [
      {
        tipo: "entrada",
        quantidade: 6,
        motivo: "Entrada inicial de mostruário",
        data: "2026-05-19T14:20:00.000Z",
        usuario: "Luís Fernando",
      },
      {
        tipo: "saida",
        quantidade: 2,
        motivo: "Venda cupom #8911",
        data: "2026-05-20T16:00:00.000Z",
        usuario: "Admin User",
      },
    ],
  },
];

export function useEstoque() {
  const [estoque, setEstoque] = useState<ItemEstoque[]>(mockEstoqueInicial);
  const [busca, setBusca] = useState("");
  const [error, setError] = useState<string | null>(null);

  const checkDuplicateSku = (sku: string, excludeId?: string) => {
    const cleanedSku = sku.trim().toUpperCase();
    if (!cleanedSku) return false;
    return estoque.some(
      (item) => item.id !== excludeId && item.sku.trim().toUpperCase() === cleanedSku
    );
  };

  const adicionarItem = (
    novoItem: Omit<ItemEstoque, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor" | "movimentacoes">
  ) => {
    setError(null);
    if (checkDuplicateSku(novoItem.sku)) {
      setError(`O SKU "${novoItem.sku.trim().toUpperCase()}" já está cadastrado para outro produto.`);
      return false;
    }

    const idGerado = `PROD-00${estoque.length + 1}`;
    const dataAtual = new Date().toISOString();
    const itemCompleto: ItemEstoque = {
      ...novoItem,
      sku: novoItem.sku.trim().toUpperCase(),
      id: idGerado,
      criadoEm: dataAtual,
      criadoPor: "Admin User",
      movimentacoes: [
        {
          tipo: "entrada",
          quantidade: novoItem.quantidade,
          motivo: "Saldo de abertura de cadastro",
          data: dataAtual,
          usuario: "Admin User",
        },
      ],
    };
    setEstoque((prev) => [...prev, itemCompleto]);
    return true;
  };

  const atualizarItem = (
    id: string,
    dadosAlterados: Omit<ItemEstoque, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor" | "movimentacoes">
  ) => {
    setError(null);
    if (checkDuplicateSku(dadosAlterados.sku, id)) {
      setError(`O SKU "${dadosAlterados.sku.trim().toUpperCase()}" já está cadastrado para outro produto.`);
      return false;
    }

    const dataAtual = new Date().toISOString();
    setEstoque((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // If quantity has changed inside the general edit modal, register it as a direct adjustment movement
          const qtdDiferenca = dadosAlterados.quantidade - item.quantidade;
          let novasMovs = item.movimentacoes || [];
          if (qtdDiferenca !== 0) {
            novasMovs = [
              ...novasMovs,
              {
                tipo: qtdDiferenca > 0 ? "entrada" : "saida",
                quantidade: Math.abs(qtdDiferenca),
                motivo: "Ajuste manual de cadastro completo",
                data: dataAtual,
                usuario: "Admin User",
              },
            ];
          }

          return {
            ...item,
            ...dadosAlterados,
            sku: dadosAlterados.sku.trim().toUpperCase(),
            atualizadoEm: dataAtual,
            atualizadoPor: "Admin User",
            movimentacoes: novasMovs,
          };
        }
        return item;
      })
    );
    return true;
  };

  const registrarMovimentacao = (
    id: string,
    tipo: "entrada" | "saida",
    quantidade: number,
    motivo: string
  ) => {
    setError(null);
    if (quantidade <= 0) {
      setError("A quantidade deve ser maior que zero.");
      return false;
    }

    const dataAtual = new Date().toISOString();
    let sucesso = true;

    setEstoque((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const novaQtd = tipo === "entrada" 
            ? item.quantidade + quantidade 
            : item.quantidade - quantidade;

          if (novaQtd < 0) {
            setError(`Saldo insuficiente. O produto possui apenas ${item.quantidade} unidades.`);
            sucesso = false;
            return item;
          }

          const novaMov: MovimentacaoEstoque = {
            tipo,
            quantidade,
            motivo: motivo.trim() || (tipo === "entrada" ? "Entrada de estoque" : "Saída de estoque"),
            data: dataAtual,
            usuario: "Admin User",
          };

          return {
            ...item,
            quantidade: novaQtd,
            atualizadoEm: dataAtual,
            atualizadoPor: "Admin User",
            movimentacoes: [...(item.movimentacoes || []), novaMov],
          };
        }
        return item;
      })
    );

    return sucesso;
  };

  const ajustarEstoque = (id: string, novaQuantidade: number) => {
    const dataAtual = new Date().toISOString();
    setEstoque((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const qtdDiferenca = novaQuantidade - item.quantidade;
          let novasMovs = item.movimentacoes || [];
          if (qtdDiferenca !== 0) {
            novasMovs = [
              ...novasMovs,
              {
                tipo: qtdDiferenca > 0 ? "entrada" : "saida",
                quantidade: Math.abs(qtdDiferenca),
                motivo: "Ajuste físico direto",
                data: dataAtual,
                usuario: "Admin User",
              },
            ];
          }

          return {
            ...item,
            quantidade: Math.max(0, novaQuantidade),
            atualizadoEm: dataAtual,
            atualizadoPor: "Admin User",
            movimentacoes: novasMovs,
          };
        }
        return item;
      })
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
    error,
    setError,
    adicionarItem,
    atualizarItem,
    registrarMovimentacao,
    ajustarEstoque,
    valorTotalEstoque,
    totalItens,
    alertasBaixoEstoque,
  };
}
