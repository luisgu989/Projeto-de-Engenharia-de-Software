"use client";

import React, { useState } from "react";
import { Venda, ProdutoVenda } from "@/hooks/useVendas";
import { useEstoque } from "@/hooks/useEstoque";
import { Search, Plus, Calendar, CreditCard, ShoppingBag, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TabelaVendasProps {
  vendas: Venda[];
  busca: string;
  setBusca: (busca: string) => void;
  onAdicionarVenda: (venda: Omit<Venda, "id" | "data">) => void | boolean;
}

export function TabelaVendas({
  vendas,
  busca,
  setBusca,
  onAdicionarVenda,
}: TabelaVendasProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [cliente, setCliente] = useState("");
  const [itens, setItens] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [status, setStatus] = useState<"confirmado" | "pendente" | "cancelado">("confirmado");
  const [metodoPagamento, setMetodoPagamento] = useState("Pix");

  const { estoque } = useEstoque();
  const produtosAtivos = estoque.filter((p) => p.status === "ativo");
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoVenda[]>([]);
  const [erroEstoque, setErroEstoque] = useState<string | null>(null);

  const atualizarTotais = (produtos: ProdutoVenda[]) => {
    const total = produtos.reduce((acc, p) => acc + p.quantidade * p.precoUnitario, 0);
    const qtdItens = produtos.reduce((acc, p) => acc + p.quantidade, 0);
    setValorTotal(total);
    setItens(qtdItens);
  };

  const adicionarProduto = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const produtoId = e.target.value;
    if (!produtoId) return;

    const produto = produtosAtivos.find((p) => p.id === produtoId);
    if (!produto) return;

    if (produtosSelecionados.some((p) => p.produtoId === produtoId)) return;

    const novosProdutos = [
      ...produtosSelecionados,
      { produtoId: produto.id, nome: produto.nome, quantidade: 1, precoUnitario: produto.precoVenda },
    ];
    setProdutosSelecionados(novosProdutos);
    atualizarTotais(novosProdutos);
    e.target.value = ""; // reset select
  };

  const removerProduto = (produtoId: string) => {
    const novosProdutos = produtosSelecionados.filter((p) => p.produtoId !== produtoId);
    setProdutosSelecionados(novosProdutos);
    atualizarTotais(novosProdutos);
  };

  const alterarQuantidadeProduto = (produtoId: string, quantidade: number) => {
    if (quantidade < 1) return;
    const novosProdutos = produtosSelecionados.map((p) =>
      p.produtoId === produtoId ? { ...p, quantidade } : p
    );
    setProdutosSelecionados(novosProdutos);
    atualizarTotais(novosProdutos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim()) return;
    setErroEstoque(null);

    // Validação local de estoque
    if (status === "confirmado") {
      for (const p of produtosSelecionados) {
        const itemEstoque = estoque.find((i) => i.id === p.produtoId);
        if (itemEstoque && itemEstoque.quantidade < p.quantidade) {
          setErroEstoque(`Estoque insuficiente para ${p.nome}. Disponível: ${itemEstoque.quantidade}.`);
          return;
        }
      }
    }

    const sucesso = onAdicionarVenda({
      cliente,
      itens: Number(itens),
      valorTotal: Number(valorTotal),
      status,
      metodoPagamento,
      produtos: produtosSelecionados,
    });

    if (sucesso === false) {
      // O hook já gerou o erro no contexto de estoque se chegou aqui por falha lá, mas tratamos localmente antes.
      return;
    }

    // Reset form
    setCliente("");
    setItens(0);
    setValorTotal(0);
    setStatus("confirmado");
    setMetodoPagamento("Pix");
    setProdutosSelecionados([]);
    setModalOpen(false);
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Table Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente ou ID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-card hover:bg-accent/30 focus:bg-background rounded-md pl-9 pr-4 py-2 text-sm border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
          />
        </div>

        {/* Add Sale Button */}
        <Button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 shadow-md shadow-primary/10 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Registrar Venda
        </Button>
      </div>

      {/* Main Table Container */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">CÓDIGO</th>
                <th className="p-4">CLIENTE</th>
                <th className="p-4">DATA/HORA</th>
                <th className="p-4">PRODUTOS</th>
                <th className="p-4">ITENS</th>
                <th className="p-4">PAGAMENTO</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">VALOR TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Nenhuma venda encontrada para esta busca.
                  </td>
                </tr>
              ) : (
                vendas.map((venda) => (
                  <tr
                    key={venda.id}
                    className="hover:bg-accent/20 transition-colors"
                  >
                    <td className="p-4 font-mono font-semibold text-foreground/80">
                      {venda.id}
                    </td>
                    <td className="p-4 font-medium">{venda.cliente}</td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {formatDate(venda.data)}
                    </td>
                    <td className="p-4 text-xs">
                      {venda.produtos && venda.produtos.length > 0 ? (
                        <div className="flex flex-col gap-1 max-w-[180px]">
                          {venda.produtos.map((p) => (
                            <span key={p.produtoId} className="truncate text-foreground/80 font-medium" title={p.nome}>
                              {p.quantidade}x {p.nome}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic opacity-70">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{venda.itens}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-foreground/80 bg-accent px-2 py-0.5 rounded">
                        {venda.metodoPagamento}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full",
                          venda.status === "confirmado"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : venda.status === "pendente"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {venda.status.charAt(0).toUpperCase() + venda.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold tracking-tight">
                      {formatCurrency(venda.valorTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Registrar Nova Venda */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold">Registrar Nova Venda</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Cancelar
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-3 border border-border p-3 rounded-md bg-accent/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Produtos da Venda</label>
                  <select
                    onChange={adicionarProduto}
                    defaultValue=""
                    className="bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-2 py-1 text-xs max-w-[200px]"
                  >
                    <option value="" disabled>+ Adicionar Produto</option>
                    {produtosAtivos.map(p => (
                      <option key={p.id} value={p.id} disabled={produtosSelecionados.some(ps => ps.produtoId === p.id)}>
                        {p.nome} (Estoque: {p.quantidade}) - R$ {p.precoVenda.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {produtosSelecionados.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-2">Nenhum produto selecionado.</p>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin">
                    {produtosSelecionados.map((p) => (
                      <div key={p.produtoId} className="flex items-center gap-2 text-xs bg-background p-2 rounded border border-border">
                        <span className="flex-1 truncate" title={p.nome}>{p.nome}</span>
                        <div className="flex items-center gap-1 w-24">
                          <label className="text-[10px] text-muted-foreground">Qtd:</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={p.quantidade}
                            onChange={(e) => alterarQuantidadeProduto(p.produtoId, Number(e.target.value))}
                            className="w-12 bg-accent/40 border border-border rounded px-1 py-0.5 text-center"
                          />
                        </div>
                        <span className="w-16 text-right font-medium text-muted-foreground">
                          {formatCurrency(p.quantidade * p.precoUnitario)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removerProduto(p.produtoId)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {erroEstoque && (
                <div className="p-2 bg-destructive/10 text-destructive text-xs rounded-md border border-destructive/20 font-medium">
                  {erroEstoque}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Qtde Total de Itens</label>
                  <input
                    type="number"
                    readOnly
                    value={itens}
                    className="w-full bg-accent/40 border border-border opacity-70 cursor-not-allowed focus:outline-none rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={valorTotal}
                    onChange={(e) => setValorTotal(Number(e.target.value))}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Forma de Pagamento</label>
                  <select
                    value={metodoPagamento}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Status Inicial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    <option value="confirmado">Confirmado</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
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
