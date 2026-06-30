"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useLogs } from "@/contexts/logs-context";

export interface MovimentacaoCentro {
  timestamp: string;
  campoAlterado: string;
  valorAntigo: string;
  valorNovo: string;
  usuario: string;
}

export interface CentroCusto {
  id: string;
  codigoCentro: string;
  nomeCentro: string;
  departamentoVinculado: "Financeiro" | "TI" | "Vendas" | "RH" | "Produção" | "Logística" | "Diretoria";
  responsavelFinanceiro: string;
  statusCentro: "ativo" | "inativo";
  categoriaFinanceira: "Operacional" | "Pessoal" | "Investimento" | "Marketing" | "Infraestrutura";
  dataCadastro: string;
  historicoMovimentacoes: MovimentacaoCentro[];
}

export const DEPARTAMENTOS_CENTRO = [
  "Financeiro",
  "TI",
  "Vendas",
  "RH",
  "Produção",
  "Logística",
  "Diretoria",
];

export const CATEGORIAS_CENTRO = [
  "Operacional",
  "Pessoal",
  "Investimento",
  "Marketing",
  "Infraestrutura",
];

const mockCentrosIniciais: CentroCusto[] = [
  {
    id: "CC-902102",
    codigoCentro: "CC-COD-FIN",
    nomeCentro: "Custos do Departamento Financeiro",
    departamentoVinculado: "Financeiro",
    responsavelFinanceiro: "Maria Santos",
    statusCentro: "ativo",
    categoriaFinanceira: "Operacional",
    dataCadastro: "2026-05-15T09:00:00.000Z",
    historicoMovimentacoes: [
      {
        timestamp: "2026-05-15T09:00:00.000Z",
        campoAlterado: "Criação",
        valorAntigo: "-",
        valorNovo: "Cadastro inicial do Centro de Custo CC-COD-FIN.",
        usuario: "Renata Souza",
      }
    ]
  },
  {
    id: "CC-104920",
    codigoCentro: "CC-COD-TI",
    nomeCentro: "Custos de Infraestrutura e Licenças",
    departamentoVinculado: "TI",
    responsavelFinanceiro: "Usuário Suporte",
    statusCentro: "ativo",
    categoriaFinanceira: "Infraestrutura",
    dataCadastro: "2026-05-18T10:00:00.000Z",
    historicoMovimentacoes: [
      {
        timestamp: "2026-05-18T10:00:00.000Z",
        campoAlterado: "Criação",
        valorAntigo: "-",
        valorNovo: "Cadastro inicial do Centro de Custo CC-COD-TI.",
        usuario: "Usuário Suporte",
      }
    ]
  }
];

