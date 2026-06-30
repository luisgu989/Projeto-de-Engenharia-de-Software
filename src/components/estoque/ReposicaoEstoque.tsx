import React, { useState } from "react";
import { useEstoque } from "@/hooks/useEstoque";
import { useOrdensCompra, listaFornecedores } from "@/hooks/useOrdensCompra";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle, ShoppingCart } from "lucide-react";

export function ReposicaoEstoque() {
  const { estoque } = useEstoque();
  const { adicionarOrdemCompra } = useOrdensCompra();

  const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState<Record<string, string>>({});
  const [successMessages, setSuccessMessages] = useState<Record<string, string>>({});

  const itensAbaixoDoMinimo = estoque.filter((item) => item.quantidade <= item.estoqueMinimo);

  const handleFornecedorChange = (id: string, fornecedor: string) => {
    setFornecedoresSelecionados((prev) => ({ ...prev, [id]: fornecedor }));
  };

  const handleSolicitarCompra = (produtoId: string, produtoNome: string, quantidadeSugerida: number) => {
    const fornecedor = fornecedoresSelecionados[produtoId] || listaFornecedores[0];
    const success = adicionarOrdemCompra(fornecedor, produtoId, produtoNome, quantidadeSugerida);
    if (success) {
      setSuccessMessages((prev) => ({ ...prev, [produtoId]: `Ordem de Compra criada com sucesso para ${fornecedor}!` }));
      setTimeout(() => {
        setSuccessMessages((prev) => {
          const next = { ...prev };
          delete next[produtoId];
          return next;
        });
      }, 4000);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500">
          <RefreshCw className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Automação de Reposição de Estoque</h3>
          <p className="text-xs text-muted-foreground">Sugestões de ordens de compra baseadas no estoque mínimo</p>
        </div>
      </div>

      <div className="p-6">
        {itensAbaixoDoMinimo.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500/20 mb-3" />
            <span className="text-xs font-semibold text-muted-foreground">
              Estoque abastecido. Nenhum produto abaixo do limite mínimo.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                    <th className="p-3 text-left">Produto</th>
                    <th className="p-3 text-left">Categoria</th>
                    <th className="p-3 text-center">Qtd Atual</th>
                    <th className="p-3 text-center">Qtd Mínima</th>
                    <th className="p-3 text-amber-600 dark:text-amber-500 text-center">Reposição Sugerida</th>
                    <th className="p-3 text-left">Fornecedor</th>
                    <th className="p-3 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {itensAbaixoDoMinimo.map((item) => {
                    const quantidadeSugerida = Math.max(10, item.estoqueMinimo * 2 - item.quantidade);
                    const isSuccess = !!successMessages[item.id];
                    const selectedFornecedor = fornecedoresSelecionados[item.id] || listaFornecedores[0];

                    return (
                      <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                        <td className="p-3 font-bold text-foreground text-left">
                          {item.nome}
                          <span className="block font-mono text-[9px] text-muted-foreground font-normal">SKU: {item.sku}</span>
                        </td>
                        <td className="p-3 text-muted-foreground font-medium text-left">{item.categoria}</td>
                        <td className="p-3 font-semibold text-center">{item.quantidade} un.</td>
                        <td className="p-3 text-muted-foreground font-semibold text-center">{item.estoqueMinimo} un.</td>
                        <td className="p-3 font-extrabold text-amber-600 dark:text-amber-500 text-center">{quantidadeSugerida} un.</td>
                        <td className="p-3 text-left">
                          <select
                            value={selectedFornecedor}
                            onChange={(e) => handleFornecedorChange(item.id, e.target.value)}
                            disabled={isSuccess}
                            className="bg-accent/60 border border-border rounded px-2.5 py-1 text-xs cursor-pointer focus:outline-none"
                          >
                            {listaFornecedores.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          {isSuccess ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                              <CheckCircle className="h-3 w-3" /> Solicitado
                            </span>
                          ) : (
                            <Button
                              size="xs"
                              onClick={() => handleSolicitarCompra(item.id, item.nome, quantidadeSugerida)}
                              className="h-7 text-[10px] font-bold gap-1 shadow-sm"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              Solicitar
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-start gap-2.5 p-4 rounded-xl border border-blue-500/10 bg-blue-500/[0.02] text-blue-600 dark:text-blue-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Como funciona a sugestão?</span>
                <p className="mt-0.5 opacity-90 leading-relaxed">
                  O sistema analisa produtos cujo saldo está abaixo do estoque mínimo e propõe uma compra de lote equivalente a duas vezes o estoque mínimo menos o saldo atual, mantendo o giro de vendas operacional ativo.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
