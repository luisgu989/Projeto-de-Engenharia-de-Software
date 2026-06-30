import React, { useState, useEffect } from "react";
import { useOrdensCompra, listaFornecedores } from "@/hooks/useOrdensCompra";
import { useEstoque } from "@/hooks/useEstoque";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrdensCompra() {
  const {
    ordensCompra,
    adicionarOrdemCompra,
    atualizarStatusOrdemCompra,
    removerOrdemCompra,
    errorMessage,
  } = useOrdensCompra();

  const { estoque } = useEstoque();

  const [fornecedor, setFornecedor] = useState(listaFornecedores[0]);
  const [selectedProdutoId, setSelectedProdutoId] = useState<string | null>(null);
  const produtoId = selectedProdutoId || (estoque.length > 0 ? estoque[0].id : "");
  const [quantidade, setQuantidade] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = estoque.find((p) => p.id === produtoId);
    if (!product) return;

    const success = adicionarOrdemCompra(fornecedor, produtoId, product.nome, quantidade);
    if (success) {
      setQuantidade(10);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Ordens de Compra</h3>
            <p className="text-xs text-muted-foreground">Gerenciamento e acompanhamento de suprimentos</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {ordensCompra.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhuma ordem de compra solicitada.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">ID</th>
                  <th className="p-3 text-left">Fornecedor</th>
                  <th className="p-3 text-left">Produto</th>
                  <th className="p-3 text-center">Qtd</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Data</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ordensCompra.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-3 font-mono font-semibold text-center">{item.id}</td>
                    <td className="p-3 font-medium text-foreground text-left">{item.fornecedor}</td>
                    <td className="p-3 font-bold text-foreground text-left">
                      {item.produtoNome}
                      <span className="block font-mono text-[9px] text-muted-foreground font-normal">ID: {item.produtoId}</span>
                    </td>
                    <td className="p-3 font-semibold text-center">{item.quantidade} un.</td>
                    <td className="p-3 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap",
                          item.status === "entregue"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : item.status === "aprovada"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : item.status === "cancelada"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground text-center">
                      {new Date(item.dataSolicitacao).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3 space-x-1.5 whitespace-nowrap text-center">
                      {item.status === "pendente" && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => atualizarStatusOrdemCompra(item.id, "aprovada")}
                          className="h-7 px-2 text-[10px] font-semibold text-blue-600 hover:bg-blue-500/10"
                        >
                          Aprovar
                        </Button>
                      )}
                      {item.status === "aprovada" && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => atualizarStatusOrdemCompra(item.id, "entregue")}
                          className="h-7 px-2 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-500/10"
                        >
                          Receber
                        </Button>
                      )}
                      {item.status !== "entregue" && item.status !== "cancelada" && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => atualizarStatusOrdemCompra(item.id, "cancelada")}
                          className="h-7 px-2 text-[10px] font-semibold text-destructive hover:bg-destructive/10"
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removerOrdemCompra(item.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Nova Ordem de Compra</h3>
            <p className="text-xs text-muted-foreground">Solicitar suprimentos de produtos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Fornecedor
            </label>
            <select
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
            >
              {listaFornecedores.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Produto
            </label>
            {estoque.length === 0 ? (
              <div className="text-xs text-muted-foreground">Nenhum produto cadastrado no estoque.</div>
            ) : (
              <select
                value={produtoId}
                onChange={(e) => setSelectedProdutoId(e.target.value)}
                className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                {estoque.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome} (Estoque: {item.quantidade} un.)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Quantidade
            </label>
            <Input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
              className="h-9 text-xs"
              required
            />
          </div>

          <Button type="submit" className="w-full h-9 text-xs font-semibold shadow-md shadow-primary/20">
            Criar Ordem de Compra
          </Button>
        </form>
      </div>
    </div>
  );
}
