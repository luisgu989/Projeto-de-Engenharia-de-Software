"use client";

import { useState } from "react";

export type StatusOportunidade =
  | "prospeccao"
  | "qualificacao"
  | "proposta"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

export type PrioridadeOportunidade = "baixa" | "media" | "alta";

// ─── Auditoria de movimentações ───────────────────────────────────────────────
export interface MovimentacaoPipeline {
  id: string;
  etapaAnterior: StatusOportunidade;
  etapaNova: StatusOportunidade;
  data: string; // ISO timestamp
  executor: string; // nome do usuário
  executorEmail: string;
  observacao?: string;
}

// ─── Entidade principal ───────────────────────────────────────────────────────
export interface Oportunidade {
  id: string;
  titulo: string;
  cliente: string; // protegido — não pode ser alterado após criação
  responsavel: string;
  valorEstimado: number;
  probabilidade: number; // 0–100
  status: StatusOportunidade;
  prioridade: PrioridadeOportunidade;
  dataAbertura: string;
  dataFechamentoPrevisto: string;
  descricao: string;
  origem: string;
  historico: MovimentacaoPipeline[];
}

// ─── Regras de transição entre etapas ────────────────────────────────────────
export const TRANSICOES_VALIDAS: Record<StatusOportunidade, StatusOportunidade[]> = {
  prospeccao: ["qualificacao", "fechado_perdido"],
  qualificacao: ["proposta", "prospeccao", "fechado_perdido"],
  proposta: ["negociacao", "qualificacao", "fechado_perdido"],
  negociacao: ["fechado_ganho", "fechado_perdido", "proposta"],
  fechado_ganho: [], // estado final — sem transições
  fechado_perdido: ["prospeccao"], // reabrir oportunidade
};

// ─── Labels ──────────────────────────────────────────────────────────────────
export const statusLabels: Record<StatusOportunidade, string> = {
  prospeccao: "Prospecção",
  qualificacao: "Qualificação",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechado_ganho: "Fechado – Ganho",
  fechado_perdido: "Fechado – Perdido",
};

export const prioridadeLabels: Record<PrioridadeOportunidade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

