"use client";

import { useState } from "react";
import { useEstoque } from "./useEstoque";

export interface ProdutoVenda {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Venda {
  id: string;
  cliente: string;
  data: string;
  itens: number;
  valorTotal: number;
  status: "confirmado" | "pendente" | "cancelado";
  metodoPagamento: string;
  produtos?: ProdutoVenda[];
}

const mockVendasIniciais: Venda[] = [
  {
    id: "VEN-2026-001",
    cliente: "Ana Silva",
    data: "2026-06-01T14:32:00",
    itens: 3,
    valorTotal: 1250.0,
    status: "confirmado",
    metodoPagamento: "Pix",
    produtos: [
      { produtoId: "PROD-001", nome: "Teclado Mecânico RGB Pro", quantidade: 2, precoUnitario: 349.9 },
      { produtoId: "PROD-003", nome: "Monitor 27' IPS 144Hz UltraWide", quantidade: 1, precoUnitario: 550.2 },
    ],
  },
  {
    id: "VEN-2026-002",
    cliente: "Carlos Souza",
    data: "2026-06-01T11:15:00",
    itens: 1,
    valorTotal: 420.5,
    status: "pendente",
    metodoPagamento: "Boleto",
    produtos: [
      { produtoId: "PROD-005", nome: "Headset Noise Cancelling Wireless", quantidade: 1, precoUnitario: 420.5 },
    ],
  },
  {
    id: "VEN-2026-003",
    cliente: "Juliana Santos",
    data: "2026-05-31T17:40:00",
    itens: 12,
    valorTotal: 3890.0,
    status: "confirmado",
    metodoPagamento: "Cartão de Crédito",
    produtos: [
      { produtoId: "PROD-002", nome: "Mouse Gamer Sem Fio 16000DPI", quantidade: 10, precoUnitario: 229.9 },
      { produtoId: "PROD-003", nome: "Monitor 27' IPS 144Hz UltraWide", quantidade: 2, precoUnitario: 795.5 },
    ],
  },
  {
    id: "VEN-2026-004",
    cliente: "Marcos Oliveira",
    data: "2026-05-31T10:20:00",
    itens: 2,
    valorTotal: 150.0,
    status: "cancelado",
    metodoPagamento: "Pix",
    produtos: [
      { produtoId: "PROD-004", nome: "Cabo HDMI 2.1 Trançado 2m", quantidade: 2, precoUnitario: 75.0 },
    ],
  },
  {
    id: "VEN-2026-005",
    cliente: "Fernanda Lima",
    data: "2026-05-30T15:10:00",
    itens: 5,
    valorTotal: 840.0,
    status: "confirmado",
    metodoPagamento: "Cartão de Crédito",
    produtos: [
      { produtoId: "PROD-001", nome: "Teclado Mecânico RGB Pro", quantidade: 2, precoUnitario: 349.9 },
      { produtoId: "PROD-004", nome: "Cabo HDMI 2.1 Trançado 2m", quantidade: 3, precoUnitario: 46.73 },
    ],
  },
];

export function useVendas() {
  const [vendas, setVendas] = useState<Venda[]>(mockVendasIniciais);
  const [busca, setBusca] = useState("");
  const { estoque, registrarMovimentacaoEstoque, setError: setEstoqueError } = useEstoque();

  const adicionarVenda = (novaVenda: Omit<Venda, "id" | "data">) => {
    // Se a venda estiver sendo confirmada e tiver produtos, precisamos validar o estoque e dar baixa
    if (novaVenda.status === "confirmado" && novaVenda.produtos && novaVenda.produtos.length > 0) {
      // Validar disponibilidade de estoque para todos os itens primeiro
      for (const prodVenda of novaVenda.produtos) {
        const itemEstoque = estoque.find((i) => i.id === prodVenda.produtoId);
        if (!itemEstoque) {
          setEstoqueError(`Produto ${prodVenda.nome} não encontrado no estoque.`);
          return false;
        }
        if (itemEstoque.quantidade < prodVenda.quantidade) {
          setEstoqueError(`Saldo insuficiente para o produto ${itemEstoque.nome}. Estoque atual: ${itemEstoque.quantidade}.`);
          return false;
        }
      }

      // Se passou na validação, vamos realizar a baixa
      for (const prodVenda of novaVenda.produtos) {
        registrarMovimentacaoEstoque(
          prodVenda.produtoId,
          "saida",
          prodVenda.quantidade,
          "Depósito Central",
          `Venda`
        );
      }
    }

    const dataAtual = new Date().toISOString();
    const idGerado = `VEN-2026-00${vendas.length + 1}`;
    
    // Atualizar o motivo da movimentação com o ID gerado (já fizemos a movimentação, 
    // mas se quiséssemos atrelar perfeitamente, poderíamos passar o ID da venda no motivo)
    // Para simplificar, registramos apenas "Venda" acima.

    const vendaCompleta: Venda = {
      ...novaVenda,
      id: idGerado,
      data: dataAtual,
    };
    setVendas((prev) => [vendaCompleta, ...prev]);
    return true;
  };

  const vendasFiltradas = vendas.filter(
    (venda) =>
      venda.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      venda.id.toLowerCase().includes(busca.toLowerCase())
  );

  // Calcs
  const faturamentoTotal = vendas
    .filter((v) => v.status === "confirmado")
    .reduce((acc, v) => acc + v.valorTotal, 0);

  const ticketMedio =
    vendas.filter((v) => v.status === "confirmado").length > 0
      ? faturamentoTotal / vendas.filter((v) => v.status === "confirmado").length
      : 0;

  return {
    vendas: vendasFiltradas,
    busca,
    setBusca,
    adicionarVenda,
    faturamentoTotal,
    ticketMedio,
  };
}
