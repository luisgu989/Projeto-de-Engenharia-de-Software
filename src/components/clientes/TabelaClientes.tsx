"use client";

import React, { useState } from "react";
import { Cliente } from "@/hooks/useClientes";
import { Search, Plus, Edit, Trash2, Info, CheckCircle, AlertTriangle, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TabelaClientesProps {
  clientes: Cliente[];
  busca: string;
  setBusca: (busca: string) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onRegistrarClick: () => void;
}

export function TabelaClientes({
  clientes,
  busca,
  setBusca,
  onEdit,
  onDelete,
  onRegistrarClick,
}: TabelaClientesProps) {
  const [activeAudit, setActiveAudit] = useState<Cliente | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Table Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, documento ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-card hover:bg-accent/30 focus:bg-background rounded-md pl-9 pr-4 py-2 text-sm border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
          />
        </div>

        {/* Create Client Button */}
        <Button
          onClick={onRegistrarClick}
          className="flex items-center gap-2 shadow-md shadow-primary/10 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Cliente
        </Button>
      </div>

      {/* Main Table Container */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">CÓDIGO</th>
                <th className="p-4 text-left">NOME / RAZÃO SOCIAL</th>
                <th className="p-4 text-left">DOCUMENTO (CPF/CNPJ)</th>
                <th className="p-4 text-center">CONTATO</th>
                <th className="p-4 text-center">LOCALIZAÇÃO</th>
                <th className="p-4 text-center">STATUS</th>
                <th className="p-4 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Nenhum cliente cadastrado ou correspondente à busca.
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-accent/20 transition-colors"
                  >
                    <td className="p-4 font-mono font-semibold text-foreground/80 text-center">
                      {cliente.id}
                    </td>
                    <td className="p-4 text-left">
                      <div className="font-medium text-foreground">{cliente.nome}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold">
                        Pessoa {cliente.tipo === "PF" ? "Física (PF)" : "Jurídica (PJ)"}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-left">
                      {cliente.documento}
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-xs">{cliente.email}</div>
                      <div className="text-[10px] text-muted-foreground">{cliente.telefone}</div>
                    </td>
                    <td className="p-4 text-muted-foreground text-center">
                      {cliente.cidade} - {cliente.estado}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full",
                          cliente.status === "ativo"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Audit Details Trigger */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActiveAudit(cliente)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                          title="Ver Detalhes de Auditoria"
                        >
                          <Info className="h-4 w-4" />
                        </Button>

                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(cliente)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent"
                          title="Editar Cadastro"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
                              onDelete(cliente.id);
                            }
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-accent"
                          title="Remover Cadastro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Exibição de Logs de Auditoria */}
      {activeAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Histórico de Auditoria
              </h3>
              <button
                onClick={() => setActiveAudit(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                Fechar
              </button>
            </div>

            {/* Logs timeline */}
            <div className="p-5 space-y-6">
              <div className="text-xs space-y-1">
                <div className="text-muted-foreground">Cliente selecionado:</div>
                <div className="font-semibold text-sm">{activeAudit.nome}</div>
                <div className="text-[10px] font-mono text-muted-foreground">ID: {activeAudit.id}</div>
              </div>

              <div className="space-y-4 border-l border-border pl-4 ml-2 relative">
                {/* Creation event */}
                <div className="relative space-y-1">
                  <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-card" />
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Criado por {activeAudit.criadoPor}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(activeAudit.criadoEm)}
                  </div>
                </div>

                {/* Edit event if exists */}
                {activeAudit.atualizadoEm && (
                  <div className="relative space-y-1">
                    <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-card" />
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      Última atualização por {activeAudit.atualizadoPor}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(activeAudit.atualizadoEm)}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setActiveAudit(null)}
                  className="text-xs"
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
