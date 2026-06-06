"use client";

import React from "react";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { ResumoFuncionarios } from "@/components/funcionarios/ResumoFuncionarios";
import { TabelaFuncionarios } from "@/components/funcionarios/TabelaFuncionarios";

export default function FuncionariosPage() {
  const {
    funcionarios,
    busca,
    setBusca,
    error,
    setError,
    adicionarFuncionario,
    atualizarFuncionario,
    removerFuncionario,
    totalFuncionarios,
    ativos,
    inativos,
  } = useFuncionarios();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Gestão de Equipe</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie o cadastro de colaboradores, cargos, departamentos e acompanhe alterações via logs de auditoria.
        </p>
      </div>

      {/* KPI Stats */}
      <ResumoFuncionarios
        totalFuncionarios={totalFuncionarios}
        ativos={ativos}
        inativos={inativos}
      />

      {/* Interactive Team Table */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold tracking-tight">Colaboradores Cadastrados</h3>
        <TabelaFuncionarios
          funcionarios={funcionarios}
          busca={busca}
          setBusca={setBusca}
          onAdicionarFuncionario={adicionarFuncionario}
          onAtualizarFuncionario={atualizarFuncionario}
          onRemoverFuncionario={removerFuncionario}
          error={error}
          setError={setError}
        />
      </div>
    </div>
  );
}
