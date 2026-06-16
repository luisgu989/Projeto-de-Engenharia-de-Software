"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface ChamadoLog {
  data: string;
  status: string;
  usuario: string;
  descricaoAcao: string;
}

export interface ChamadoTecnico {
  idChamado: string;
  categoria: string;
  descricao: string;
  usuarioSolicitante: string;
  solicitanteEmail: string;
  status: "Aberto" | "Em Atendimento" | "Resolvido" | "Cancelado";
  dataAbertura: string;
  historicoAtendimento: ChamadoLog[];
}

const mockChamadosIniciais: ChamadoTecnico[] = [
  {
    idChamado: "CHA-8941",
    categoria: "Software",
    descricao: "Erro de carregamento ao tentar salvar novos produtos no estoque.",
    usuarioSolicitante: "João da Silva",
    solicitanteEmail: "joao.silva@erppro.com",
    status: "Em Atendimento",
    dataAbertura: "2026-06-15T09:00:00.000Z",
    historicoAtendimento: [
      {
        data: "2026-06-15T09:00:00.000Z",
        status: "Aberto",
        usuario: "João da Silva",
        descricaoAcao: "Abertura do chamado técnico pelo solicitante.",
      },
      {
        data: "2026-06-15T09:15:00.000Z",
        status: "Em Atendimento",
        usuario: "Maria Santos",
        descricaoAcao: "Chamado assumido pela analista de TI.",
      },
    ],
  },
  {
    idChamado: "CHA-2510",
    categoria: "Redes",
    descricao: "Conectividade lenta ao sincronizar banco de dados externo.",
    usuarioSolicitante: "Renata Souza",
    solicitanteEmail: "renata.souza@erppro.com",
    status: "Resolvido",
    dataAbertura: "2026-06-14T11:00:00.000Z",
    historicoAtendimento: [
      {
        data: "2026-06-14T11:00:00.000Z",
        status: "Aberto",
        usuario: "Renata Souza",
        descricaoAcao: "Abertura do chamado técnico pelo solicitante.",
      },
      {
        data: "2026-06-14T11:30:00.000Z",
        status: "Em Atendimento",
        usuario: "Administrador Geral",
        descricaoAcao: "Chamado assumido pelo suporte.",
      },
      {
        data: "2026-06-14T12:00:00.000Z",
        status: "Resolvido",
        usuario: "Administrador Geral",
        descricaoAcao: "Link de internet reiniciado e sincronização restabelecida.",
      },
    ],
  },
];

export function useChamados() {
  const { user } = useAuth();
  const { addLog } = useLogs();

  const [chamados, setChamados] = useState<ChamadoTecnico[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_chamados_tecnicos");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar chamados:", e);
        }
      }
    }
    return mockChamadosIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("erp_chamados_tecnicos", JSON.stringify(chamados));
  }, [chamados]);

  const abrirChamado = (categoria: string, descricao: string): boolean => {
    setError(null);

    if (!categoria) {
      setError("Por favor, selecione uma Categoria de Chamado.");
      return false;
    }

    if (!descricao.trim() || descricao.trim().length < 10) {
      setError("A descrição do problema é obrigatória e deve ter pelo menos 10 caracteres.");
      return false;
    }

    const idChamado = `CHA-${Math.floor(1000 + Math.random() * 9000)}`;
    const dataAbertura = new Date().toISOString();

    const novoChamado: ChamadoTecnico = {
      idChamado,
      categoria,
      descricao: descricao.trim(),
      usuarioSolicitante: user?.name || "Solicitante",
      solicitanteEmail: user?.email || "solicitante@erppro.com",
      status: "Aberto",
      dataAbertura,
      historicoAtendimento: [
        {
          data: dataAbertura,
          status: "Aberto",
          usuario: user?.name || "Solicitante",
          descricaoAcao: "Abertura de chamado registrada com sucesso.",
        },
      ],
    };

    setChamados((prev) => [novoChamado, ...prev]);
    addLog(`Abriu chamado técnico de suporte (${categoria}). ID: ${idChamado}`, "seguranca");

    return true;
  };

  const atualizarStatusChamado = (
    id: string,
    novoStatus: ChamadoTecnico["status"],
    descricaoAcao: string
  ): boolean => {
    let alterado = false;
    const dataAtual = new Date().toISOString();

    setChamados((prev) =>
      prev.map((c) => {
        if (c.idChamado === id) {
          alterado = true;
          const novoHistorico: ChamadoLog = {
            data: dataAtual,
            status: novoStatus,
            usuario: user?.name || "Suporte",
            descricaoAcao: descricaoAcao.trim() || `Status do chamado alterado para ${novoStatus}.`,
          };

          addLog(
            `Alterou status do chamado ${id} para '${novoStatus}'. Detalhe: ${novoHistorico.descricaoAcao}`,
            "seguranca"
          );

          return {
            ...c,
            status: novoStatus,
            historicoAtendimento: [...c.historicoAtendimento, novoHistorico],
          };
        }
        return c;
      })
    );

    return alterado;
  };

  const removerChamado = (id: string) => {
    setChamados((prev) => prev.filter((c) => c.idChamado !== id));
    addLog(`Removeu chamado técnico ID: ${id}`, "seguranca");
  };

  return {
    chamados,
    error,
    setError,
    abrirChamado,
    atualizarStatusChamado,
    removerChamado,
  };
}
