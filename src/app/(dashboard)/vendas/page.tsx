"use client";

import React, { useState } from "react";
import { useVendas } from "@/hooks/useVendas";
import { ResumoVendas } from "@/components/vendas/ResumoVendas";
import { TabelaVendas } from "@/components/vendas/TabelaVendas";
import { TabelasPrecos } from "@/components/vendas/TabelasPrecos";
import { ShoppingCart, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VendasPage() {
  const {
    vendas,
    busca,
    setBusca,
    adicionarVenda,
    faturamentoTotal,
    ticketMedio,
  } = useVendas();

  const [abaAtiva, setAbaAtiva] = useState<"vendas" | "tabelas">("vendas");

  const totalVendas = vendas.length;
  const pendentes = vendas.filter((v) => v.status === "pendente").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Módulo de Vendas</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie e registre as vendas, configure tabelas de preços comerciais e filtre transações.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border no-print overflow-x-auto custom-scrollbar pb-px">
        <button
          onClick={() => setAbaAtiva("vendas")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "vendas"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          Lançamentos de Vendas
        </button>
        <button
          onClick={() => setAbaAtiva("tabelas")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "tabelas"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Tag className="h-4 w-4" />
          Tabelas de Preços
        </button>
      </div>

      {abaAtiva === "vendas" && (
        <>
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
        </>
      )}

      {abaAtiva === "tabelas" && <TabelasPrecos />}
    </div>
  );
}
