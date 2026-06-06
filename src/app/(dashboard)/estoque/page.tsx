"use client";

import React from "react";
import { useEstoque } from "@/hooks/useEstoque";
import { ResumoEstoque } from "@/components/estoque/ResumoEstoque";
import { TabelaEstoque } from "@/components/estoque/TabelaEstoque";

export default function EstoquePage() {
  const {
    estoque,
    busca,
    setBusca,
    error,
    setError,
    adicionarItem,
    atualizarItem,
    registrarMovimentacao,
    valorTotalEstoque,
    totalItens,
    alertasBaixoEstoque,
  } = useEstoque();

  const totalProdutos = estoque.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Controle de Estoque</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie o inventário de produtos, defina limites mínimos de segurança e ajuste saldos físicos.
        </p>
      </div>

      {/* KPI Stats */}
      <ResumoEstoque
        valorTotalEstoque={valorTotalEstoque}
        totalItens={totalItens}
        alertasBaixoEstoque={alertasBaixoEstoque}
        totalProdutos={totalProdutos}
      />

      {/* Interactive Inventory Table */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold tracking-tight">Itens do Catálogo</h3>
        <TabelaEstoque
          estoque={estoque}
          busca={busca}
          setBusca={setBusca}
          onAdicionarItem={adicionarItem}
          onAjustarEstoque={registrarMovimentacao}
          onAtualizarItem={atualizarItem}
          error={error}
          setError={setError}
        />
      </div>
    </div>
  );
}
