"use client";

import React, { useState } from "react";
import { ConfigEmpresa } from "@/components/configuracoes/ConfigEmpresa";
import { ConfigUsuario } from "@/components/configuracoes/ConfigUsuario";
import { ConfigSeguranca } from "@/components/configuracoes/ConfigSeguranca";
import { ConfigLogs } from "@/components/configuracoes/ConfigLogs";
import { useAuth } from "@/contexts/auth-context";
import { UserCircle, Building2, ShieldCheck, History } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<"perfil" | "empresa" | "seguranca" | "logs">("perfil");
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Configurações
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie os dados da empresa, preferências de acesso dos colaboradores e consulte logs de auditoria geral.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("perfil")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "perfil"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <UserCircle className="h-4 w-4" />
          Meu Perfil
        </button>
        <button
          onClick={() => setActiveTab("empresa")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "empresa"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          Dados da Empresa
        </button>
        
        {/* Only admins can configure permissions (US021) */}
        {user.role === "admin" && (
          <button
            onClick={() => setActiveTab("seguranca")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
              activeTab === "seguranca"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            Segurança & Permissões
          </button>
        )}

        {/* Access logs of audit (US022) */}
        {user.permissions.verLogsAuditoria && (
          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
              activeTab === "logs"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="h-4 w-4" />
            Auditoria do Sistema
          </button>
        )}
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        {activeTab === "perfil" && <ConfigUsuario />}
        {activeTab === "empresa" && <ConfigEmpresa />}
        {activeTab === "seguranca" && user.role === "admin" && <ConfigSeguranca />}
        {activeTab === "logs" && user.permissions.verLogsAuditoria && <ConfigLogs />}
      </div>
    </div>
  );
}
