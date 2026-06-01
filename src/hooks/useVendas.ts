"use client";

import { useState } from "react";

export interface Venda {
  id: string;
  cliente: string;
  data: string;
  itens: number;
  valorTotal: number;
  status: "confirmado" | "pendente" | "cancelado";
  metodoPagamento: string;
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
  },
  {
    id: "VEN-2026-002",
    cliente: "Carlos Souza",
    data: "2026-06-01T11:15:00",
    itens: 1,
    valorTotal: 420.5,
    status: "pendente",
    metodoPagamento: "Boleto",
  },
  {
    id: "VEN-2026-003",
    cliente: "Juliana Santos",
    data: "2026-05-31T17:40:00",
    itens: 12,
    valorTotal: 3890.0,
    status: "confirmado",
    metodoPagamento: "Cartão de Crédito",
  },
  {
    id: "VEN-2026-004",
    cliente: "Marcos Oliveira",
    data: "2026-05-31T10:20:00",
    itens: 2,
    valorTotal: 150.0,
    status: "cancelado",
    metodoPagamento: "Pix",
  },
  {
    id: "VEN-2026-005",
    cliente: "Fernanda Lima",
    data: "2026-05-30T15:10:00",
    itens: 5,
    valorTotal: 840.0,
    status: "confirmado",
    metodoPagamento: "Cartão de Crédito",
  },
];

export function useVendas() {
  const [vendas, setVendas] = useState<Venda[]>(mockVendasIniciais);
  const [busca, setBusca] = useState("");

  const adicionarVenda = (novaVenda: Omit<Venda, "id" | "data">) => {
    const dataAtual = new Date().toISOString();
    const idGerado = `VEN-2026-00${vendas.length + 1}`;
    const vendaCompleta: Venda = {
      ...novaVenda,
      id: idGerado,
      data: dataAtual,
    };
    setVendas((prev) => [vendaCompleta, ...prev]);
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
