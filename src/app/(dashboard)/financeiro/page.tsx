"use client";

import React, { useState } from "react";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { ResumoFinanceiro } from "@/components/financeiro/ResumoFinanceiro";
import { TabelaFinanceiro } from "@/components/financeiro/TabelaFinanceiro";
import { FaturamentoFiscal } from "@/components/financeiro/FaturamentoFiscal";
import { IntegracoesFinanceiras } from "@/components/financeiro/IntegracoesFinanceiras";
import { DollarSign, FileText, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const [abaAtiva, setAbaAtiva] = useState<"caixa" | "fiscal" | "integracoes">("caixa");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Módulo Financeiro
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie contas a pagar e a receber, acompanhe o fluxo de caixa e controle integrações e notas fiscais.
        </p>
      </div>

      <div className="flex border-b border-border no-print overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAbaAtiva("caixa")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "caixa"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <DollarSign className="h-4 w-4" />
          Fluxo de Caixa
        </button>
        <button
          onClick={() => setAbaAtiva("fiscal")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "fiscal"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="h-4 w-4" />
          Faturamento Fiscal
        </button>
        <button
          onClick={() => setAbaAtiva("integracoes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "integracoes"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Link2 className="h-4 w-4" />
          Integrações Financeiras
        </button>
      </div>

      {abaAtiva === "caixa" && (
        <>
          <ResumoFinanceiro
            totalReceber={totalReceber}
            totalPagar={totalPagar}
            saldoProjetado={saldoProjetado}
            totalVencidos={totalVencidos}
          />

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
        </>
      )}

      {abaAtiva === "fiscal" && <FaturamentoFiscal />}

      {abaAtiva === "integracoes" && <IntegracoesFinanceiras />}
    </div>
  );
}
