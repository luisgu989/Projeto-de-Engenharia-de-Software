"use client";

import React from "react";
import { useOportunidades } from "@/hooks/useOportunidades";
import { ResumoOportunidades } from "@/components/oportunidades/ResumoOportunidades";
import { TabelaOportunidades } from "@/components/oportunidades/TabelaOportunidades";

export default function OportunidadesPage() {
  const {
    oportunidades,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    adicionarOportunidade,
    totalAbertas,
    valorPipelineTotal,
    valorGanhoTotal,
    taxaConversao,
  } = useOportunidades();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Oportunidades Comerciais
        </h2>
        <p className="text-sm text-muted-foreground">
          Registre e acompanhe negociações em andamento para controlar o
          pipeline de vendas da empresa.
        </p>
      </div>

      {/* KPIs */}
      <ResumoOportunidades
        totalAbertas={totalAbertas}
        valorPipelineTotal={valorPipelineTotal}
        valorGanhoTotal={valorGanhoTotal}
        taxaConversao={taxaConversao}
      />

      {/* Table Section */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold tracking-tight">
          Pipeline de Negociações
        </h3>
        <TabelaOportunidades
          oportunidades={oportunidades}
          busca={busca}
          setBusca={setBusca}
          filtroStatus={filtroStatus}
          setFiltroStatus={setFiltroStatus}
          onAdicionarOportunidade={adicionarOportunidade}
        />
      </div>
    </div>
  );
}
