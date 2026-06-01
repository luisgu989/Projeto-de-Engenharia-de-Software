"use client";

import React, { useState } from "react";
import { useClientes, Cliente } from "@/hooks/useClientes";
import { ResumoClientes } from "@/components/clientes/ResumoClientes";
import { TabelaClientes } from "@/components/clientes/TabelaClientes";
import { FormCliente } from "@/components/clientes/FormCliente";

export default function ClientesPage() {
  const {
    clientes,
    busca,
    setBusca,
    error,
    setError,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    totalClientes,
    clientesAtivos,
    clientesInativos,
    totalPF,
    totalPJ,
  } = useClientes();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const handleRegistrarClick = () => {
    setEditingCliente(null);
    setError(null);
    setFormOpen(true);
  };

  const handleEditClick = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setError(null);
    setFormOpen(true);
  };

  const handleSave = (dados: Omit<Cliente, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">) => {
    if (editingCliente) {
      // Update
      return atualizarCliente(editingCliente.id, dados);
    } else {
      // Add new
      return adicionarCliente(dados);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCliente(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Gestão de Clientes</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre clientes, visualize relatórios comerciais e gerencie registros fiscais e históricos.
        </p>
      </div>

      {/* KPI Cards / Metrics */}
      <ResumoClientes
        totalClientes={totalClientes}
        clientesAtivos={clientesAtivos}
        clientesInativos={clientesInativos}
        totalPF={totalPF}
        totalPJ={totalPJ}
      />

      {/* Interactive Sales List and Registrations */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold tracking-tight">Base de Clientes Cadastrados</h3>
        <TabelaClientes
          clientes={clientes}
          busca={busca}
          setBusca={setBusca}
          onEdit={handleEditClick}
          onDelete={removerCliente}
          onRegistrarClick={handleRegistrarClick}
        />
      </div>

      {/* Dialog Form for Create/Edit */}
      {formOpen && (
        <FormCliente
          clienteExistente={editingCliente}
          onSave={handleSave}
          onClose={handleFormClose}
          errorMessage={error}
          clearError={() => setError(null)}
        />
      )}
    </div>
  );
}
