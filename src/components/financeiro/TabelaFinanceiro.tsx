"use client";

import React, { useState } from "react";
import { Search, PlusCircle, ArrowDownCircle, ArrowUpCircle, AlertTriangle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Lancamento, TipoLancamento, StatusLancamento } from "@/hooks/useFinanceiro";

interface TabelaFinanceiroProps {
  lancamentos: Lancamento[];
  busca: string;
  setBusca: (v: string) => void;
  filtroTipo: TipoLancamento | "todos";
  setFiltroTipo: (v: TipoLancamento | "todos") => void;
  onAdicionarLancamento: (lancamento: Omit<Lancamento, "id">) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
}

/**
 * StatusBadge: Responsabilidade única — renderizar o badge de status do lançamento.
 */
function StatusBadge({ status }: { status: Lancamento["status"] }) {
  const map = {
    pago: { label: "Pago", variant: "outline" as const, cls: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
    pendente: { label: "Pendente", variant: "outline" as const, cls: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10" },
    vencido: { label: "Vencido", variant: "outline" as const, cls: "border-destructive/40 text-destructive bg-destructive/10" },
  };
  const { label, variant, cls } = map[status];
  return (
    <Badge variant={variant} className={cls}>
      {label}
    </Badge>
  );
}

/**
 * TabelaFinanceiro: Responsabilidade única — listar lançamentos financeiros
 * com busca, filtro por tipo e ação de novo lançamento.
 */
export function TabelaFinanceiro({
  lancamentos,
  busca,
  setBusca,
  filtroTipo,
  setFiltroTipo,
  onAdicionarLancamento,
}: TabelaFinanceiroProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<TipoLancamento>("receber");
  const [valor, setValor] = useState(0);
  const [vencimento, setVencimento] = useState("");
  const [status, setStatus] = useState<StatusLancamento>("pendente");
  const [categoria, setCategoria] = useState("Vendas");
  const [contraparte, setContraparte] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (descricao.trim().length < 3) {
      setFormError("A descrição deve ter pelo menos 3 caracteres.");
      return;
    }
    if (valor <= 0) {
      setFormError("O valor deve ser maior que zero.");
      return;
    }
    if (!vencimento) {
      setFormError("A data de vencimento é obrigatória.");
      return;
    }
    if (contraparte.trim().length < 2) {
      setFormError("O nome da contraparte deve ter pelo menos 2 caracteres.");
      return;
    }

    onAdicionarLancamento({
      descricao: descricao.trim(),
      tipo,
      valor: Number(valor),
      vencimento,
      status,
      categoria,
      contraparte: contraparte.trim(),
    });

    // Reset
    setDescricao("");
    setTipo("receber");
    setValor(0);
    setVencimento("");
    setStatus("pendente");
    setCategoria("Vendas");
    setContraparte("");
    setFormError(null);
    setModalOpen(false);
  };

  const filtros: { value: TipoLancamento | "todos"; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "receber", label: "A Receber" },
    { value: "pagar", label: "A Pagar" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-border">
        <div className="flex items-center gap-2 flex-wrap">
          {filtros.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltroTipo(f.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150 ${
                filtroTipo === f.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar lançamento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button size="sm" className="h-9 gap-1.5 shrink-0" onClick={() => { setFormError(null); setModalOpen(true); }}>
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Lançamento</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Contraparte</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Vencimento</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lancamentos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            ) : (
              lancamentos.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-accent/30 transition-colors duration-100"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.id}</td>
                  <td className="px-4 py-3 font-medium max-w-[180px] truncate">{l.descricao}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[160px] truncate">{l.contraparte}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-accent text-accent-foreground font-medium">
                      {l.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(l.vencimento)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      l.tipo === "receber"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {l.tipo === "receber"
                        ? <ArrowDownCircle className="h-3.5 w-3.5" />
                        : <ArrowUpCircle className="h-3.5 w-3.5" />}
                      {l.tipo === "receber" ? "Receber" : "Pagar"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold tracking-tight">
                    {formatCurrency(l.valor)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={l.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {lancamentos.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          Exibindo {lancamentos.length} lançamento{lancamentos.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Modal Novo Lançamento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold tracking-tight">Novo Lançamento</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              {/* Tipo toggle */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo("receber")}
                    className={`flex-1 text-sm font-medium px-3 py-2 rounded-md transition-all duration-150 border ${
                      tipo === "receber"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    A Receber
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo("pagar")}
                    className={`flex-1 text-sm font-medium px-3 py-2 rounded-md transition-all duration-150 border ${
                      tipo === "pagar"
                        ? "bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    A Pagar
                  </button>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descrição</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Fatura Cliente ABC"
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Valor + Vencimento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valor || ""}
                    onChange={(e) => setValor(Number(e.target.value))}
                    placeholder="0,00"
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Vencimento</label>
                  <input
                    type="date"
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Contraparte */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Contraparte</label>
                <input
                  type="text"
                  value={contraparte}
                  onChange={(e) => setContraparte(e.target.value)}
                  placeholder="Cliente ou fornecedor"
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Categoria + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Vendas">Vendas</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Infraestrutura">Infraestrutura</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Estoque">Estoque</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusLancamento)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Salvar Lançamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
