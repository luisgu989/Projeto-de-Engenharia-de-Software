import React, { useState } from "react";
import { ItemEstoque } from "@/hooks/useEstoque";
import { Search, Plus, AlertTriangle, ShieldAlert, Edit2, Info, Calendar, User, Trash2, ArrowUpRight, ArrowDownLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductForm } from "@/components/ProductForm";
import { useAuth } from "@/contexts/auth-context";

interface TabelaEstoqueProps {
  estoque: ItemEstoque[];
  busca: string;
  setBusca: (busca: string) => void;
  onAdicionarItem: (item: Omit<ItemEstoque, "id" | "status" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">) => boolean;
  onAjustarEstoque: (id: string, tipo: "entrada" | "saida", quantidade: number, motivo: string) => boolean;
  onAtualizarItem: (id: string, item: Omit<ItemEstoque, "id" | "status" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">) => boolean;
  onRemoverItem: (id: string) => boolean;
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
  onRemoverItem,
  error,
  setError,
}: TabelaEstoqueProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemEstoque | null>(null);
  const [activeAudit, setActiveAudit] = useState<ItemEstoque | null>(null);

  const { user } = useAuth();
  const [inboundType, setInboundType] = useState<"entrada" | "saida">("entrada");

  // Success message toast simulation
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // SKU Availability simulation states
  const [isCheckingSku, setIsCheckingSku] = useState(false);
  const [skuAvailability, setSkuAvailability] = useState<"available" | "unavailable" | null>(null);

  // Errors for Add and Edit Forms
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Confirm delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Stock Inbound modal states
  const [inboundOpen, setInboundOpen] = useState(false);
  const [inboundQtd, setInboundQtd] = useState<number | "">("");
  const [inboundMotivo, setInboundMotivo] = useState("");
  const [inboundError, setInboundError] = useState<string | null>(null);

  // Filters state
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
  const [editCategoria, setEditCategoria] = useState("Periféricos");
  const [editEstoqueMinimo, setEditEstoqueMinimo] = useState(10);
  const [editPrecoCusto, setEditPrecoCusto] = useState(0);
  const [editPrecoVenda, setEditPrecoVenda] = useState(0);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  const handleSkuChange = (value: string) => {
    const cleaned = value.trim().toUpperCase();
    setSku(cleaned);
    setSkuAvailability(null);
    if (!cleaned) {
      setAddErrors(prev => ({ ...prev, sku: "SKU é obrigatório." }));
      return;
    }
    const skuRegex = /^[A-Z0-9-]+$/;
    if (!skuRegex.test(cleaned)) {
      setAddErrors(prev => ({ ...prev, sku: "Formato inválido. Use apenas letras maiúsculas, números e hífens." }));
      return;
    }
    setAddErrors(prev => {
      const copy = { ...prev };
      delete copy.sku;
      return copy;
    });

    setIsCheckingSku(true);
    setTimeout(() => {
      const duplicado = estoque.some(item => item.sku.trim().toUpperCase() === cleaned);
      if (duplicado) {
        setSkuAvailability("unavailable");
        setAddErrors(prev => ({ ...prev, sku: `O SKU "${cleaned}" já está em uso.` }));
      } else {
        setSkuAvailability("available");
        setAddErrors(prev => {
          const copy = { ...prev };
          delete copy.sku;
          return copy;
        });
      }
      setIsCheckingSku(false);
    }, 400);
  };

  const handleNomeChange = (value: string, isEdit = false) => {
    if (isEdit) {
      setEditNome(value);
      if (value.trim().length < 3) {
        setEditErrors(prev => ({ ...prev, nome: "O nome deve ter pelo menos 3 caracteres." }));
      } else {
        setEditErrors(prev => {
          const copy = { ...prev };
          delete copy.nome;
          return copy;
        });
      }
    } else {
      setNome(value);
      if (value.trim().length < 3) {
        setAddErrors(prev => ({ ...prev, nome: "O nome deve ter pelo menos 3 caracteres." }));
      } else {
        setAddErrors(prev => {
          const copy = { ...prev };
          delete copy.nome;
          return copy;
        });
      }
    }
  };

  const handlePrecosChange = (custo: number, venda: number, isEdit = false) => {
    if (isEdit) {
      setEditPrecoCusto(custo);
      setEditPrecoVenda(venda);
      const errorsTemp: Record<string, string> = {};
      if (custo < 0) errorsTemp.precoCusto = "Preço de custo não pode ser negativo.";
      if (venda <= 0) errorsTemp.precoVenda = "Preço de venda deve ser maior que zero.";
      if (venda <= custo) errorsTemp.precoVenda = "Preço de venda deve ser maior que o preço de custo.";
      
      setEditErrors(prev => {
        const copy = { ...prev };
        delete copy.precoCusto;
        delete copy.precoVenda;
        return { ...copy, ...errorsTemp };
      });
    } else {
      setPrecoCusto(custo);
      setPrecoVenda(venda);
      const errorsTemp: Record<string, string> = {};
      if (custo < 0) errorsTemp.precoCusto = "Preço de custo não pode ser negativo.";
      if (venda <= 0) errorsTemp.precoVenda = "Preço de venda deve ser maior que zero.";
      if (venda <= custo) errorsTemp.precoVenda = "Preço de venda deve ser maior que o preço de custo.";
      
      setAddErrors(prev => {
        const copy = { ...prev };
        delete copy.precoCusto;
        delete copy.precoVenda;
        return { ...copy, ...errorsTemp };
      });
    }
  };

  const handleQuantidadeChange = (val: number) => {
    setQuantidade(val);
    if (val < 0) {
      setAddErrors(prev => ({ ...prev, quantidade: "A quantidade não pode ser negativa." }));
    } else {
      setAddErrors(prev => {
        const copy = { ...prev };
        delete copy.quantidade;
        return copy;
      });
    }
  };

  const handleEstoqueMinimoChange = (val: number, isEdit = false) => {
    if (isEdit) {
      setEditEstoqueMinimo(val);
      if (val < 1) {
        setEditErrors(prev => ({ ...prev, estoqueMinimo: "Estoque mínimo deve ser de pelo menos 1." }));
      } else {
        setEditErrors(prev => {
          const copy = { ...prev };
          delete copy.estoqueMinimo;
          return copy;
        });
      }
    } else {
      setEstoqueMinimo(val);
      if (val < 1) {
        setAddErrors(prev => ({ ...prev, estoqueMinimo: "Estoque mínimo deve ser de pelo menos 1." }));
      } else {
        setAddErrors(prev => {
          const copy = { ...prev };
          delete copy.estoqueMinimo;
          return copy;
        });
      }
    }
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(addErrors).length > 0 || !nome || !sku || skuAvailability !== "available") {
      setError("Preencha todos os campos obrigatórios corretamente.");
      return;
    }

    const success = onAdicionarItem({
      nome: nome.trim(),
      sku: sku.trim().toUpperCase(),
      categoria,
      quantidade: Number(quantidade),
      estoqueMinimo: Number(estoqueMinimo),
      precoCusto: Number(precoCusto),
      precoVenda: Number(precoVenda),
    });

    if (success) {
      setNome("");
      setSku("");
      setQuantidade(0);
      setEstoqueMinimo(10);
      setPrecoCusto(0);
      setPrecoVenda(0);
      setSkuAvailability(null);
      setAddErrors({});
      setError(null);
      setModalOpen(false);
      triggerToast("Produto cadastrado com sucesso!");
    }
  };

