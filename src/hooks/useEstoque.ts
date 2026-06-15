"use client";

import { useState, useEffect, useCallback } from "react";
import { useLogs } from "@/contexts/logs-context";
import { useAuth } from "@/contexts/auth-context";

export interface MovimentacaoEstoque {
  id?: string;
  tipo: "entrada" | "saida" | "transferencia" | "ajuste";
  quantidade: number;
  deposito?: string;
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
  status: "ativo" | "excluido";
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
    status: "ativo",
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
    status: "ativo",
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
        usuario: "Usuário Suporte",
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
    status: "ativo",
    criadoEm: "2026-05-17T11:45:00.000Z",
    criadoPor: "Usuário Suporte",
    movimentacoes: [
      {
        tipo: "entrada",
        quantidade: 15,
        motivo: "Transferência CD Campinas",
        data: "2026-05-17T11:45:00.000Z",
        usuario: "Usuário Suporte",
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
    status: "ativo",
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
    status: "ativo",
    criadoEm: "2026-05-19T14:20:00.000Z",
    criadoPor: "Luís Fernando",
    atualizadoEm: "2026-05-20T16:00:00.000Z",
    atualizadoPor: "Usuário Suporte",
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
        usuario: "Usuário Suporte",
      },
    ],
  },
];

export function useEstoque() {
  const { addLog } = useLogs();
  const { user } = useAuth();
  
  const [estoque, setEstoque] = useState<ItemEstoque[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_estoque");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar estoque:", e);
        }
      }
    }
    return mockEstoqueInicial;
  });

  useEffect(() => {
    localStorage.setItem("erp_estoque", JSON.stringify(estoque));
  }, [estoque]);

  // Sync state across storage events (tabs / simulation)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_estoque");
      if (saved) {
        try {
          setEstoque(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const checkDuplicateSku = useCallback((sku: string, excludeId?: string) => {
    const cleanedSku = sku.trim().toUpperCase();
    if (!cleanedSku) return false;
    return estoque.some(
      (item) => item.status === "ativo" && item.id !== excludeId && item.sku.trim().toUpperCase() === cleanedSku
    );
  }, [estoque]);

  const adicionarItem = useCallback((
    novoItem: Omit<ItemEstoque, "id" | "status" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor" | "movimentacoes">
  ) => {
    setError(null);
    if (checkDuplicateSku(novoItem.sku)) {
      setError(`O SKU "${novoItem.sku.trim().toUpperCase()}" já está cadastrado para outro produto.`);
      return false;
    }

    const idGerado = `PROD-00${estoque.length + 1}-${Math.floor(Math.random() * 100)}`;
    const dataAtual = new Date().toISOString();
    const itemCompleto: ItemEstoque = {
      ...novoItem,
      sku: novoItem.sku.trim().toUpperCase(),
      id: idGerado,
      status: "ativo",
      criadoEm: dataAtual,
      criadoPor: user.name,
      movimentacoes: [
        {
          tipo: "entrada",
          quantidade: novoItem.quantidade,
          motivo: "Saldo de abertura de cadastro",
          data: dataAtual,
          usuario: user.name,
        },
      ],
    };
    setEstoque((prev) => [...prev, itemCompleto]);
    addLog(
      `Cadastrou o produto ${novoItem.nome} (SKU: ${novoItem.sku.trim().toUpperCase()}) com estoque inicial de ${novoItem.quantidade} un.`,
      "estoque"
    );
    return true;
  }, [estoque, user, addLog, checkDuplicateSku]);

  const atualizarItem = useCallback((
    id: string,
    dadosAlterados: Omit<ItemEstoque, "id" | "status" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor" | "movimentacoes">
  ) => {
    setError(null);
    if (checkDuplicateSku(dadosAlterados.sku, id)) {
      setError(`O SKU "${dadosAlterados.sku.trim().toUpperCase()}" já está cadastrado para outro produto.`);
      return false;
    }

    const dataAtual = new Date().toISOString();
    const oldItem = estoque.find((i) => i.id === id);

    setEstoque((prev) =>
      prev.map((item) => {
        if (item.id === id) {
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
                usuario: user.name,
              },
            ];
          }

          return {
            ...item,
            ...dadosAlterados,
            sku: dadosAlterados.sku.trim().toUpperCase(),
            atualizadoEm: dataAtual,
            atualizadoPor: user.name,
            movimentacoes: novasMovs,
          };
        }
        return item;
      })
    );

    if (oldItem) {
      addLog(
        `Atualizou os dados de cadastro do produto ${dadosAlterados.nome} (SKU: ${dadosAlterados.sku})`,
        "estoque"
      );
    }
    return true;
  }, [estoque, user, addLog, checkDuplicateSku]);

  const registrarMovimentacao = useCallback((
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
    const item = estoque.find((i) => i.id === id);
    if (!item) return false;

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
            id: `MOV-${Math.floor(100000 + Math.random() * 900000)}`,
            tipo,
            quantidade,
            deposito: "Depósito Central",
            motivo: motivo.trim() || (tipo === "entrada" ? "Entrada de estoque" : "Saída de estoque"),
            data: dataAtual,
            usuario: user.name,
          };

          return {
            ...item,
            quantidade: novaQtd,
            atualizadoEm: dataAtual,
            atualizadoPor: user.name,
            movimentacoes: [...(item.movimentacoes || []), novaMov],
          };
        }
        return item;
      })
    );

    if (sucesso) {
      addLog(
        `Registrou ${tipo === "entrada" ? "entrada" : "saída"} de ${quantidade} un. do produto ${item.nome} - Motivo: ${motivo}`,
        "estoque"
      );
    }

    return sucesso;
  }, [estoque, user, addLog]);

  const registrarMovimentacaoEstoque = useCallback((
    produtoId: string,
    tipo: "entrada" | "saida" | "transferencia" | "ajuste",
    quantidade: number,
    deposito: string,
    motivo: string
  ) => {
    setError(null);
    if (quantidade <= 0) {
      setError("A quantidade deve ser maior que zero.");
      return false;
    }

    const item = estoque.find((i) => i.id === produtoId && i.status === "ativo");
    if (!item) {
      setError("Produto não encontrado.");
      return false;
    }

    if ((tipo === "saida" || tipo === "transferencia") && item.quantidade < quantidade) {
      setError(`Saldo insuficiente. O produto possui apenas ${item.quantidade} unidades.`);
      return false;
    }

    const dataAtual = new Date().toISOString();
    const movId = `MOV-${Math.floor(100000 + Math.random() * 900000)}`;

    setEstoque((prev) =>
      prev.map((i) => {
        if (i.id === produtoId) {
          let novaQtd = i.quantidade;
          if (tipo === "entrada") {
            novaQtd += quantidade;
          } else if (tipo === "saida") {
            novaQtd -= quantidade;
          } else if (tipo === "transferencia") {
            // Transfer stays same total
          } else if (tipo === "ajuste") {
            novaQtd += quantidade;
          }

          const novaMov: MovimentacaoEstoque = {
            id: movId,
            tipo,
            quantidade,
            deposito,
            motivo: motivo.trim() || `${tipo.toUpperCase()} de estoque`,
            data: dataAtual,
            usuario: user.name,
          };

          return {
            ...i,
            quantidade: novaQtd,
            atualizadoEm: dataAtual,
            atualizadoPor: user.name,
            movimentacoes: [...(i.movimentacoes || []), novaMov],
          };
        }
        return i;
      })
    );

    addLog(
      `Movimentação de estoque registrada (${tipo}): ${quantidade} un. do produto ${item.nome} no depósito ${deposito}. Motivo: ${motivo}`,
      "estoque"
    );
    return true;
  }, [estoque, user, addLog]);

  const ajustarEstoque = useCallback((id: string, novaQuantidade: number) => {
    const dataAtual = new Date().toISOString();
    const item = estoque.find((i) => i.id === id);
    if (!item) return;

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
                usuario: user.name,
              },
            ];
          }

          return {
            ...item,
            quantidade: Math.max(0, novaQuantidade),
            atualizadoEm: dataAtual,
            atualizadoPor: user.name,
            movimentacoes: novasMovs,
          };
        }
        return item;
      })
    );

    addLog(
      `Ajustou o saldo do produto ${item.nome} de ${item.quantidade} un. para ${novaQuantidade} un.`,
      "estoque"
    );
  }, [estoque, user, addLog]);

  const removerItem = useCallback((id: string) => {
    setError(null);
    const item = estoque.find((item) => item.id === id && item.status === "ativo");
    if (!item) {
      setError("Produto não encontrado ou já excluído.");
      return false;
    }

    setEstoque((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: "excluido",
            atualizadoEm: new Date().toISOString(),
            atualizadoPor: user.name,
          };
        }
        return item;
      })
    );

    addLog(`Excluiu o produto ${item.nome} (SKU: ${item.sku}) do catálogo de ativos`, "estoque");
    return true;
  }, [estoque, user, addLog]);

  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const estoqueFiltrado = estoque
    .filter((item) => item.status === "ativo")
    .filter(
      (item) =>
        item.nome.toLowerCase().includes(busca.toLowerCase()) ||
        item.sku.toLowerCase().includes(busca.toLowerCase()) ||
        item.categoria.toLowerCase().includes(busca.toLowerCase())
    );

  const itensAtivos = estoque.filter((item) => item.status === "ativo");
  const valorTotalEstoque = itensAtivos.reduce((acc, item) => acc + item.quantidade * item.precoCusto, 0);
  const totalItens = itensAtivos.reduce((acc, item) => acc + item.quantidade, 0);
  const alertasBaixoEstoque = itensAtivos.filter((item) => item.quantidade <= item.estoqueMinimo).length;

  return {
    estoque: estoqueFiltrado,
    todosItens: estoque, // Para relatórios gerais
    busca,
    setBusca,
    error,
    setError,
    adicionarItem,
    atualizarItem,
    removerItem,
    registrarMovimentacao,
    registrarMovimentacaoEstoque,
    ajustarEstoque,
    valorTotalEstoque,
    totalItens,
    alertasBaixoEstoque,
  };
}
