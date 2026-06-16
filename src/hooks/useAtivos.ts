"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface Ativo {
  id: string;
  codigoPatrimonial: string;
  descricao: string;
  setorResponsavel: string;
  localizacaoAtual: string;
  status: "ativo" | "em_manutencao" | "baixado";
  dataAtualizacao: string;
  responsavel: string;
}

export interface MovimentacaoAtivo {
  id: string;
  ativoId: string;
  codigoPatrimonial: string;
  campoAlterado: string;
  valorAntigo: string;
  valorNovo: string;
  dataMovimentacao: string;
  responsavel: string;
}

// Setores válidos padrão do ERP
export const SETORES_VALIDOS = [
  "TI",
  "Vendas",
  "Administrativo",
  "Logística",
  "Estoque",
  "Financeiro",
];

const mockAtivosIniciais: Ativo[] = [
  {
    id: "ATV-101",
    codigoPatrimonial: "PAT-CNC-001",
    descricao: "Corte e Dobra CNC Laser 500W",
    setorResponsavel: "Logística",
    localizacaoAtual: "Galpão A",
    status: "ativo",
    dataAtualizacao: "2026-05-15T09:00:00.000Z",
    responsavel: "Usuário Suporte",
  },
  {
    id: "ATV-102",
    codigoPatrimonial: "PAT-3DP-002",
    descricao: "Impressora 3D Resina Elegoo",
    setorResponsavel: "Logística",
    localizacaoAtual: "Laboratório 2",
    status: "ativo",
    dataAtualizacao: "2026-05-20T14:30:00.000Z",
    responsavel: "Usuário Suporte",
  },
  {
    id: "ATV-103",
    codigoPatrimonial: "PAT-DESK-003",
    descricao: "Workstation Dell XPS i9 32GB",
    setorResponsavel: "TI",
    localizacaoAtual: "Escritório TI",
    status: "ativo",
    dataAtualizacao: "2026-05-22T11:00:00.000Z",
    responsavel: "Maria Santos",
  },
];

