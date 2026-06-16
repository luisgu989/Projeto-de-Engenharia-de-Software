"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";

export interface LogAlteracaoTabela {
  timestamp: string;
  campoAlterado: string;
  valorAntigo: string;
  valorNovo: string;
  usuario: string;
}

export interface TabelaPreco {
  id: string;
  codigoTabela: string;
  nomeTabela: string;
  regiaoAplicavel: "Sul" | "Sudeste" | "Centro-Oeste" | "Nordeste" | "Norte";
  clienteVinculado: string; // ID do Cliente (Ex: CLI-001) - Imutável pós-salvamento
  produtoAssociado: string; // ID do Produto (Ex: PROD-001)
  statusTabela: "ativa" | "inativa";
  dataAtualizacao: string;
  historicoAlteracoes: LogAlteracaoTabela[];
}

export const REGIOES_TABELA = ["Sul", "Sudeste", "Centro-Oeste", "Nordeste", "Norte"];

const mockTabelasIniciais: TabelaPreco[] = [
  {
    id: "TAB-771023",
    codigoTabela: "TP-SUL-TEC",
    nomeTabela: "Tabela Especial Teclados Regional Sul",
    regiaoAplicavel: "Sul",
    clienteVinculado: "CLI-001",
    produtoAssociado: "PROD-001",
    statusTabela: "ativa",
    dataAtualizacao: "2026-06-01T10:00:00.000Z",
    historicoAlteracoes: [
      {
        timestamp: "2026-06-01T10:00:00.000Z",
        campoAlterado: "Criação",
        valorAntigo: "-",
        valorNovo: "Tabela cadastrada com regras especiais de frete para Metalúrgica Alfa.",
        usuario: "Renata Souza",
      }
    ]
  },
  {
    id: "TAB-391204",
    codigoTabela: "TP-SE-MOU",
    nomeTabela: "Tabela Promocional Mouses Sudeste",
    regiaoAplicavel: "Sudeste",
    clienteVinculado: "CLI-002",
    produtoAssociado: "PROD-002",
    statusTabela: "ativa",
    dataAtualizacao: "2026-06-10T15:30:00.000Z",
    historicoAlteracoes: [
      {
        timestamp: "2026-06-10T15:30:00.000Z",
        campoAlterado: "Criação",
        valorAntigo: "-",
        valorNovo: "Tabela promocional criada para o cliente Arthur Henrique.",
        usuario: "Maria Santos",
      }
    ]
  }
];

