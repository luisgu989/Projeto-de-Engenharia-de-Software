import React, { useState, useEffect } from "react";
import { useLotes } from "@/hooks/useLotes";
import { useEstoque } from "@/hooks/useEstoque";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Barcode, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LotesValidades() {
  const { lotes, adicionarLote, removerLote, errorMessage } = useLotes();
  const { estoque } = useEstoque();

  const [numeroLote, setNumeroLote] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [selectedProdutoId, setSelectedProdutoId] = useState<string | null>(null);
  const produtoId = selectedProdutoId || (estoque.length > 0 ? estoque[0].id : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = estoque.find((p) => p.id === produtoId);
    if (!product) return;

    const success = adicionarLote(numeroLote, numeroSerie, dataValidade, produtoId, product.nome);
    if (success) {
      setNumeroLote("");
      setNumeroSerie("");
      setDataValidade("");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Barcode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Rastreamento de Lotes e Validades</h3>
            <p className="text-xs text-muted-foreground">Controle de validade e número de série dos produtos</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {lotes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhum lote ou número de série registrado.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">ID</th>
                  <th className="p-3 text-left">Produto</th>
                  <th className="p-3 text-center">Nº Lote</th>
                  <th className="p-3 text-center">Nº Série</th>
                  <th className="p-3 text-center">Data de Validade</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {lotes.map((item) => {
                  const expirationDate = new Date(item.dataValidade + "T23:59:59");
                  const today = new Date();
                  const isExpired = expirationDate < today;
                  const isCloseToExpiration = !isExpired && (expirationDate.getTime() - today.getTime()) < 30 * 86400000;

                  return (
                    <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-3 font-mono font-semibold text-center">{item.id}</td>
                      <td className="p-3 font-bold text-foreground text-left">
                        {item.produtoNome}
                        <span className="block font-mono text-[9px] text-muted-foreground font-normal">ID: {item.produtoId}</span>
                      </td>
                      <td className="p-3 font-mono font-medium text-foreground text-center">{item.numeroLote}</td>
                      <td className="p-3 font-mono text-muted-foreground font-medium text-center">{item.numeroSerie}</td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap",
                            isExpired
                              ? "bg-destructive/10 text-destructive"
                              : isCloseToExpiration
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {item.dataValidade} {isExpired ? "(Expirado)" : isCloseToExpiration ? "(Próximo do vencimento)" : ""}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removerLote(item.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Registrar Lote / Validade</h3>
            <p className="text-xs text-muted-foreground">Cadastrar informações de lote e série do produto</p>
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
              Número do Lote
            </label>
            <Input
              value={numeroLote}
              onChange={(e) => setNumeroLote(e.target.value)}
              placeholder="Ex: LOT-2026-X1"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Número de Série
            </label>
            <Input
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
              placeholder="Ex: SN-12345-AB"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Data de Validade (Futura)
            </label>
            <Input
              type="date"
              value={dataValidade}
              onChange={(e) => setDataValidade(e.target.value)}
              className="h-9 text-xs cursor-pointer"
              required
            />
          </div>

          <Button type="submit" className="w-full h-9 text-xs font-semibold shadow-md shadow-primary/20">
            Registrar Lote
          </Button>
        </form>
      </div>
    </div>
  );
}
