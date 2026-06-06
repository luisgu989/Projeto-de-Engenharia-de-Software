import React from "react";
import { ConfigEmpresa } from "@/components/configuracoes/ConfigEmpresa";
import { ConfigUsuario } from "@/components/configuracoes/ConfigUsuario";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Configurações
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie os dados da empresa, preferências do sistema e informações do seu perfil.
        </p>
      </div>

      {/* Sections */}
      <ConfigEmpresa />
      <ConfigUsuario />
    </div>
  );
}
