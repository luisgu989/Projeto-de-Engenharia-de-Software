"use client";

import React, { useState } from "react";
import { ConfigEmpresa } from "@/components/configuracoes/ConfigEmpresa";
import { ConfigUsuario } from "@/components/configuracoes/ConfigUsuario";
import { ConfigSeguranca } from "@/components/configuracoes/ConfigSeguranca";
import { ConfigLogs } from "@/components/configuracoes/ConfigLogs";
import { ConfigFiliais } from "@/components/configuracoes/ConfigFiliais";
import { ConfigBackup } from "@/components/configuracoes/ConfigBackup";
import { ConfigMFA } from "@/components/configuracoes/ConfigMFA";
import { ConfigSessoes } from "@/components/configuracoes/ConfigSessoes";
import { ConfigCriptografia } from "@/components/configuracoes/ConfigCriptografia";
import { ConfigLGPD } from "@/components/configuracoes/ConfigLGPD";
import { ConfigAnonimizacao } from "@/components/configuracoes/ConfigAnonimizacao";
import { ConfigRecuperacao } from "@/components/configuracoes/ConfigRecuperacao";
import { useAuth } from "@/contexts/auth-context";
import {
  UserCircle,
  Building2,
  ShieldCheck,
  History,
  Network,
  Database,
  KeyRound,
  Lock,
  Shield,
  UserX,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ConfiguracoesTab =
  | "perfil"
  | "empresa"
  | "filiais"
  | "seguranca"
  | "mfa"
  | "sessoes"
  | "criptografia"
  | "lgpd"
  | "anonimizacao"
  | "recuperacao"
  | "logs"
  | "backup";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<ConfiguracoesTab>("perfil");
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Configurações
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie os dados da empresa, preferências de acesso dos colaboradores, telemetria de segurança e consultoria de LGPD.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border gap-1 overflow-x-auto custom-scrollbar pb-px">
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

        <button
          onClick={() => setActiveTab("filiais")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "filiais"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Network className="h-4 w-4" />
          Filiais e Unidades
        </button>

        {/* MFA available for all users */}
        <button
          onClick={() => setActiveTab("mfa")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "mfa"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <KeyRound className="h-4 w-4" />
          Autenticação Multifator (MFA)
        </button>
        
        {/* Only admins can configure permissions (US021) */}
        {user.role === "admin" && (
          <>
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

            {/* Sessions Management */}
            <button
              onClick={() => setActiveTab("sessoes")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "sessoes"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Network className="h-4 w-4" />
              Sessões Ativas
            </button>

            {/* Cryptographic Protection Layers */}
            <button
              onClick={() => setActiveTab("criptografia")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "criptografia"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock className="h-4 w-4" />
              Criptografia de Dados
            </button>

            {/* LGPD Consent */}
            <button
              onClick={() => setActiveTab("lgpd")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "lgpd"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Shield className="h-4 w-4" />
              Consentimento LGPD
            </button>

            {/* Anonimização de Dados */}
            <button
              onClick={() => setActiveTab("anonimizacao")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "anonimizacao"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <UserX className="h-4 w-4" />
              Anonimização de Dados
            </button>

            {/* Recuperação de Desastres */}
            <button
              onClick={() => setActiveTab("recuperacao")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "recuperacao"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <RotateCcw className="h-4 w-4" />
              Recuperação de Desastres
            </button>
          </>
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

        {user.role === "admin" && (
          <button
            onClick={() => setActiveTab("backup")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
              activeTab === "backup"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Database className="h-4 w-4" />
            Backup & Restauração
          </button>
        )}
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        {activeTab === "perfil" && <ConfigUsuario />}
        {activeTab === "empresa" && <ConfigEmpresa />}
        {activeTab === "filiais" && <ConfigFiliais />}
        {activeTab === "mfa" && <ConfigMFA />}
        {activeTab === "seguranca" && user.role === "admin" && <ConfigSeguranca />}
        {activeTab === "sessoes" && user.role === "admin" && <ConfigSessoes />}
        {activeTab === "criptografia" && user.role === "admin" && <ConfigCriptografia />}
        {activeTab === "lgpd" && user.role === "admin" && <ConfigLGPD />}
        {activeTab === "anonimizacao" && user.role === "admin" && <ConfigAnonimizacao />}
        {activeTab === "recuperacao" && user.role === "admin" && <ConfigRecuperacao />}
        {activeTab === "logs" && user.permissions.verLogsAuditoria && <ConfigLogs />}
        {activeTab === "backup" && user.role === "admin" && <ConfigBackup />}
      </div>
    </div>
  );
}

