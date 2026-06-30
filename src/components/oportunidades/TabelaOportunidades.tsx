"use client";

import React, { useState } from "react";
import {
  Oportunidade,
  StatusOportunidade,
  PrioridadeOportunidade,
  statusLabels,
  prioridadeLabels,
} from "@/hooks/useOportunidades";
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  Calendar,
  User,
  Briefcase,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TabelaOportunidadesProps {
  oportunidades: Oportunidade[];
  busca: string;
  setBusca: (v: string) => void;
  filtroStatus: StatusOportunidade | "todos";
  setFiltroStatus: (v: StatusOportunidade | "todos") => void;
  onAdicionarOportunidade: (
    nova: Omit<Oportunidade, "id" | "dataAbertura" | "historico">
  ) => void;
}

const statusConfig: Record<
  StatusOportunidade,
  { label: string; className: string }
> = {
  prospeccao: {
    label: "Prospecção",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
  qualificacao: {
    label: "Qualificação",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  proposta: {
    label: "Proposta",
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  negociacao: {
    label: "Negociação",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  fechado_ganho: {
    label: "Fechado – Ganho",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  fechado_perdido: {
    label: "Fechado – Perdido",
    className: "bg-destructive/10 text-destructive",
  },
};

const prioridadeConfig: Record<
  PrioridadeOportunidade,
  { label: string; className: string }
> = {
  baixa: {
    label: "Baixa",
    className: "bg-slate-500/10 text-slate-500",
  },
  media: {
    label: "Média",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  alta: {
    label: "Alta",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
};

const defaultForm = {
  titulo: "",
  cliente: "",
  responsavel: "",
  valorEstimado: 0,
  probabilidade: 50,
  status: "prospeccao" as StatusOportunidade,
  prioridade: "media" as PrioridadeOportunidade,
  dataFechamentoPrevisto: "",
  descricao: "",
  origem: "",
};

export function TabelaOportunidades({
  oportunidades,
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  onAdicionarOportunidade,
}: TabelaOportunidadesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [filtroOpen, setFiltroOpen] = useState(false);

  const handleField = (
    field: keyof typeof defaultForm,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.cliente.trim()) return;
    onAdicionarOportunidade({
      ...form,
      valorEstimado: Number(form.valorEstimado),
      probabilidade: Number(form.probabilidade),
    });
    setForm(defaultForm);
    setModalOpen(false);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const statusList = Object.keys(statusLabels) as StatusOportunidade[];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            id="busca-oportunidade"
            type="text"
            placeholder="Buscar por título, cliente, responsável..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-card hover:bg-accent/30 focus:bg-background rounded-md pl-9 pr-4 py-2 text-sm border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="relative">
            <button
              id="filtro-status-oportunidade"
              onClick={() => setFiltroOpen((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-card hover:bg-accent/40 text-sm font-medium transition-all"
            >
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">
                {filtroStatus === "todos"
                  ? "Todos os Status"
                  : statusLabels[filtroStatus]}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {filtroOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setFiltroOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 rounded-lg border border-border bg-card shadow-lg z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      setFiltroStatus("todos");
                      setFiltroOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors",
                      filtroStatus === "todos" && "font-semibold text-primary"
                    )}
                  >
                    Todos os Status
                  </button>
                  {statusList.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setFiltroStatus(s);
                        setFiltroOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors",
                        filtroStatus === s && "font-semibold text-primary"
                      )}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Add Button */}
          <Button
            id="btn-nova-oportunidade"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 shadow-md shadow-primary/10 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nova Oportunidade
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">Código</th>
                <th className="p-4 text-left">Título / Cliente</th>
                <th className="p-4 text-left">Responsável</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Prioridade</th>
                <th className="p-4 text-center">Prob.</th>
                <th className="p-4 text-center">Fechamento Prev.</th>
                <th className="p-4 text-center">Valor Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {oportunidades.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-10 text-center text-muted-foreground"
                  >
                    Nenhuma oportunidade encontrada.
                  </td>
                </tr>
              ) : (
                oportunidades.map((op) => (
                  <tr
                    key={op.id}
                    className="hover:bg-accent/20 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs font-semibold text-foreground/70 text-center">
                      {op.id}
                    </td>
                    <td className="p-4 text-left">
                      <div className="font-medium text-foreground">
                        {op.titulo}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {op.cliente}
                      </div>
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {op.responsavel}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap",
                          statusConfig[op.status].className
                        )}
                      >
                        {statusConfig[op.status].label}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded",
                          prioridadeConfig[op.prioridade].className
                        )}
                      >
                        {prioridadeConfig[op.prioridade].label}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-accent rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              op.probabilidade >= 70
                                ? "bg-emerald-500"
                                : op.probabilidade >= 40
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            )}
                            style={{ width: `${op.probabilidade}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {op.probabilidade}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(op.dataFechamentoPrevisto)}
                      </div>
                    </td>
                    <td className="p-4 font-bold tracking-tight text-right">
                      {formatCurrency(op.valorEstimado)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal – Nova Oportunidade */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 bg-accent/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/10">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                </div>
                <h3 className="text-base font-semibold">
                  Registrar Oportunidade Comercial
                </h3>
              </div>
              <button
                id="fechar-modal-oportunidade"
                onClick={() => {
                  setModalOpen(false);
                  setForm(defaultForm);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-4 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {/* Título */}
              <div className="space-y-1">
                <label
                  htmlFor="op-titulo"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Título da Oportunidade *
                </label>
                <input
                  id="op-titulo"
                  type="text"
                  required
                  placeholder="Ex: Contrato de Fornecimento Anual"
                  value={form.titulo}
                  onChange={(e) => handleField("titulo", e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all"
                />
              </div>

              {/* Cliente + Responsável */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="op-cliente"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Cliente *
                  </label>
                  <input
                    id="op-cliente"
                    type="text"
                    required
                    placeholder="Nome da empresa"
                    value={form.cliente}
                    onChange={(e) => handleField("cliente", e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="op-responsavel"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Responsável *
                  </label>
                  <input
                    id="op-responsavel"
                    type="text"
                    required
                    placeholder="Nome do vendedor"
                    value={form.responsavel}
                    onChange={(e) => handleField("responsavel", e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Valor + Probabilidade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="op-valor"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Valor Estimado (R$)
                  </label>
                  <input
                    id="op-valor"
                    type="number"
                    min="0"
                    step="100"
                    value={form.valorEstimado}
                    onChange={(e) =>
                      handleField("valorEstimado", e.target.value)
                    }
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="op-probabilidade"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Probabilidade ({form.probabilidade}%)
                  </label>
                  <input
                    id="op-probabilidade"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.probabilidade}
                    onChange={(e) =>
                      handleField("probabilidade", e.target.value)
                    }
                    className="w-full mt-2 accent-violet-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Status + Prioridade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="op-status"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Estágio / Status
                  </label>
                  <select
                    id="op-status"
                    value={form.status}
                    onChange={(e) =>
                      handleField("status", e.target.value as StatusOportunidade)
                    }
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all"
                  >
                    {(
                      Object.keys(statusLabels) as StatusOportunidade[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="op-prioridade"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Prioridade
                  </label>
                  <select
                    id="op-prioridade"
                    value={form.prioridade}
                    onChange={(e) =>
                      handleField(
                        "prioridade",
                        e.target.value as PrioridadeOportunidade
                      )
                    }
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all"
                  >
                    {(
                      Object.keys(prioridadeLabels) as PrioridadeOportunidade[]
                    ).map((p) => (
                      <option key={p} value={p}>
                        {prioridadeLabels[p]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Prev. + Origem */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="op-data"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Fechamento Previsto *
                  </label>
                  <input
                    id="op-data"
                    type="date"
                    required
                    value={form.dataFechamentoPrevisto}
                    onChange={(e) =>
                      handleField("dataFechamentoPrevisto", e.target.value)
                    }
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="op-origem"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Origem / Canal
                  </label>
                  <select
                    id="op-origem"
                    value={form.origem}
                    onChange={(e) => handleField("origem", e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all"
                  >
                    <option value="">Selecionar...</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Prospecção Ativa">Prospecção Ativa</option>
                    <option value="Site Institucional">Site Institucional</option>
                    <option value="Feira do Setor">Feira do Setor</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Redes Sociais">Redes Sociais</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-1">
                <label
                  htmlFor="op-descricao"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Descrição / Observações
                </label>
                <textarea
                  id="op-descricao"
                  rows={3}
                  placeholder="Detalhes sobre a negociação, necessidades do cliente..."
                  value={form.descricao}
                  onChange={(e) => handleField("descricao", e.target.value)}
                  className="w-full resize-none bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm transition-all"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setModalOpen(false);
                    setForm(defaultForm);
                  }}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Registrar Oportunidade
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
