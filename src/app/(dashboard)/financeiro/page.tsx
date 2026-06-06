"use client";

import React from "react";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { ResumoFinanceiro } from "@/components/financeiro/ResumoFinanceiro";
import { TabelaFinanceiro } from "@/components/financeiro/TabelaFinanceiro";

export default function FinanceiroPage() {
  const {
    lancamentos,
    busca,
    setBusca,
    filtroTipo,
    setFiltroTipo,
    adicionarLancamento,
    totalReceber,
    totalPagar,
    saldoProjetado,
    totalVencidos,
  } = useFinanceiro();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Módulo Financeiro
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie contas a pagar e a receber, acompanhe o fluxo de caixa e monitore vencimentos.
        </p>
      </div>

      {/* KPI Cards */}
      <ResumoFinanceiro
        totalReceber={totalReceber}
        totalPagar={totalPagar}
        saldoProjetado={saldoProjetado}
        totalVencidos={totalVencidos}
      />

      {/* Tabela de Lançamentos */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold tracking-tight">
          Lançamentos Financeiros
        </h3>
        <TabelaFinanceiro
          lancamentos={lancamentos}
          busca={busca}
          setBusca={setBusca}
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          onAdicionarLancamento={adicionarLancamento}
        />
      </div>
    </div>
  );
}