// ─── Mock data (com histórico) ────────────────────────────────────────────────
const mockOportunidadesIniciais: Oportunidade[] = [
  {
    id: "OPO-2026-001",
    titulo: "Contrato Anual de Suprimentos",
    cliente: "Indústrias Alfa Ltda.",
    responsavel: "Carlos Mendes",
    valorEstimado: 85000,
    probabilidade: 75,
    status: "negociacao",
    prioridade: "alta",
    dataAbertura: "2026-05-10T09:00:00",
    dataFechamentoPrevisto: "2026-07-30",
    descricao: "Negociação de contrato anual para fornecimento de matéria-prima.",
    origem: "Indicação",
    historico: [
      {
        id: "MOV-001-1",
        etapaAnterior: "prospeccao",
        etapaNova: "qualificacao",
        data: "2026-05-12T10:00:00",
        executor: "Carlos Mendes",
        executorEmail: "carlos.mendes@erppro.com",
        observacao: "Cliente demonstrou interesse inicial após cold call.",
      },
      {
        id: "MOV-001-2",
        etapaAnterior: "qualificacao",
        etapaNova: "proposta",
        data: "2026-05-20T14:30:00",
        executor: "Carlos Mendes",
        executorEmail: "carlos.mendes@erppro.com",
        observacao: "Proposta técnica e comercial enviada conforme briefing.",
      },
      {
        id: "MOV-001-3",
        etapaAnterior: "proposta",
        etapaNova: "negociacao",
        data: "2026-06-01T09:15:00",
        executor: "João da Silva",
        executorEmail: "joao.silva@erppro.com",
        observacao: "Cliente aceitou a proposta. Iniciando negociação de valores e prazos.",
      },
    ],
  },
  {
    id: "OPO-2026-002",
    titulo: "Expansão Linha de Produção",
    cliente: "Beta Componentes S.A.",
    responsavel: "Ana Ferreira",
    valorEstimado: 210000,
    probabilidade: 40,
    status: "proposta",
    prioridade: "alta",
    dataAbertura: "2026-05-20T14:00:00",
    dataFechamentoPrevisto: "2026-09-15",
    descricao: "Proposta para fornecer equipamentos e serviços de integração.",
    origem: "Prospecção Ativa",
    historico: [
      {
        id: "MOV-002-1",
        etapaAnterior: "prospeccao",
        etapaNova: "qualificacao",
        data: "2026-05-22T11:00:00",
        executor: "Ana Ferreira",
        executorEmail: "ana.ferreira@erppro.com",
        observacao: "Lead qualificado após reunião técnica presencial.",
      },
      {
        id: "MOV-002-2",
        etapaAnterior: "qualificacao",
        etapaNova: "proposta",
        data: "2026-06-05T16:00:00",
        executor: "Ana Ferreira",
        executorEmail: "ana.ferreira@erppro.com",
        observacao: "Proposta detalhada enviada com prazo de resposta em 15 dias.",
      },
    ],
  },
  {
    id: "OPO-2026-003",
    titulo: "Parceria Logística Regional",
    cliente: "Transportes Gama",
    responsavel: "Ricardo Lopes",
    valorEstimado: 42000,
    probabilidade: 60,
    status: "qualificacao",
    prioridade: "media",
    dataAbertura: "2026-06-01T10:30:00",
    dataFechamentoPrevisto: "2026-08-01",
    descricao: "Avaliação de parceria para distribuição regional de produtos.",
    origem: "Feira do Setor",
    historico: [
      {
        id: "MOV-003-1",
        etapaAnterior: "prospeccao",
        etapaNova: "qualificacao",
        data: "2026-06-03T09:00:00",
        executor: "Ricardo Lopes",
        executorEmail: "ricardo.lopes@erppro.com",
        observacao: "Reunião de alinhamento realizada. Bom potencial identificado.",
      },
    ],
  },
  {
    id: "OPO-2026-004",
    titulo: "Sistema de Gestão de Estoque",
    cliente: "Distribuidora Delta",
    responsavel: "Juliana Costa",
    valorEstimado: 30000,
    probabilidade: 100,
    status: "fechado_ganho",
    prioridade: "media",
    dataAbertura: "2026-04-15T08:00:00",
    dataFechamentoPrevisto: "2026-06-10",
    descricao: "Implantação de módulo de estoque para o cliente.",
    origem: "Site Institucional",
    historico: [
      {
        id: "MOV-004-1",
        etapaAnterior: "prospeccao",
        etapaNova: "qualificacao",
        data: "2026-04-18T10:00:00",
        executor: "Juliana Costa",
        executorEmail: "juliana.costa@erppro.com",
      },
      {
        id: "MOV-004-2",
        etapaAnterior: "qualificacao",
        etapaNova: "proposta",
        data: "2026-04-28T14:00:00",
        executor: "Juliana Costa",
        executorEmail: "juliana.costa@erppro.com",
        observacao: "Proposta final aprovada internamente.",
      },
      {
        id: "MOV-004-3",
        etapaAnterior: "proposta",
        etapaNova: "negociacao",
        data: "2026-05-10T09:00:00",
        executor: "João da Silva",
        executorEmail: "joao.silva@erppro.com",
        observacao: "Cliente solicitou ajuste de prazo. Acatado.",
      },
      {
        id: "MOV-004-4",
        etapaAnterior: "negociacao",
        etapaNova: "fechado_ganho",
        data: "2026-06-10T17:00:00",
        executor: "João da Silva",
        executorEmail: "joao.silva@erppro.com",
        observacao: "Contrato assinado. Projeto iniciado com kick-off agendado.",
      },
    ],
  },
  {
    id: "OPO-2026-005",
    titulo: "Consultoria de Processos",
    cliente: "Epsilon Serviços",
    responsavel: "Carlos Mendes",
    valorEstimado: 18000,
    probabilidade: 0,
    status: "fechado_perdido",
    prioridade: "baixa",
    dataAbertura: "2026-03-20T11:00:00",
    dataFechamentoPrevisto: "2026-05-30",
    descricao: "Proposta de consultoria em otimização de processos internos.",
    origem: "Indicação",
    historico: [
      {
        id: "MOV-005-1",
        etapaAnterior: "prospeccao",
        etapaNova: "qualificacao",
        data: "2026-03-25T10:00:00",
        executor: "Carlos Mendes",
        executorEmail: "carlos.mendes@erppro.com",
      },
      {
        id: "MOV-005-2",
        etapaAnterior: "qualificacao",
        etapaNova: "proposta",
        data: "2026-04-05T11:00:00",
        executor: "Carlos Mendes",
        executorEmail: "carlos.mendes@erppro.com",
        observacao: "Proposta enviada dentro do prazo solicitado.",
      },
      {
        id: "MOV-005-3",
        etapaAnterior: "proposta",
        etapaNova: "fechado_perdido",
        data: "2026-05-30T16:00:00",
        executor: "João da Silva",
        executorEmail: "joao.silva@erppro.com",
        observacao: "Cliente optou por concorrente com preço 30% menor. Reavaliar estratégia.",
      },
    ],
  },
  {
    id: "OPO-2026-006",
    titulo: "Fornecimento de Embalagens",
    cliente: "Zeta Alimentos Ltda.",
    responsavel: "Ana Ferreira",
    valorEstimado: 12500,
    probabilidade: 55,
    status: "prospeccao",
    prioridade: "baixa",
    dataAbertura: "2026-06-12T15:00:00",
    dataFechamentoPrevisto: "2026-08-30",
    descricao: "Contato inicial para fornecimento de embalagens personalizadas.",
    origem: "Cold Call",
    historico: [],
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOportunidades() {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>(
    mockOportunidadesIniciais
  );
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOportunidade | "todos">("todos");

  // Adicionar nova oportunidade
  const adicionarOportunidade = (
    nova: Omit<Oportunidade, "id" | "dataAbertura" | "historico">
  ) => {
    const dataAtual = new Date().toISOString();
    const idGerado = `OPO-2026-${String(oportunidades.length + 1).padStart(3, "0")}`;
    const oportunidadeCompleta: Oportunidade = {
      ...nova,
      id: idGerado,
      dataAbertura: dataAtual,
      historico: [],
    };
    setOportunidades((prev) => [oportunidadeCompleta, ...prev]);
  };

  /**
   * Avança a etapa de uma oportunidade no pipeline.
   * Valida as regras de transição e registra a movimentação no histórico.
   */
  const avancarEtapa = (
    id: string,
    novaEtapa: StatusOportunidade,
    executor: { name: string; email: string },
    observacao?: string
  ): { sucesso: boolean; erro?: string } => {
    const oportunidade = oportunidades.find((op) => op.id === id);
    if (!oportunidade) return { sucesso: false, erro: "Oportunidade não encontrada." };

    const transicoesPermitidas = TRANSICOES_VALIDAS[oportunidade.status];
    if (!transicoesPermitidas.includes(novaEtapa)) {
      return {
        sucesso: false,
        erro: `Transição de "${statusLabels[oportunidade.status]}" para "${statusLabels[novaEtapa]}" não é permitida pelas regras do fluxo.`,
      };
    }

    const movimentacao: MovimentacaoPipeline = {
      id: `MOV-${id}-${Date.now()}`,
      etapaAnterior: oportunidade.status,
      etapaNova: novaEtapa,
      data: new Date().toISOString(),
      executor: executor.name,
      executorEmail: executor.email,
      ...(observacao?.trim() ? { observacao: observacao.trim() } : {}),
    };

    setOportunidades((prev) =>
      prev.map((op) =>
        op.id === id
          ? { ...op, status: novaEtapa, historico: [...op.historico, movimentacao] }
          : op
      )
    );

    return { sucesso: true };
  };

  /**
   * Edita campos de uma oportunidade.
   * Os campos `id`, `cliente` e `dataAbertura` são protegidos e nunca serão alterados.
   */
  const editarOportunidade = (
    id: string,
    campos: Partial<Omit<Oportunidade, "id" | "cliente" | "dataAbertura" | "historico">>
  ): { sucesso: boolean; erro?: string } => {
    const existe = oportunidades.some((op) => op.id === id);
    if (!existe) return { sucesso: false, erro: "Oportunidade não encontrada." };

    setOportunidades((prev) =>
      prev.map((op) => (op.id === id ? { ...op, ...campos } : op))
    );
    return { sucesso: true };
  };

  // ─── Filtros ────────────────────────────────────────────────────────────────
  const oportunidadesFiltradas = oportunidades.filter((op) => {
    const matchBusca =
      op.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      op.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      op.id.toLowerCase().includes(busca.toLowerCase()) ||
      op.responsavel.toLowerCase().includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === "todos" || op.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  // ─── KPIs ───────────────────────────────────────────────────────────────────
  const abertas = oportunidades.filter(
    (op) => op.status !== "fechado_ganho" && op.status !== "fechado_perdido"
  );
  const ganhas = oportunidades.filter((op) => op.status === "fechado_ganho");
  const perdidas = oportunidades.filter((op) => op.status === "fechado_perdido");

  const valorPipelineTotal = abertas.reduce((acc, op) => acc + op.valorEstimado, 0);
  const valorGanhoTotal = ganhas.reduce((acc, op) => acc + op.valorEstimado, 0);

  const taxaConversao =
    ganhas.length + perdidas.length > 0
      ? Math.round((ganhas.length / (ganhas.length + perdidas.length)) * 100)
      : 0;

  return {
    oportunidades: oportunidadesFiltradas,
    todasOportunidades: oportunidades, // usado pelo Pipeline (sem filtro)
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    adicionarOportunidade,
    avancarEtapa,
    editarOportunidade,
    totalAbertas: abertas.length,
    valorPipelineTotal,
    valorGanhoTotal,
    taxaConversao,
  };
}
