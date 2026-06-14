"use client";

import React from "react";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { ResumoFuncionarios } from "@/components/funcionarios/ResumoFuncionarios";
import { TabelaFuncionarios } from "@/components/funcionarios/TabelaFuncionarios";
import { useAuth } from "@/contexts/auth-context";
import { ShieldAlert } from "lucide-react";

export default function FuncionariosPage() {
  const { user } = useAuth();
  
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

  // Route protection (US021)
  if (!user.permissions.gerenciarEquipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4 bg-card border border-border rounded-2xl shadow-sm animate-in fade-in duration-300">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Acesso Negado</h3>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          Você não possui privilégios de acesso suficientes para gerenciar colaboradores do sistema.
          Contate um administrador para solicitar a atribuição de papéis ou permissões.
        </p>
      </div>
    );
  }

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
