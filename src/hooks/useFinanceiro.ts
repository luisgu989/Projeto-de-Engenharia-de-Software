"use client";

import { useState, useEffect } from "react";

export type StatusLancamento = "pago" | "pendente" | "vencido";
export type TipoLancamento = "receber" | "pagar";

export interface Lancamento {
  id: string;
  descricao: string;
  tipo: TipoLancamento;
  valor: number;
  vencimento: string;
  status: StatusLancamento;
  categoria: string;
  contraparte: string; // cliente ou fornecedor
}

const mockLancamentos: Lancamento[] = [
  {
    id: "FIN-001",
    descricao: "Fatura Metalúrgica Alfa Ltda",
    tipo: "receber",
    valor: 12500.0,
    vencimento: "2026-06-10",
    status: "pendente",
    categoria: "Vendas",
    contraparte: "Metalúrgica Alfa Ltda",
  },
  {
    id: "FIN-002",
    descricao: "Aluguel Galpão Industrial",
    tipo: "pagar",
    valor: 4800.0,
    vencimento: "2026-06-05",
    status: "pago",
    categoria: "Infraestrutura",
    contraparte: "Imobiliária Centro",
  },
  {
    id: "FIN-003",
    descricao: "Comissão de Vendas — Maio/2026",
    tipo: "pagar",
    valor: 2350.0,
    vencimento: "2026-06-01",
    status: "vencido",
    categoria: "Pessoal",
    contraparte: "Equipe Comercial",
  },
  {
    id: "FIN-004",
    descricao: "Pagamento Arthur H. de Oliveira",
    tipo: "receber",
    valor: 420.5,
    vencimento: "2026-06-15",
    status: "pendente",
    categoria: "Vendas",
    contraparte: "Arthur Henrique de Oliveira",
  },
  {
    id: "FIN-005",
    descricao: "Fornecedor de Periféricos — Lote 12",
    tipo: "pagar",
    valor: 18900.0,
    vencimento: "2026-06-20",
    status: "pendente",
    categoria: "Estoque",
    contraparte: "TechDistrib Ltda",
  },
  {
    id: "FIN-006",
    descricao: "Fatura Clínica Médica Viver Bem",
    tipo: "receber",
    valor: 3890.0,
    vencimento: "2026-05-28",
    status: "vencido",
    categoria: "Vendas",
    contraparte: "Clínica Médica Viver Bem",
  },
];

export function useFinanceiro() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(mockLancamentos);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoLancamento | "todos">("todos");
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("erp_lancamentos_financeiros");
    if (saved) {
      try {
        setLancamentos(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar lancamentos:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_lancamentos_financeiros", JSON.stringify(lancamentos));
    }
  }, [lancamentos, isLoaded]);

  const adicionarLancamento = (novoLancamento: Omit<Lancamento, "id">) => {
    const idGerado = `FIN-${String(lancamentos.length + 1).padStart(3, "0")}`;
    const lancamentoCompleto: Lancamento = { ...novoLancamento, id: idGerado };
    setLancamentos((prev) => [lancamentoCompleto, ...prev]);
    return true;
  };

  const quitarLancamento = (id: string) => {
    setLancamentos((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "pago" } : l))
    );
  };

  const lancamentosFiltrados = lancamentos.filter((l) => {
    const matchBusca =
      l.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      l.contraparte.toLowerCase().includes(busca.toLowerCase()) ||
      l.categoria.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === "todos" || l.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  // Métricas
  const totalReceber = lancamentos
    .filter((l) => l.tipo === "receber" && l.status !== "pago")
    .reduce((acc, l) => acc + l.valor, 0);

  const totalPagar = lancamentos
    .filter((l) => l.tipo === "pagar" && l.status !== "pago")
    .reduce((acc, l) => acc + l.valor, 0);

  const saldoProjetado = lancamentos
    .filter((l) => l.tipo === "receber" && l.status === "pago")
    .reduce((acc, l) => acc + l.valor, 0) -
    lancamentos
    .filter((l) => l.tipo === "pagar" && l.status === "pago")
    .reduce((acc, l) => acc + l.valor, 0);

  const totalVencidos = lancamentos.filter((l) => l.status === "vencido").length;

  return {
    lancamentos: lancamentosFiltrados,
    todosLancamentos: lancamentos, // expor todos para filtros internos
    busca,
    setBusca,
    filtroTipo,
    setFiltroTipo,
    adicionarLancamento,
    quitarLancamento,
    totalReceber,
    totalPagar,
    saldoProjetado,
    totalVencidos,
  };
}
