"use client";

import React, { useState } from "react";
import { ItemEstoque } from "@/hooks/useEstoque";
import { Search, Calendar, ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoricoMovimentacoesProps {
  estoque: ItemEstoque[];
}

export function HistoricoMovimentacoes({ estoque }: HistoricoMovimentacoesProps) {
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "entrada" | "saida">("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Aggregate and map all movements from all active items
  const todasMovimentacoes = estoque.flatMap((item) => {
    return (item.movimentacoes || []).map((mov) => ({
      ...mov,
      itemNome: item.nome,
      itemSku: item.sku,
      itemCategoria: item.categoria,
    }));
  });

  // Filter movements
  const movimentacoesFiltradas = todasMovimentacoes
    .filter((mov) => {
      // 1. Text Search
      const text = busca.toLowerCase();
      if (
        text &&
        !mov.itemNome.toLowerCase().includes(text) &&
        !mov.itemSku.toLowerCase().includes(text) &&
        !mov.motivo.toLowerCase().includes(text)
      ) {
        return false;
      }

      // 2. Type Filter
      if (tipoFiltro !== "todos" && mov.tipo !== tipoFiltro) {
        return false;
      }

      // 3. Category Filter
      if (categoriaFiltro !== "todas" && mov.itemCategoria !== categoriaFiltro) {
        return false;
      }

      // 4. Date Range Filter
      const movDate = new Date(mov.data).toISOString().split("T")[0]; // YYYY-MM-DD
      if (dataInicio && movDate < dataInicio) {
        return false;
      }
      if (dataFim && movDate > dataFim) {
        return false;
      }

      return true;
    })
    // Sort chronologically (newest first)
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

  return (
    <div className="space-y-4">
      {/* Filtering Toolbar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Filter className="h-4 w-4 text-primary" />
          Filtros de Pesquisa
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Text Search */}
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

          {/* Type Filter */}
          <div className="space-y-1">
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as any)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="entrada">Entradas (+)</option>
              <option value="saida">Saídas (-)</option>
            </select>
          </div>

          {/* Category Filter */}
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

          {/* Date range inputs */}
          <div className="flex items-center gap-2 lg:col-span-1 sm:col-span-2">
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

      {/* Movements Grid */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Data / Hora</th>
                <th className="p-4">SKU / Produto</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-center">Tipo</th>
                <th className="p-4 text-center">Qtd</th>
                <th className="p-4">Motivo / Justificativa</th>
                <th className="p-4">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {movimentacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Nenhuma movimentação de estoque encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                movimentacoesFiltradas.map((mov, idx) => {
                  const isEntry = mov.tipo === "entrada";
                  return (
                    <tr key={idx} className="hover:bg-accent/10 transition-colors">
                      <td className="p-4 text-xs font-mono text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(mov.data)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-xs text-muted-foreground font-mono">{mov.itemSku}</div>
                        <div className="font-medium text-foreground">{mov.itemNome}</div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{mov.itemCategoria}</td>
                      <td className="p-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                            isEntry
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {isEntry ? (
                            <ArrowUpRight className="h-3 w-3 shrink-0" />
                          ) : (
                            <ArrowDownLeft className="h-3 w-3 shrink-0" />
                          )}
                          {isEntry ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className={cn(
                        "p-4 text-center font-bold font-mono",
                        isEntry ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {isEntry ? "+" : "-"}{mov.quantidade}
                      </td>
                      <td className="p-4 text-xs text-foreground/80 font-medium">{mov.motivo}</td>
                      <td className="p-4 text-xs text-muted-foreground font-medium">{mov.usuario}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
