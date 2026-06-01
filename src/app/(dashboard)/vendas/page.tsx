"use client";

import React from "react";
import { useVendas } from "@/hooks/useVendas";
import { ResumoVendas } from "@/components/vendas/ResumoVendas";
import { TabelaVendas } from "@/components/vendas/TabelaVendas";

export default function VendasPage() {
  const {
    vendas,
    busca,
    setBusca,
    adicionarVenda,
    faturamentoTotal,
    ticketMedio,
  } = useVendas();

  const totalVendas = vendas.length;
  const pendentes = vendas.filter((v) => v.status === "pendente").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Módulo de Vendas</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie e registre as vendas, acompanhe indicadores e filtre transações.
        </p>
      </div>

      {/* KPI Cards / Metrics */}
      <ResumoVendas
        faturamentoTotal={faturamentoTotal}
        ticketMedio={ticketMedio}
        totalVendas={totalVendas}
        pendentes={pendentes}
      />

      {/* Interactive Sales List and Registrations */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold tracking-tight">Histórico de Lançamentos</h3>
        <TabelaVendas
          vendas={vendas}
          busca={busca}
          setBusca={setBusca}
          onAdicionarVenda={adicionarVenda}
        />
      </div>
    </div>
  );
}
