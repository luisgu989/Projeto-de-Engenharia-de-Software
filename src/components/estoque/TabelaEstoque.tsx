import React, { useState } from "react";
import { ItemEstoque } from "@/hooks/useEstoque";
import { Search, Plus, AlertTriangle, ArrowUpDown, ShieldAlert, Edit2, Info, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TabelaEstoqueProps {
  estoque: ItemEstoque[];
  busca: string;
  setBusca: (busca: string) => void;
  onAdicionarItem: (item: Omit<ItemEstoque, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">) => boolean;
  onAjustarEstoque: (id: string, novaQuantidade: number) => void;
  onAtualizarItem: (id: string, item: Omit<ItemEstoque, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">) => boolean;
  error: string | null;
  setError: (err: string | null) => void;
}

export function TabelaEstoque({
  estoque,
  busca,
  setBusca,
  onAdicionarItem,
  onAjustarEstoque,
  onAtualizarItem,
  error,
  setError,
}: TabelaEstoqueProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemEstoque | null>(null);
  const [activeAudit, setActiveAudit] = useState<ItemEstoque | null>(null);
  const [novaQtd, setNovaQtd] = useState(0);

  // Filters state (R007)
  const [statusFiltro, setStatusFiltro] = useState<"todos" | "baixo" | "normal">("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");

  // New Item states
  const [nome, setNome] = useState("");
  const [sku, setSku] = useState("");
  const [categoria, setCategoria] = useState("Periféricos");
  const [quantidade, setQuantidade] = useState(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState(10);
  const [precoCusto, setPrecoCusto] = useState(0);
  const [precoVenda, setPrecoVenda] = useState(0);

  // Edit Item states
  const [editNome, setEditNome] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editCategoria, setEditCategoria] = useState("Periféricos");
  const [editQuantidade, setEditQuantidade] = useState(0);
  const [editEstoqueMinimo, setEditEstoqueMinimo] = useState(10);
  const [editPrecoCusto, setEditPrecoCusto] = useState(0);
  const [editPrecoVenda, setEditPrecoVenda] = useState(0);

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (nome.trim().length < 3) {
      setError("O nome do produto deve ter pelo menos 3 caracteres.");
      return;
    }

    const skuRegex = /^[A-Z0-9-]+$/;
    const cleanSku = sku.trim().toUpperCase();
    if (!skuRegex.test(cleanSku)) {
      setError("O SKU deve conter apenas letras maiúsculas, números e hífens.");
      return;
    }

    if (Number(precoVenda) <= 0) {
      setError("O preço de venda deve ser maior que zero.");
      return;
    }
    if (Number(precoCusto) < 0) {
      setError("O preço de custo não pode ser negativo.");
      return;
    }
    if (Number(quantidade) < 0) {
      setError("A quantidade não pode ser negativa.");
      return;
    }
    if (Number(estoqueMinimo) < 1) {
      setError("O estoque mínimo deve ser de pelo menos 1.");
      return;
    }

    const success = onAdicionarItem({
      nome: nome.trim(),
      sku: cleanSku,
      categoria,
      quantidade: Number(quantidade),
      estoqueMinimo: Number(estoqueMinimo),
      precoCusto: Number(precoCusto),
      precoVenda: Number(precoVenda),
    });

    if (success) {
      // Reset fields
      setNome("");
      setSku("");
      setQuantidade(0);
      setEstoqueMinimo(10);
      setPrecoCusto(0);
      setPrecoVenda(0);
      setError(null);
      setModalOpen(false);
    }
  };

  const handleEditItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    // Validations
    if (editNome.trim().length < 3) {
      setError("O nome do produto deve ter pelo menos 3 caracteres.");
      return;
    }

    const skuRegex = /^[A-Z0-9-]+$/;
    const cleanSku = editSku.trim().toUpperCase();
    if (!skuRegex.test(cleanSku)) {
      setError("O SKU deve conter apenas letras maiúsculas, números e hífens.");
      return;
    }

    if (Number(editPrecoVenda) <= 0) {
      setError("O preço de venda deve ser maior que zero.");
      return;
    }
    if (Number(editPrecoCusto) < 0) {
      setError("O preço de custo não pode ser negativo.");
      return;
    }
    if (Number(editQuantidade) < 0) {
      setError("A quantidade não pode ser negativa.");
      return;
    }
    if (Number(editEstoqueMinimo) < 1) {
      setError("O estoque mínimo deve ser de pelo menos 1.");
      return;
    }

    const success = onAtualizarItem(selectedItem.id, {
      nome: editNome.trim(),
      sku: cleanSku,
      categoria: editCategoria,
      quantidade: Number(editQuantidade),
      estoqueMinimo: Number(editEstoqueMinimo),
      precoCusto: Number(editPrecoCusto),
      precoVenda: Number(editPrecoVenda),
    });

    if (success) {
      setError(null);
      setEditOpen(false);
      setSelectedItem(null);
    }
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    // R006 Validation
    if (novaQtd < 0) {
      alert("A quantidade de estoque não pode ser negativa.");
      return;
    }

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // R007 Local Filtering logic
  const estoqueFiltradoLocal = estoque.filter((item) => {
    // 1. Status Filter
    if (statusFiltro === "baixo" && item.quantidade > item.estoqueMinimo) {
      return false;
    }
    if (statusFiltro === "normal" && item.quantidade <= item.estoqueMinimo) {
      return false;
    }

    // 2. Category Filter
    if (categoriaFiltro !== "todas" && item.categoria !== categoriaFiltro) {
      return false;
    }

    return true;
  });

  // Filter Tab Badges
  const countTodos = estoque.filter(
    (item) => categoriaFiltro === "todas" || item.categoria === categoriaFiltro
  ).length;

  const countBaixo = estoque.filter(
    (item) =>
      (categoriaFiltro === "todas" || item.categoria === categoriaFiltro) &&
      item.quantidade <= item.estoqueMinimo
  ).length;

  const countNormal = estoque.filter(
    (item) =>
      (categoriaFiltro === "todas" || item.categoria === categoriaFiltro) &&
      item.quantidade > item.estoqueMinimo
  ).length;

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
          onClick={() => {
            setError(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 shadow-md shadow-primary/10 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Produto
        </Button>
      </div>

      {/* Advanced Filter Toolbar (R007) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-accent/20 p-1 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setStatusFiltro("todos")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5",
              statusFiltro === "todos"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
              statusFiltro === "todos" ? "bg-accent text-foreground" : "bg-accent/40 text-muted-foreground"
            )}>
              {countTodos}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFiltro("baixo")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5",
              statusFiltro === "baixo"
                ? "bg-destructive/10 text-destructive shadow-sm"
                : "text-muted-foreground hover:text-destructive"
            )}
          >
            Baixo Estoque
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
              statusFiltro === "baixo" ? "bg-destructive/20 text-destructive font-bold" : "bg-accent/40 text-muted-foreground"
            )}>
              {countBaixo}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFiltro("normal")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5",
              statusFiltro === "normal"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-muted-foreground hover:text-emerald-500"
            )}
          >
            Estoque OK
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
              statusFiltro === "normal" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold" : "bg-accent/40 text-muted-foreground"
            )}>
              {countNormal}
            </span>
          </button>
        </div>

        {/* Category Select Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Filtrar Categoria:
          </label>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="bg-card hover:bg-accent/30 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-1.5 text-xs font-medium transition-all"
          >
            <option value="todas">Todas as categorias</option>
            <option value="Periféricos">Periféricos</option>
            <option value="Monitores">Monitores</option>
            <option value="Acessórios">Acessórios</option>
            <option value="Áudio">Áudio</option>
            <option value="Componentes">Componentes</option>
          </select>
        </div>
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
              {estoqueFiltradoLocal.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Nenhum produto correspondente aos filtros selecionados.
                  </td>
                </tr>
              ) : (
                estoqueFiltradoLocal.map((item) => {
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
                        <div className="flex items-center justify-center gap-1">
                          {/* Histórico de Auditoria */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setActiveAudit(item)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                            title="Ver Detalhes de Auditoria"
                          >
                            <Info className="h-4 w-4" />
                          </Button>

                          {/* Editar Cadastro Completo */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item);
                              setEditNome(item.nome);
                              setEditSku(item.sku);
                              setEditCategoria(item.categoria);
                              setEditQuantidade(item.quantidade);
                              setEditEstoqueMinimo(item.estoqueMinimo);
                              setEditPrecoCusto(item.precoCusto);
                              setEditPrecoVenda(item.precoVenda);
                              setError(null);
                              setEditOpen(true);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent"
                            title="Editar Produto"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          {/* Ajustar Estoque Rápido */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item);
                              setNovaQtd(item.quantidade);
                              setAjusteOpen(true);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                            title="Ajustar Saldo"
                          >
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </div>
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
                onClick={() => {
                  setError(null);
                  setModalOpen(false);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddItemSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">SKU / Código</label>
                  <input
                    type="text"
                    required
                    placeholder="PRD-TEC-001"
                    value={sku}
                    onChange={(e) => {
                      setSku(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => {
                      setCategoria(e.target.value);
                      setError(null);
                    }}
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
                  onChange={(e) => {
                    setNome(e.target.value);
                    setError(null);
                  }}
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
                    onChange={(e) => {
                      setQuantidade(Number(e.target.value));
                      setError(null);
                    }}
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
                    onChange={(e) => {
                      setEstoqueMinimo(Number(e.target.value));
                      setError(null);
                    }}
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
                    onChange={(e) => {
                      setPrecoCusto(Number(e.target.value));
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={precoVenda}
                    onChange={(e) => {
                      setPrecoVenda(Number(e.target.value));
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setModalOpen(false);
                  }}
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

      {/* Modal 3: Edit Existing Product */}
      {editOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold">Editar Detalhes do Produto</h3>
              <button
                onClick={() => {
                  setError(null);
                  setEditOpen(false);
                  setSelectedItem(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEditItemSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">ID do Produto (Bloqueado)</label>
                  <input
                    type="text"
                    disabled
                    value={selectedItem.id}
                    className="w-full bg-accent/20 border border-border text-muted-foreground rounded-md px-3 py-2 text-sm cursor-not-allowed font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                  <select
                    value={editCategoria}
                    onChange={(e) => {
                      setEditCategoria(e.target.value);
                      setError(null);
                    }}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">SKU / Código</label>
                  <input
                    type="text"
                    required
                    placeholder="PRD-TEC-001"
                    value={editSku}
                    onChange={(e) => {
                      setEditSku(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Estoque Atual</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editQuantidade}
                    onChange={(e) => {
                      setEditQuantidade(Number(e.target.value));
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Nome descritivo"
                  value={editNome}
                  onChange={(e) => {
                    setEditNome(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-medium text-muted-foreground">Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editEstoqueMinimo}
                    onChange={(e) => {
                      setEditEstoqueMinimo(Number(e.target.value));
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-medium text-muted-foreground">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editPrecoCusto}
                    onChange={(e) => {
                      setEditPrecoCusto(Number(e.target.value));
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-medium text-muted-foreground">Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editPrecoVenda}
                    onChange={(e) => {
                      setEditPrecoVenda(Number(e.target.value));
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setEditOpen(false);
                    setSelectedItem(null);
                  }}
                  className="text-xs"
                >
                  Fechar
                </Button>
                <Button type="submit" className="text-xs">
                  Salvar Alterações
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
                onClick={() => {
                  setAjusteOpen(false);
                  setSelectedItem(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
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
                  onClick={() => {
                    setAjusteOpen(false);
                    setSelectedItem(null);
                  }}
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

      {/* Modal 4: Exibição de Logs de Auditoria */}
      {activeAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Histórico de Auditoria
              </h3>
              <button
                onClick={() => setActiveAudit(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                Fechar
              </button>
            </div>

            {/* Logs timeline */}
            <div className="p-5 space-y-6">
              <div className="text-xs space-y-1">
                <div className="text-muted-foreground">Produto selecionado:</div>
                <div className="font-semibold text-sm">{activeAudit.nome}</div>
                <div className="text-[10px] font-mono text-muted-foreground font-semibold">SKU: {activeAudit.sku}</div>
                <div className="text-[10px] font-mono text-muted-foreground">ID: {activeAudit.id}</div>
              </div>

              <div className="space-y-4 border-l border-border pl-4 ml-2 relative">
                {/* Creation event */}
                <div className="relative space-y-1">
                  <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-card" />
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Criado por {activeAudit.criadoPor || "Admin User"}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {activeAudit.criadoEm ? formatDate(activeAudit.criadoEm) : "N/A"}
                  </div>
                </div>

                {/* Edit event if exists */}
                {activeAudit.atualizadoEm && (
                  <div className="relative space-y-1">
                    <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-card" />
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      Última atualização por {activeAudit.atualizadoPor || "Admin User"}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(activeAudit.atualizadoEm)}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setActiveAudit(null)}
                  className="w-full sm:w-auto text-xs"
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
