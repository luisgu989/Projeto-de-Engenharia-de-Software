"use client";

import React, { useState } from "react";
import { ItemEstoque } from "@/hooks/useEstoque";
import { Search, Plus, AlertTriangle, ArrowUpDown, ShieldAlert, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TabelaEstoqueProps {
  estoque: ItemEstoque[];
  busca: string;
  setBusca: (busca: string) => void;
  onAdicionarItem: (item: Omit<ItemEstoque, "id">) => void;
  onAjustarEstoque: (id: string, novaQuantidade: number) => void;
}

export function TabelaEstoque({
  estoque,
  busca,
  setBusca,
  onAdicionarItem,
  onAjustarEstoque,
}: TabelaEstoqueProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemEstoque | null>(null);
  const [novaQtd, setNovaQtd] = useState(0);

  // New Item states
  const [nome, setNome] = useState("");
  const [sku, setSku] = useState("");
  const [categoria, setCategoria] = useState("Periféricos");
  const [quantidade, setQuantidade] = useState(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState(10);
  const [precoCusto, setPrecoCusto] = useState(0);
  const [precoVenda, setPrecoVenda] = useState(0);

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !sku.trim()) return;

    onAdicionarItem({
      nome,
      sku,
      categoria,
      quantidade: Number(quantidade),
      estoqueMinimo: Number(estoqueMinimo),
      precoCusto: Number(precoCusto),
      precoVenda: Number(precoVenda),
    });

    // Reset fields
    setNome("");
    setSku("");
    setQuantidade(0);
    setEstoqueMinimo(10);
    setPrecoCusto(0);
    setPrecoVenda(0);
    setModalOpen(false);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    onAjustarEstoque(selectedItem.id, novaQtd);
    setAjusteOpen(false);
    setSelectedItem(null);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por produto, SKU ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-card hover:bg-accent/30 focus:bg-background rounded-md pl-9 pr-4 py-2 text-sm border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
          />
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 shadow-md shadow-primary/10 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Produto
        </Button>
      </div>

      {/* Table grid */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">SKU / CÓDIGO</th>
                <th className="p-4">NOME DO PRODUTO</th>
                <th className="p-4">CATEGORIA</th>
                <th className="p-4 text-center">QTD EM ESTOQUE</th>
                <th className="p-4 text-right">PREÇO CUSTO</th>
                <th className="p-4 text-right">PREÇO VENDA</th>
                <th className="p-4 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {estoque.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Nenhum produto cadastrado ou correspondente à busca.
                  </td>
                </tr>
              ) : (
                estoque.map((item) => {
                  const isLowStock = item.quantidade <= item.estoqueMinimo;
                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-accent/20 transition-colors",
                        isLowStock && "bg-destructive/5 hover:bg-destructive/10"
                      )}
                    >
                      <td className="p-4 font-mono text-xs">
                        <span className="font-semibold text-foreground/80">{item.sku}</span>
                        <div className="text-[10px] text-muted-foreground">{item.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {item.nome}
                          {isLowStock && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 bg-destructive/10 text-destructive rounded">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              BAIXO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{item.categoria}</td>
                      <td className="p-4 text-center font-semibold">
                        <span
                          className={cn(
                            isLowStock
                              ? "text-destructive font-bold"
                              : "text-foreground"
                          )}
                        >
                          {item.quantidade}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {" "}
                          / {item.estoqueMinimo} (mín)
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono">{formatCurrency(item.precoCusto)}</td>
                      <td className="p-4 text-right font-mono font-bold">{formatCurrency(item.precoVenda)}</td>
                      <td className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item);
                            setNovaQtd(item.quantidade);
                            setAjusteOpen(true);
                          }}
                          className="h-8 w-8 hover:bg-accent"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold">Cadastrar Novo Produto</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">SKU / Código</label>
                  <input
                    type="text"
                    required
                    placeholder="PRD-TEC-001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Periféricos">Periféricos</option>
                    <option value="Monitores">Monitores</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Áudio">Áudio</option>
                    <option value="Componentes">Componentes</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Nome descritivo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Estoque Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(Number(e.target.value))}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={precoCusto}
                    onChange={(e) => setPrecoCusto(Number(e.target.value))}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(Number(e.target.value))}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                  className="text-xs"
                >
                  Fechar
                </Button>
                <Button type="submit" className="text-xs">
                  Cadastrar SKU
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adjust Stock Quantity */}
      {ajusteOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold">Ajustar Saldo de Estoque</h3>
              <button
                onClick={() => setAjusteOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-4 space-y-4">
              <div className="bg-accent/30 p-3 rounded-lg text-xs space-y-1">
                <div className="text-muted-foreground">Item selecionado:</div>
                <div className="font-semibold text-sm">{selectedItem.nome}</div>
                <div className="text-[10px] font-mono text-muted-foreground">SKU: {selectedItem.sku}</div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nova Quantidade Física</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={novaQtd}
                  onChange={(e) => setNovaQtd(Number(e.target.value))}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAjusteOpen(false)}
                  className="text-xs"
                >
                  Fechar
                </Button>
                <Button type="submit" className="text-xs">
                  Atualizar Saldo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
