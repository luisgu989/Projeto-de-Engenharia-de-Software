"use client";

import React, { useState } from "react";
import { ItemEstoque } from "@/hooks/useEstoque";
import { Search, Calendar, ArrowUpRight, ArrowDownLeft, Filter, Plus, AlertTriangle, Settings, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoricoMovimentacoesProps {
  estoque: ItemEstoque[];
  onRegistrarMovimentacao: (
    produtoId: string,
    tipo: "entrada" | "saida" | "transferencia" | "ajuste",
    quantidade: number,
    deposito: string,
    motivo: string
  ) => boolean;
  error: string | null;
  setError: (err: string | null) => void;
}

export function HistoricoMovimentacoes({
  estoque,
  onRegistrarMovimentacao,
  error,
  setError,
}: HistoricoMovimentacoesProps) {
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "entrada" | "saida" | "transferencia" | "ajuste">("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState("");
  const [movTipo, setMovTipo] = useState<"entrada" | "saida" | "transferencia" | "ajuste">("entrada");
  const [movQuantidade, setMovQuantidade] = useState<number | "">("");
  const [movDeposito, setMovDeposito] = useState("");
  const [movMotivo, setMovMotivo] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const todasMovimentacoes = estoque.flatMap((item) => {
    return (item.movimentacoes || []).map((mov) => ({
      ...mov,
      itemNome: item.nome,
      itemSku: item.sku,
      itemCategoria: item.categoria,
    }));
  });

  const movimentacoesFiltradas = todasMovimentacoes
    .filter((mov) => {
      const text = busca.toLowerCase();
      if (
        text &&
        !mov.itemNome.toLowerCase().includes(text) &&
        !mov.itemSku.toLowerCase().includes(text) &&
        !mov.motivo.toLowerCase().includes(text)
      ) {
        return false;
      }

      if (tipoFiltro !== "todos" && mov.tipo !== tipoFiltro) {
        return false;
      }

      if (categoriaFiltro !== "todas" && mov.itemCategoria !== categoriaFiltro) {
        return false;
      }

      const movDate = new Date(mov.data).toISOString().split("T")[0];
      if (dataInicio && movDate < dataInicio) {
        return false;
      }
      if (dataFim && movDate > dataFim) {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoriasUnicas = () => {
    const cats = estoque.map((item) => item.categoria);
    return Array.from(new Set(cats));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);

    if (!selectedProdutoId) {
      setLocalError("Selecione um produto.");
      return;
    }

    const qty = Number(movQuantidade);
    if (!qty || qty <= 0) {
      setLocalError("A quantidade deve ser maior que zero.");
      return;
    }

    if (!movDeposito.trim()) {
      setLocalError("O depósito é obrigatório.");
      return;
    }

    if (!movMotivo.trim()) {
      setLocalError("O motivo é obrigatório.");
      return;
    }

    const product = estoque.find((p) => p.id === selectedProdutoId);
    if (!product) {
      setLocalError("Produto inválido.");
      return;
    }

    if ((movTipo === "saida" || movTipo === "transferencia") && product.quantidade < qty) {
      setLocalError(`Saldo insuficiente. O produto possui apenas ${product.quantidade} unidades.`);
      return;
    }

    const success = onRegistrarMovimentacao(
      selectedProdutoId,
      movTipo,
      qty,
      movDeposito.trim(),
      movMotivo.trim()
    );

    if (success) {
      setIsModalOpen(false);
      setSelectedProdutoId("");
      setMovQuantidade("");
      setMovDeposito("");
      setMovMotivo("");
      setLocalError(null);
      setSuccessToast("Movimentação registrada com sucesso!");
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {successToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Filtros de Pesquisa
          </div>
          <button
            onClick={() => {
              setLocalError(null);
              setError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg shadow cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            Registrar Movimentação
          </button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por produto, SKU ou motivo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background rounded-md pl-9 pr-4 py-2 text-xs border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as any)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="entrada">Entradas (+)</option>
              <option value="saida">Saídas (-)</option>
              <option value="transferencia">Transferências (⇄)</option>
              <option value="ajuste">Ajustes (⚙)</option>
            </select>
          </div>

          <div className="space-y-1">
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all"
            >
              <option value="todas">Todas as Categorias</option>
              {getCategoriasUnicas().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 lg:col-span-2 sm:col-span-2">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-accent/20 border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none"
              title="Data Início"
            />
            <span className="text-muted-foreground text-xs">a</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full bg-accent/20 border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none"
              title="Data Fim"
            />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">Data / Hora</th>
                <th className="p-4 text-left">SKU / Produto</th>
                <th className="p-4 text-left">Categoria</th>
                <th className="p-4 text-center">Tipo</th>
                <th className="p-4 text-center">Depósito</th>
                <th className="p-4 text-center">Qtd</th>
                <th className="p-4 text-left">Motivo / Justificativa</th>
                <th className="p-4 text-center">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {movimentacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Nenhuma movimentação de estoque encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                movimentacoesFiltradas.map((mov, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-accent/10 transition-colors">
                      <td className="p-4 text-xs font-mono text-muted-foreground text-center">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(mov.data)}
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <div className="font-semibold text-xs text-muted-foreground font-mono">{mov.itemSku}</div>
                        <div className="font-medium text-foreground">{mov.itemNome}</div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground text-left">{mov.itemCategoria}</td>
                      <td className="p-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                            mov.tipo === "entrada" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            mov.tipo === "saida" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                            mov.tipo === "transferencia" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                            mov.tipo === "ajuste" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {mov.tipo === "entrada" && <ArrowUpRight className="h-3 w-3 shrink-0" />}
                          {mov.tipo === "saida" && <ArrowDownLeft className="h-3 w-3 shrink-0" />}
                          {mov.tipo === "transferencia" && <RefreshCw className="h-3 w-3 shrink-0" />}
                          {mov.tipo === "ajuste" && <Settings className="h-3 w-3 shrink-0" />}
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-foreground/80 font-medium text-center">{mov.deposito || "Depósito Central"}</td>
                      <td className="text-center" className={cn(
                        "p-4 text-center font-bold font-mono",
                        mov.tipo === "entrada" && "text-emerald-600 dark:text-emerald-400",
                        mov.tipo === "saida" && "text-rose-600 dark:text-rose-400",
                        mov.tipo === "transferencia" && "text-blue-600 dark:text-blue-400",
                        mov.tipo === "ajuste" && "text-amber-600 dark:text-amber-400"
                      )}>
                        {mov.tipo === "entrada" && "+"}
                        {mov.tipo === "saida" && "-"}
                        {mov.tipo === "transferencia" && "⇄"}
                        {mov.tipo === "ajuste" && "⚙"}
                        {mov.quantidade}
                      </td>
                      <td className="p-4 text-xs text-foreground/80 font-medium text-left">{mov.motivo}</td>
                      <td className="p-4 text-xs text-muted-foreground font-medium text-center">{mov.usuario}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Registrar Movimentação de Estoque
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {localError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{localError}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Produto</label>
                <select
                  value={selectedProdutoId}
                  onChange={(e) => setSelectedProdutoId(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all text-foreground"
                >
                  <option value="" className="bg-card">Selecione um Produto...</option>
                  {estoque.map((prod) => (
                    <option key={prod.id} value={prod.id} className="bg-card text-foreground">
                      {prod.nome} ({prod.sku}) - Saldo: {prod.quantidade} un
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tipo de Movimentação</label>
                <div className="flex bg-accent/30 p-1 rounded-lg border border-border">
                  {(["entrada", "saida", "transferencia", "ajuste"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMovTipo(t)}
                      className={cn(
                        "flex-1 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer text-center capitalize",
                        movTipo === t ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={movQuantidade}
                  onChange={(e) => setMovQuantidade(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Depósito (Origem/Destino)</label>
                <input
                  type="text"
                  placeholder="Ex: Depósito Central ou Depósito Central -> CD Campinas"
                  value={movDeposito}
                  onChange={(e) => setMovDeposito(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Motivo / Justificativa</label>
                <input
                  type="text"
                  placeholder="Ex: Reposição de estoque"
                  value={movMotivo}
                  onChange={(e) => setMovMotivo(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all text-foreground"
                />
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-accent/50 hover:bg-accent text-foreground text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg shadow transition-all cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
