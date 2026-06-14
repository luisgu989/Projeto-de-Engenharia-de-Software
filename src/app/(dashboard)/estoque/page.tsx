"use client";

import React, { useState } from "react";
import { useEstoque } from "@/hooks/useEstoque";
import { ResumoEstoque } from "@/components/estoque/ResumoEstoque";
import { TabelaEstoque } from "@/components/estoque/TabelaEstoque";
import { HistoricoMovimentacoes } from "@/components/estoque/HistoricoMovimentacoes";
import { RelatoriosEstoque } from "@/components/estoque/RelatoriosEstoque";
import { Package, CalendarDays, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EstoquePage() {
  const {
    estoque,
    todosItens,
    busca,
    setBusca,
    error,
    setError,
    adicionarItem,
    atualizarItem,
    removerItem,
    registrarMovimentacao,
    valorTotalEstoque,
    totalItens,
    alertasBaixoEstoque,
  } = useEstoque();

  const [abaAtiva, setAbaAtiva] = useState<"inventario" | "movimentacoes" | "relatorios">("inventario");
  const totalProdutos = estoque.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4 no-print">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Controle de Estoque</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie o inventário de produtos, registre movimentações e visualize relatórios operacionais e financeiros.
        </p>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex border-b border-border no-print">
        <button
          onClick={() => setAbaAtiva("inventario")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer",
            abaAtiva === "inventario"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Package className="h-4 w-4" />
          Catálogo & Inventário
        </button>
        <button
          onClick={() => setAbaAtiva("movimentacoes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer",
            abaAtiva === "movimentacoes"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarDays className="h-4 w-4" />
          Histórico de Movimentações
        </button>
        <button
          onClick={() => setAbaAtiva("relatorios")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer",
            abaAtiva === "relatorios"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart2 className="h-4 w-4" />
          Relatórios & Consolidação
        </button>
      </div>

      {/* Conditional Tab Content */}
      <div className="space-y-6">
        {abaAtiva === "inventario" && (
          <>
            {/* KPI Stats */}
            <div className="no-print">
              <ResumoEstoque
                valorTotalEstoque={valorTotalEstoque}
                totalItens={totalItens}
                alertasBaixoEstoque={alertasBaixoEstoque}
                totalProdutos={totalProdutos}
              />
            </div>

            {/* Interactive Inventory Table */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold tracking-tight no-print">Itens do Catálogo</h3>
              <TabelaEstoque
                estoque={estoque}
                busca={busca}
                setBusca={setBusca}
                onAdicionarItem={adicionarItem}
                onAjustarEstoque={registrarMovimentacao}
                onAtualizarItem={atualizarItem}
                onRemoverItem={removerItem}
                error={error}
                setError={setError}
              />
            </div>
          </>
        )}

        {abaAtiva === "movimentacoes" && (
          <div className="space-y-2">
            <h3 className="text-base font-semibold tracking-tight">Registro Cronológico de Movimentações</h3>
            <HistoricoMovimentacoes estoque={todosItens || estoque} />
          </div>
        )}

        {abaAtiva === "relatorios" && (
          <div className="space-y-2">
            <h3 className="text-base font-semibold tracking-tight no-print">Geração de Demonstrativos de Estoque</h3>
            <RelatoriosEstoque estoque={todosItens || estoque} />
          </div>
        )}
      </div>
    </div>
  );
}