export function useTabelasPrecos() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [tabelas, setTabelas] = useState<TabelaPreco[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_tabelas_precos");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar tabelas de preço:", e);
        }
      }
    }
    return mockTabelasIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_tabelas_precos", JSON.stringify(tabelas));
  }, [tabelas]);

  // Sync entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_tabelas_precos");
      if (saved) {
        try { setTabelas(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar permissão comercial (Admin, Gerente, Vendedor, Comercial)
  const verificarAcessoComercial = useCallback(() => {
    const cargo = user.cargo?.toLowerCase() || "";
    return (
      user.role === "admin" ||
      cargo.includes("comercial") ||
      cargo.includes("vendas") ||
      cargo.includes("vendedor") ||
      cargo.includes("gerente") ||
      cargo.includes("diretor")
    );
  }, [user]);

  // Cadastrar nova tabela de preços
  const cadastrarTabela = useCallback(
    (
      codigoTabela: string,
      nomeTabela: string,
      regiaoAplicavel: TabelaPreco["regiaoAplicavel"],
      clienteVinculado: string,
      produtoAssociado: string
    ) => {
      setError(null);

      if (!verificarAcessoComercial()) {
        setError("Apenas gerentes e profissionais comerciais possuem permissão para configurar regras de tabelas de preços.");
        return false;
      }

      const cleanedCodigo = codigoTabela.trim().toUpperCase();
      if (!cleanedCodigo) {
        setError("O código da tabela é obrigatório.");
        return false;
      }

      // Validar duplicidade de código
      const jaExisteCodigo = tabelas.some(
        (t) => t.codigoTabela.trim().toUpperCase() === cleanedCodigo
      );
      if (jaExisteCodigo) {
        setError(`A tabela de preços com código "${cleanedCodigo}" já está cadastrada.`);
        return false;
      }

      if (!nomeTabela.trim() || nomeTabela.length < 3) {
        setError("Nome da tabela de preços inválido (mínimo de 3 caracteres).");
        return false;
      }

      if (!REGIOES_TABELA.includes(regiaoAplicavel)) {
        setError("Região aplicável inválida.");
        return false;
      }

      if (!clienteVinculado) {
        setError("O cliente vinculado é obrigatório.");
        return false;
      }

      if (!produtoAssociado) {
        setError("O produto associado é obrigatório.");
        return false;
      }

      // Validar conflito de cenários (mesmo produto + mesmo cliente OU mesmo produto + mesma região)
      const jaExisteConflito = tabelas.some(
        (t) =>
          t.statusTabela === "ativa" &&
          t.produtoAssociado === produtoAssociado &&
          (t.clienteVinculado === clienteVinculado || t.regiaoAplicavel === regiaoAplicavel)
      );

      if (jaExisteConflito) {
        setError("Erro de conflito comercial: Já existe uma tabela de preços ativa mapeando as mesmas regras de produto para este cliente ou região.");
        return false;
      }

      const id = `TAB-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataAtual = new Date().toISOString();

      const novaTabela: TabelaPreco = {
        id,
        codigoTabela: cleanedCodigo,
        nomeTabela: nomeTabela.trim(),
        regiaoAplicavel,
        clienteVinculado, // Bloqueado pós-cadastro
        produtoAssociado,
        statusTabela: "ativa",
        dataAtualizacao: dataAtual,
        historicoAlteracoes: [
          {
            timestamp: dataAtual,
            campoAlterado: "Criação",
            valorAntigo: "-",
            valorNovo: `Tabela comercial ativada para região ${regiaoAplicavel} e cliente ${clienteVinculado}.`,
            usuario: user.name,
          },
        ],
      };

      setTabelas((prev) => [novaTabela, ...prev]);

      addNotification(
        "Tabela de Preços Cadastrada",
        `Nova regra comercial ${cleanedCodigo} ativada para o produto ${produtoAssociado}.`,
        "success",
        "geral"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [tabelas, user, verificarAcessoComercial, addNotification]
  );

  // Editar Tabela de Preços
  const editarTabela = useCallback(
    (
      id: string,
      novosDados: {
        nomeTabela: string;
        regiaoAplicavel: TabelaPreco["regiaoAplicavel"];
        produtoAssociado: string;
        statusTabela: TabelaPreco["statusTabela"];
      }
    ) => {
      setError(null);

      if (!verificarAcessoComercial()) {
        setError("Apenas profissionais de faturamento e gerentes comerciais podem modificar tabelas de preços.");
        return false;
      }

      const tabela = tabelas.find((t) => t.id === id);
      if (!tabela) {
        setError("Tabela de preços não encontrada.");
        return false;
      }

      if (!novosDados.nomeTabela.trim() || novosDados.nomeTabela.length < 3) {
        setError("Nome da tabela de preços inválido.");
        return false;
      }

      if (!REGIOES_TABELA.includes(novosDados.regiaoAplicavel)) {
        setError("Região aplicável inválida.");
        return false;
      }

      if (!novosDados.produtoAssociado) {
        setError("O produto associado é obrigatório.");
        return false;
      }

      // Validar conflito excluindo a própria tabela em edição
      const jaExisteConflito = tabelas.some(
        (t) =>
          t.id !== id &&
          t.statusTabela === "ativa" &&
          novosDados.statusTabela === "ativa" &&
          t.produtoAssociado === novosDados.produtoAssociado &&
          (t.clienteVinculado === tabela.clienteVinculado || t.regiaoAplicavel === novosDados.regiaoAplicavel)
      );

      if (jaExisteConflito) {
        setError("Erro de conflito comercial: A alteração causaria sobreposição de preços com outra tabela ativa.");
        return false;
      }

      const dataAtual = new Date().toISOString();
      const logsAlteracao: LogAlteracaoTabela[] = [];

      if (tabela.nomeTabela !== novosDados.nomeTabela.trim()) {
        logsAlteracao.push({
          timestamp: dataAtual,
          campoAlterado: "Nome",
          valorAntigo: tabela.nomeTabela,
          valorNovo: novosDados.nomeTabela.trim(),
          usuario: user.name,
        });
      }

      if (tabela.regiaoAplicavel !== novosDados.regiaoAplicavel) {
        logsAlteracao.push({
          timestamp: dataAtual,
          campoAlterado: "Região",
          valorAntigo: tabela.regiaoAplicavel,
          valorNovo: novosDados.regiaoAplicavel,
          usuario: user.name,
        });
      }

      if (tabela.produtoAssociado !== novosDados.produtoAssociado) {
        logsAlteracao.push({
          timestamp: dataAtual,
          campoAlterado: "Produto",
          valorAntigo: tabela.produtoAssociado,
          valorNovo: novosDados.produtoAssociado,
          usuario: user.name,
        });
      }

      if (tabela.statusTabela !== novosDados.statusTabela) {
        logsAlteracao.push({
          timestamp: dataAtual,
          campoAlterado: "Status",
          valorAntigo: tabela.statusTabela,
          valorNovo: novosDados.statusTabela,
          usuario: user.name,
        });
      }

      setTabelas((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            // clienteVinculado e codigoTabela permanecem completamente IMUTÁVEIS
            return {
              ...t,
              nomeTabela: novosDados.nomeTabela.trim(),
              regiaoAplicavel: novosDados.regiaoAplicavel,
              produtoAssociado: novosDados.produtoAssociado,
              statusTabela: novosDados.statusTabela,
              dataAtualizacao: dataAtual,
              historicoAlteracoes: [...logsAlteracao, ...t.historicoAlteracoes],
            };
          }
          return t;
        })
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [tabelas, user, verificarAcessoComercial]
  );

  return {
    tabelas,
    error,
    setError,
    cadastrarTabela,
    editarTabela,
    verificarAcessoComercial,
  };
}
