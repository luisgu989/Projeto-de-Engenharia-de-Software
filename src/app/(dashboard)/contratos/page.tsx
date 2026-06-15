"use client";

import React from "react";
import { GerenciadorContratos } from "@/components/administrativo/GerenciadorContratos";

export default function ContratosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Gerenciamento de Contratos Empresariais
        </h2>
        <p className="text-sm text-muted-foreground">
          Cadastre contratos comerciais, financeiros e operacionais e assine documentos digitalmente com certificados válidos.
        </p>
      </div>

      <GerenciadorContratos />
    </div>
  );
}