  const handleEditItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || Object.keys(editErrors).length > 0 || !editNome) {
      setError("Preencha todos os campos corretamente.");
      return;
    }

    const success = onAtualizarItem(selectedItem.id, {
      nome: editNome.trim(),
      sku: selectedItem.sku,
      categoria: editCategoria,
      quantidade: selectedItem.quantidade,
      estoqueMinimo: Number(editEstoqueMinimo),
      precoCusto: Number(editPrecoCusto),
      precoVenda: Number(editPrecoVenda),
    });

    if (success) {
      setEditErrors({});
      setError(null);
      setEditOpen(false);
      setSelectedItem(null);
      triggerToast("Produto atualizado com sucesso!");
    }
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (user.role !== "admin") {
      setError("Permissão Negada: Apenas administradores podem excluir produtos.");
      return;
    }

    const success = onRemoverItem(selectedItem.id);
    if (success) {
      setDeleteOpen(false);
      setSelectedItem(null);
      triggerToast("Produto removido com sucesso!");
    }
  };

  const handleInboundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !inboundQtd || Number(inboundQtd) <= 0) {
      setInboundError("A quantidade deve ser maior que zero.");
      return;
    }
    if (!inboundMotivo.trim()) {
      setInboundError("O motivo da movimentação é obrigatório.");
      return;
    }

    if (inboundType === "saida" && Number(inboundQtd) > selectedItem.quantidade) {
      setInboundError(`Saldo insuficiente. O produto possui apenas ${selectedItem.quantidade} unidades.`);
      return;
    }

    const success = onAjustarEstoque(selectedItem.id, inboundType, Number(inboundQtd), inboundMotivo.trim());
    if (success) {
      setInboundOpen(false);
      setInboundQtd("");
      setInboundMotivo("");
      setInboundError(null);
      setSelectedItem(null);
      triggerToast(inboundType === "entrada" ? "Entrada de estoque registrada com sucesso!" : "Saída de estoque registrada com sucesso!");
    } else {
      setInboundError("Erro ao registrar a movimentação no estoque.");
    }
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
      {/* Simulated Success Toast */}
      {successToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

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

        {user.permissions.gerenciarEstoque ? (
          <Button
            onClick={() => {
              setError(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 shadow-md shadow-primary/10 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Produto
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground bg-accent/40 px-3 py-2 rounded-lg border border-border flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
            Apenas Leitura: Cadastro de Produto Bloqueado
          </div>
        )}
      </div>

      {/* Advanced Filter Toolbar */}
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
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                            title="Ver Detalhes de Auditoria"
                          >
                            <Info className="h-4 w-4" />
                          </Button>

                          {/* Entrada de Estoque - Acessível se tiver permissão de movimentar */}
                          {user.permissions.movimentarEstoque && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item);
                                setInboundType("entrada");
                                setInboundQtd("");
                                setInboundMotivo("");
                                setInboundError(null);
                                setInboundOpen(true);
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                              title="Registrar Entrada de Estoque"
                            >
                              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            </Button>
                          )}

                          {/* Saída de Estoque - Acessível se tiver permissão de movimentar */}
                          {user.permissions.movimentarEstoque && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item);
                                setInboundType("saida");
                                setInboundQtd("");
                                setInboundMotivo("");
                                setInboundError(null);
                                setInboundOpen(true);
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                              title="Registrar Saída de Estoque"
                            >
                              <ArrowDownLeft className="h-4 w-4 text-rose-500" />
                            </Button>
                          )}

                          {/* Ações restritas a quem pode Gerenciar Estoque */}
                          {user.permissions.gerenciarEstoque && (
                            <>
                              {/* Editar Cadastro Completo */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setEditNome(item.nome);
                                  setEditCategoria(item.categoria);
                                  setEditEstoqueMinimo(item.estoqueMinimo);
                                  setEditPrecoCusto(item.precoCusto);
                                  setEditPrecoVenda(item.precoVenda);
                                  setEditErrors({});
                                  setError(null);
                                  setEditOpen(true);
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent cursor-pointer"
                                title="Editar Produto"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>

                              {/* Excluir Produto */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setError(null);
                                  setDeleteOpen(true);
                                }}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-accent cursor-pointer"
                                title="Excluir Produto"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
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

      {/* Unified Add/Edit Product Form using ProductForm component */}
      {modalOpen && (
        <ProductForm
          mode="add"
          onSubmit={onAdicionarItem}
          onClose={() => {
            setError(null);
            setModalOpen(false);
            setAddErrors({});
            setSkuAvailability(null);
          }}
          existingItems={estoque.map(item => ({ sku: item.sku }))}
          errors={addErrors}
          setErrors={setAddErrors}
        />
      )}

      {editOpen && selectedItem && (
    <ProductForm
      mode="edit"
      initialData={{
        sku: selectedItem.sku,
        nome: selectedItem.nome,
        categoria: selectedItem.categoria,
        quantidade: selectedItem.quantidade,
        estoqueMinimo: selectedItem.estoqueMinimo,
        precoCusto: selectedItem.precoCusto,
        precoVenda: selectedItem.precoVenda,
      }}
      onSubmit={(data) => {
        const success = onAtualizarItem(selectedItem.id, {
          sku: selectedItem.sku,
          nome: data.nome.trim(),
          categoria: data.categoria,
          quantidade: selectedItem.quantidade,
          estoqueMinimo: Number(data.estoqueMinimo),
          precoCusto: Number(data.precoCusto),
          precoVenda: Number(data.precoVenda),
        });
        if (success) {
          setEditOpen(false);
          setSelectedItem(null);
          triggerToast("Produto atualizado com sucesso!");
        }
        return success;
      }}
      onClose={() => {
        setEditOpen(false);
        setSelectedItem(null);
        setEditErrors({});
      }}
      existingItems={estoque.map(item => ({ sku: item.sku }))}
      errors={editErrors}
      setErrors={setEditErrors}
    />
  )}

      {/* Modal 2: Inbound/Outbound Stock Movement (R015 / US016) */}
      {inboundOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={cn(
              "flex items-center justify-between border-b border-border p-4 transition-colors",
              inboundType === "entrada" ? "bg-emerald-500/5" : "bg-rose-500/5"
            )}>
              <h3 className={cn(
                "text-base font-semibold flex items-center gap-2 transition-colors",
                inboundType === "entrada" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}>
                {inboundType === "entrada" ? (
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                ) : (
                  <ArrowDownLeft className="h-5 w-5 text-rose-500" />
                )}
                Registrar Movimentação
              </h3>
              <button
                onClick={() => {
                  setInboundOpen(false);
                  setSelectedItem(null);
                  setInboundError(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleInboundSubmit} className="p-4 space-y-4">
              <div className="bg-accent/30 p-3 rounded-lg text-xs space-y-1">
                <div className="text-muted-foreground">Produto selecionado:</div>
                <div className="font-semibold text-sm text-foreground">{selectedItem.nome}</div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                  <span>SKU: <strong className="font-mono text-foreground">{selectedItem.sku}</strong></span>
                  <span>Saldo Atual: <strong className="text-foreground">{selectedItem.quantidade} un</strong></span>
                </div>
              </div>

              {inboundError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{inboundError}</span>
                </div>
              )}

              {/* Segmented controller for movement type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tipo de Movimentação</label>
                <div className="flex bg-accent/30 p-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setInboundType("entrada");
                      setInboundError(null);
                    }}
                    className={cn(
                      "flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer text-center",
                      inboundType === "entrada" ? "bg-emerald-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInboundType("saida");
                      setInboundError(null);
                      if (inboundQtd && Number(inboundQtd) > selectedItem.quantidade) {
                        setInboundError(`Saldo insuficiente. O produto possui apenas ${selectedItem.quantidade} unidades.`);
                      }
                    }}
                    className={cn(
                      "flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer text-center",
                      inboundType === "saida" ? "bg-rose-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Saída (-)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Quantidade a {inboundType === "entrada" ? "Inserir" : "Retirar"} <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder={inboundType === "entrada" ? "Ex: 50" : "Ex: 10"}
                  value={inboundQtd}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val === "") {
                      setInboundQtd("");
                      setInboundError(null);
                    } else {
                      const num = Number(val);
                      if (num > 0) {
                        setInboundQtd(num);
                        if (inboundType === "saida" && num > selectedItem.quantidade) {
                          setInboundError(`Saldo insuficiente. O produto possui apenas ${selectedItem.quantidade} unidades.`);
                        } else {
                          setInboundError(null);
                        }
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Motivo / Justificativa <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={inboundType === "entrada" ? "Ex: Compra fornecedor TechDistrib" : "Ex: Venda cupom #9213"}
                  value={inboundMotivo}
                  onChange={(e) => {
                    setInboundMotivo(e.target.value);
                    if (e.target.value.trim()) setInboundError(null);
                  }}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setInboundOpen(false);
                    setSelectedItem(null);
                    setInboundError(null);
                  }}
                  className="text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className={cn(
                    "text-xs font-semibold text-white cursor-pointer transition-colors",
                    inboundType === "entrada" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  )}
                  disabled={!inboundQtd || Number(inboundQtd) <= 0 || !inboundMotivo.trim() || !!inboundError}
                >
                  {inboundType === "entrada" ? "Confirmar Entrada" : "Confirmar Saída"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm deletion */}
      {deleteOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4 bg-destructive/5">
              <h3 className="text-base font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirmar Exclusão Controlada
              </h3>
              <button
                onClick={() => {
                  setError(null);
                  setDeleteOpen(false);
                  setSelectedItem(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleDeleteSubmit} className="p-4 space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  Aviso Administrativo Crítico
                </h4>
                <p className="text-xs text-destructive/90 leading-relaxed">
                  A exclusão de <strong>{selectedItem.nome}</strong> (SKU: <strong>{selectedItem.sku}</strong>) é uma alteração de inventário permanente. 
                  O produto será removido visualmente de todas as listagens ativas e desconsiderado nos cálculos globais de estoque.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setDeleteOpen(false);
                    setSelectedItem(null);
                  }}
                  className="text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive" 
                  className="text-xs font-semibold cursor-pointer"
                >
                  Confirmar Exclusão
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
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
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

              <div className="max-h-[300px] overflow-y-auto space-y-4 border-l border-border pl-4 ml-2 relative pr-2">
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

                {/* Movimentações de Estoque no Histórico de Auditoria */}
                {activeAudit.movimentacoes && activeAudit.movimentacoes.length > 0 && (
                  <>
                    <div className="pt-2 border-t border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Movimentações de Estoque
                    </div>
                    {activeAudit.movimentacoes.map((mov, mIdx) => (
                      <div key={mIdx} className="relative space-y-1 pl-1">
                        <div className={cn(
                          "absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ring-4 ring-card",
                          mov.tipo === "entrada" ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            {mov.tipo === "entrada" ? "Entrada" : "Saída"}:
                          </span>
                          <span className={cn(
                            "font-bold font-mono",
                            mov.tipo === "entrada" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                          )}>
                            {mov.tipo === "entrada" ? "+" : "-"}{mov.quantidade} un
                          </span>
                        </div>
                        <div className="text-[11px] text-foreground/80 leading-snug">
                          Motivo: <span className="italic">{mov.motivo}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {mov.usuario}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(mov.data)}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setActiveAudit(null)}
                  className="w-full sm:w-auto text-xs font-semibold cursor-pointer"
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