export function useCentrosCusto() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addNotification } = useNotifications();

  const [centros, setCentros] = useState<CentroCusto[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_centros_custo");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar centros de custo:", e);
        }
      }
    }
    return mockCentrosIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_centros_custo", JSON.stringify(centros));
  }, [centros]);

  // Sync entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_centros_custo");
      if (saved) {
        try { setCentros(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar permissão contábil (Contador, Financeiro ou Admin)
  const verificarAcessoContador = useCallback(() => {
    const cargo = user.cargo?.toLowerCase() || "";
    return (
      user.role === "admin" ||
      cargo.includes("contabil") ||
      cargo.includes("contador") ||
      cargo.includes("financeiro") ||
      user.permissions.visualizarFinanceiro
    );
  }, [user]);

  // Cadastrar Centro de Custo
  const cadastrarCentro = useCallback(
    (
      codigoCentro: string,
      nomeCentro: string,
      departamentoVinculado: CentroCusto["departamentoVinculado"],
      responsavelFinanceiro: string,
      categoriaFinanceira: CentroCusto["categoriaFinanceira"]
    ) => {
      setError(null);

      if (!verificarAcessoContador()) {
        setError("Apenas contadores e administradores financeiros possuem permissão para cadastrar centros de custo.");
        return false;
      }

      const cleanedCodigo = codigoCentro.trim().toUpperCase();
      if (!cleanedCodigo) {
        setError("O código do centro de custo é obrigatório.");
        return false;
      }

      // Validar duplicidade de código
      const jaExisteCodigo = centros.some(
        (c) => c.codigoCentro.trim().toUpperCase() === cleanedCodigo
      );
      if (jaExisteCodigo) {
        setError(`O código "${cleanedCodigo}" já está cadastrado para outro centro de custo.`);
        return false;
      }

      if (!nomeCentro.trim() || nomeCentro.length < 3) {
        setError("Nome do centro de custo inválido (mínimo de 3 caracteres).");
        return false;
      }

      if (!DEPARTAMENTOS_CENTRO.includes(departamentoVinculado)) {
        setError("Departamento vinculado inválido.");
        return false;
      }

      if (!responsavelFinanceiro.trim()) {
        setError("O responsável financeiro é obrigatório.");
        return false;
      }

      if (!CATEGORIAS_CENTRO.includes(categoriaFinanceira)) {
        setError("Categoria financeira inválida.");
        return false;
      }

      const id = `CC-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataAtual = new Date().toISOString();

      const novoCentro: CentroCusto = {
        id,
        codigoCentro: cleanedCodigo,
        nomeCentro: nomeCentro.trim(),
        departamentoVinculado,
        responsavelFinanceiro: responsavelFinanceiro.trim(), // Ficará bloqueado (imutável) após o cadastro
        statusCentro: "ativo",
        categoriaFinanceira,
        dataCadastro: dataAtual,
        historicoMovimentacoes: [
          {
            timestamp: dataAtual,
            campoAlterado: "Criação",
            valorAntigo: "-",
            valorNovo: `Centro cadastrado para o setor ${departamentoVinculado}. Categoria: ${categoriaFinanceira}.`,
            usuario: user.name,
          },
        ],
      };

      setCentros((prev) => [...prev, novoCentro]);

      addLog(`Cadastrou o centro de custo ${cleanedCodigo}`, "financeiro");

      addNotification(
        "Centro de Custo Mapeado",
        `Centro de custo ${cleanedCodigo} cadastrado sob responsabilidade de ${responsavelFinanceiro}.`,
        "success",
        "geral"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [centros, user, verificarAcessoContador, addNotification]
  );

  // Editar Centro de Custo
  const editarCentro = useCallback(
    (
      id: string,
      novosDados: {
        nomeCentro: string;
        departamentoVinculado: CentroCusto["departamentoVinculado"];
        categoriaFinanceira: CentroCusto["categoriaFinanceira"];
        statusCentro: CentroCusto["statusCentro"];
      }
    ) => {
      setError(null);

      if (!verificarAcessoContador()) {
        setError("Apenas contadores e administradores de faturamento podem modificar centros de custo.");
        return false;
      }

      const centro = centros.find((c) => c.id === id);
      if (!centro) {
        setError("Centro de custo não encontrado.");
        return false;
      }

      if (!novosDados.nomeCentro.trim() || novosDados.nomeCentro.length < 3) {
        setError("Nome do centro de custo inválido.");
        return false;
      }

      if (!DEPARTAMENTOS_CENTRO.includes(novosDados.departamentoVinculado)) {
        setError("Departamento vinculado inválido.");
        return false;
      }

      if (!CATEGORIAS_CENTRO.includes(novosDados.categoriaFinanceira)) {
        setError("Categoria financeira inválida.");
        return false;
      }

      const dataAtual = new Date().toISOString();
      const logsAlteracao: MovimentacaoCentro[] = [];

      if (centro.nomeCentro !== novosDados.nomeCentro.trim()) {
        logsAlteracao.push({
          timestamp: dataAtual,
          campoAlterado: "Nome",
          valorAntigo: centro.nomeCentro,
          valorNovo: novosDados.nomeCentro.trim(),
          usuario: user.name,
        });
      }

      if (centro.departamentoVinculado !== novosDados.departamentoVinculado) {
        logsAlteracao.push({
          timestamp: dataAtual,
          campoAlterado: "Departamento",
          valorAntigo: centro.departamentoVinculado,
          valorNovo: novosDados.departamentoVinculado,
          usuario: user.name,
        });
      }

      if (centro.categoriaFinanceira !== novosDados.categoriaFinanceira) {
        logsAlteracao.push({
          timestamp: dataAtual,
          campoAlterado: "Categoria",
          valorAntigo: centro.categoriaFinanceira,
          valorNovo: novosDados.categoriaFinanceira,
          usuario: user.name,
        });
      }

      if (centro.statusCentro !== novosDados.statusCentro) {
        logsAlteracao.push({
          timestamp: dataAtual,
          campoAlterado: "Status",
          valorAntigo: centro.statusCentro,
          valorNovo: novosDados.statusCentro,
          usuario: user.name,
        });
      }

      setCentros((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            // responsavelFinanceiro e codigoCentro permanecem completamente IMUTÁVEIS
            return {
              ...c,
              nomeCentro: novosDados.nomeCentro.trim(),
              departamentoVinculado: novosDados.departamentoVinculado,
              categoriaFinanceira: novosDados.categoriaFinanceira,
              statusCentro: novosDados.statusCentro,
              historicoMovimentacoes: [...logsAlteracao, ...c.historicoMovimentacoes],
            };
          }
          return c;
        })
      );

      addLog(`Editou o centro de custo ${id}`, "financeiro");

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [centros, user, verificarAcessoContador]
  );

  return {
    centros,
    error,
    setError,
    cadastrarCentro,
    editarCentro,
    verificarAcessoContador,
  };
}
