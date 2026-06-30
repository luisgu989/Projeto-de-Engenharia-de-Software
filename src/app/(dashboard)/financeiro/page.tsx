"use client";

import React, { useState } from "react";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { ResumoFinanceiro } from "@/components/financeiro/ResumoFinanceiro";
import { TabelaFinanceiro } from "@/components/financeiro/TabelaFinanceiro";
import { FaturamentoFiscal } from "@/components/financeiro/FaturamentoFiscal";
import { IntegracoesFinanceiras } from "@/components/financeiro/IntegracoesFinanceiras";
import { AutomacaoFinanceira } from "@/components/financeiro/AutomacaoFinanceira";
import { CentrosCusto } from "@/components/financeiro/CentrosCusto";
import { HistoricoAlteracoesFinanceiras } from "@/components/financeiro/HistoricoAlteracoesFinanceiras";
import { DollarSign, FileText, Link2, Cpu, Briefcase, History, TrendingDown, TrendingUp, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContasAPagar } from "@/components/financeiro/ContasAPagar";
import { ContasAReceber } from "@/components/financeiro/ContasAReceber";
import { GestaoImpostos } from "@/components/financeiro/GestaoImpostos";

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

  const [abaAtiva, setAbaAtiva] = useState<
    "caixa" | "pagar" | "receber" | "impostos" | "fiscal" | "integracoes" | "automacao" | "centroscusto" | "historicoalteracoes"
  >("caixa");

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

      <div className="flex border-b border-border no-print overflow-x-auto custom-scrollbar pb-px">
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
          onClick={() => setAbaAtiva("pagar")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "pagar"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingDown className="h-4 w-4" />
          Contas a Pagar
        </button>
        <button
          onClick={() => setAbaAtiva("receber")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "receber"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          Contas a Receber
        </button>
        <button
          onClick={() => setAbaAtiva("impostos")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "impostos"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Percent className="h-4 w-4" />
          Gestão de Impostos
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
        <button
          onClick={() => setAbaAtiva("automacao")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "automacao"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Cpu className="h-4 w-4" />
          Automação Financeira
        </button>
        <button
          onClick={() => setAbaAtiva("centroscusto")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "centroscusto"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="h-4 w-4" />
          Centros de Custo
        </button>
        <button
          onClick={() => setAbaAtiva("historicoalteracoes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "historicoalteracoes"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="h-4 w-4" />
          Auditoria Financeira
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

      {abaAtiva === "pagar" && <ContasAPagar />}

      {abaAtiva === "receber" && <ContasAReceber />}

      {abaAtiva === "impostos" && <GestaoImpostos />}

      {abaAtiva === "fiscal" && <FaturamentoFiscal />}

      {abaAtiva === "integracoes" && <IntegracoesFinanceiras />}

      {abaAtiva === "automacao" && <AutomacaoFinanceira />}

      {abaAtiva === "centroscusto" && <CentrosCusto />}

      {abaAtiva === "historicoalteracoes" && <HistoricoAlteracoesFinanceiras />}
    </div>
  );
}
