"use client";

import React, { useState } from "react";
import { useClientes, Cliente } from "@/hooks/useClientes";
import { ResumoClientes } from "@/components/clientes/ResumoClientes";
import { TabelaClientes } from "@/components/clientes/TabelaClientes";
import { FormCliente } from "@/components/clientes/FormCliente";
import { RelacionamentoClientes } from "@/components/clientes/RelacionamentoClientes";
import { Users, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const [abaAtiva, setAbaAtiva] = useState<"base" | "crm">("base");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      const success = atualizarCliente(editingCliente.id, dados);
      if (success) {
        setSuccessMessage(`Cliente "${dados.nome}" atualizado com sucesso!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
      return success;
    } else {
      const success = adicionarCliente(dados);
      if (success) {
        setSuccessMessage(`Cliente "${dados.nome}" cadastrado com sucesso!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
      return success;
    }
  };

  const handleDelete = (id: string) => {
    removerCliente(id);
    setSuccessMessage("Cliente removido da base de dados.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCliente(null);
    setError(null);
  };

  return (
    <div className="space-y-6 relative">
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Gestão de Clientes</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre clientes, visualize relatórios e gerencie interações de relacionamento CRM.
        </p>
      </div>

      <div className="flex border-b border-border no-print overflow-x-auto custom-scrollbar pb-px">
        <button
          onClick={() => setAbaAtiva("base")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "base"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Base de Clientes
        </button>
        <button
          onClick={() => setAbaAtiva("crm")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            abaAtiva === "crm"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <HeartHandshake className="h-4 w-4" />
          Relacionamento (CRM)
        </button>
      </div>

      {abaAtiva === "base" && (
        <>
          <ResumoClientes
            totalClientes={totalClientes}
            clientesAtivos={clientesAtivos}
            clientesInativos={clientesInativos}
            totalPF={totalPF}
            totalPJ={totalPJ}
          />

          <div className="space-y-2">
            <h3 className="text-base font-semibold tracking-tight">Base de Clientes Cadastrados</h3>
            <TabelaClientes
              clientes={clientes}
              busca={busca}
              setBusca={setBusca}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onRegistrarClick={handleRegistrarClick}
            />
          </div>

          {formOpen && (
            <FormCliente
              clienteExistente={editingCliente}
              onSave={handleSave}
              onClose={handleFormClose}
              errorMessage={error}
              clearError={() => setError(null)}
            />
          )}
        </>
      )}

      {abaAtiva === "crm" && <RelacionamentoClientes />}
    </div>
  );
}