export function useAtivos() {
  const { user } = useAuth();
  const { addLog } = useLogs();

  const [ativos, setAtivos] = useState<Ativo[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_ativos");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar ativos:", e);
        }
      }
    }
    return mockAtivosIniciais;
  });

  const [historicoMovimentacoes, setHistoricoMovimentacoes] = useState<MovimentacaoAtivo[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_ativos");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico de ativos:", e);
        }
      }
    }
    return [];
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_ativos", JSON.stringify(ativos));
  }, [ativos]);

  useEffect(() => {
    localStorage.setItem("erp_historico_ativos", JSON.stringify(historicoMovimentacoes));
  }, [historicoMovimentacoes]);

  // Sincronizar entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAtivos = localStorage.getItem("erp_ativos");
      const savedHist = localStorage.getItem("erp_historico_ativos");
      if (savedAtivos) {
        try { setAtivos(JSON.parse(savedAtivos)); } catch (e) {}
      }
      if (savedHist) {
        try { setHistoricoMovimentacoes(JSON.parse(savedHist)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar Código Patrimonial duplicado
  const checkDuplicateCodigo = useCallback(
    (codigo: string, excludeId?: string) => {
      const cleaned = codigo.trim().toUpperCase();
      if (!cleaned) return false;
      return ativos.some((a) => a.id !== excludeId && a.codigoPatrimonial.trim().toUpperCase() === cleaned);
    },
    [ativos]
  );

  // Cadastrar Ativo
  const cadastrarAtivo = useCallback(
    (codigoPatrimonial: string, descricao: string, setorResponsavel: string, localizacaoAtual: string) => {
      setError(null);

      const cleanedCodigo = codigoPatrimonial.trim().toUpperCase();
      if (!cleanedCodigo) {
        setError("O código patrimonial é obrigatório.");
        return false;
      }

      if (checkDuplicateCodigo(cleanedCodigo)) {
        setError(`O código patrimonial "${cleanedCodigo}" já está cadastrado.`);
        return false;
      }

      if (!SETORES_VALIDOS.includes(setorResponsavel)) {
        setError(`O setor "${setorResponsavel}" é inválido ou não cadastrado.`);
        return false;
      }

      const id = `ATV-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataAtual = new Date().toISOString();

      const novoAtivo: Ativo = {
        id,
        codigoPatrimonial: cleanedCodigo,
        descricao: descricao.trim(),
        setorResponsavel,
        localizacaoAtual: localizacaoAtual.trim(),
        status: "ativo",
        dataAtualizacao: dataAtual,
        responsavel: user.name,
      };

      setAtivos((prev) => [...prev, novoAtivo]);
      addLog(`Cadastrou o ativo patrimonial "${descricao.trim()}" (Cód: ${cleanedCodigo})`, "estoque");

      // Registra movimentação de abertura
      const novaMov: MovimentacaoAtivo = {
        id: `MOV-ATV-${Math.floor(100000 + Math.random() * 900000)}`,
        ativoId: id,
        codigoPatrimonial: cleanedCodigo,
        campoAlterado: "Cadastro",
        valorAntigo: "-",
        valorNovo: `Abertura de cadastro no setor ${setorResponsavel}`,
        dataMovimentacao: dataAtual,
        responsavel: user.name,
      };
      setHistoricoMovimentacoes((prev) => [novaMov, ...prev]);

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [ativos, user, addLog, checkDuplicateCodigo]
  );

  // Editar Ativo
  const editarAtivo = useCallback(
    (id: string, novosDados: Omit<Ativo, "id" | "codigoPatrimonial" | "dataAtualizacao" | "responsavel">) => {
      setError(null);

      const ativoExistente = ativos.find((a) => a.id === id);
      if (!ativoExistente) {
        setError("Ativo não encontrado.");
        return false;
      }

      if (!SETORES_VALIDOS.includes(novosDados.setorResponsavel)) {
        setError(`O setor "${novosDados.setorResponsavel}" é inválido.`);
        return false;
      }

      const dataAtual = new Date().toISOString();
      const logsAlteracao: MovimentacaoAtivo[] = [];

      // Detecta modificações e adiciona no histórico imutável
      if (ativoExistente.descricao !== novosDados.descricao.trim()) {
        logsAlteracao.push({
          id: `MOV-ATV-${Math.floor(100000 + Math.random() * 900000)}`,
          ativoId: id,
          codigoPatrimonial: ativoExistente.codigoPatrimonial,
          campoAlterado: "Descrição",
          valorAntigo: ativoExistente.descricao,
          valorNovo: novosDados.descricao.trim(),
          dataMovimentacao: dataAtual,
          responsavel: user.name,
        });
      }

      if (ativoExistente.setorResponsavel !== novosDados.setorResponsavel) {
        logsAlteracao.push({
          id: `MOV-ATV-${Math.floor(100000 + Math.random() * 900000)}`,
          ativoId: id,
          codigoPatrimonial: ativoExistente.codigoPatrimonial,
          campoAlterado: "Setor Responsável",
          valorAntigo: ativoExistente.setorResponsavel,
          valorNovo: novosDados.setorResponsavel,
          dataMovimentacao: dataAtual,
          responsavel: user.name,
        });
      }

      if (ativoExistente.localizacaoAtual !== novosDados.localizacaoAtual.trim()) {
        logsAlteracao.push({
          id: `MOV-ATV-${Math.floor(100000 + Math.random() * 900000)}`,
          ativoId: id,
          codigoPatrimonial: ativoExistente.codigoPatrimonial,
          campoAlterado: "Localização Atual",
          valorAntigo: ativoExistente.localizacaoAtual,
          valorNovo: novosDados.localizacaoAtual.trim(),
          dataMovimentacao: dataAtual,
          responsavel: user.name,
        });
      }

      if (ativoExistente.status !== novosDados.status) {
        logsAlteracao.push({
          id: `MOV-ATV-${Math.floor(100000 + Math.random() * 900000)}`,
          ativoId: id,
          codigoPatrimonial: ativoExistente.codigoPatrimonial,
          campoAlterado: "Status",
          valorAntigo: ativoExistente.status,
          valorNovo: novosDados.status,
          dataMovimentacao: dataAtual,
          responsavel: user.name,
        });
      }

      // Aplica as atualizações do ativo
      setAtivos((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                descricao: novosDados.descricao.trim(),
                setorResponsavel: novosDados.setorResponsavel,
                localizacaoAtual: novosDados.localizacaoAtual.trim(),
                status: novosDados.status,
                dataAtualizacao: dataAtual,
                responsavel: user.name,
              }
            : a
        )
      );

      // Adiciona todos os logs gerados no histórico de movimentações imutável
      if (logsAlteracao.length > 0) {
        setHistoricoMovimentacoes((prev) => [...logsAlteracao, ...prev]);
        addLog(`Atualizou o ativo "${ativoExistente.descricao}" (${ativoExistente.codigoPatrimonial})`, "estoque");
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [ativos, user, addLog]
  );

  return {
    ativos,
    historicoMovimentacoes,
    error,
    setError,
    cadastrarAtivo,
    editarAtivo,
    checkDuplicateCodigo,
  };
}
