"use client";

import React, { useState } from "react";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { useAuth, UserPermissions } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";
import { ShieldCheck, UserCheck, ShieldAlert, KeyRound, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfigSeguranca() {
  const { funcionarios } = useFuncionarios();
  const { getUserPermissions, updateUserPermissions } = useAuth();
  const { addLog } = useLogs();

  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<any>(null);
  const [permissoesEditaveis, setPermissoesEditaveis] = useState<UserPermissions | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleSelectColaborador = (c: any) => {
    setColaboradorSelecionado(c);
    const perms = getUserPermissions(c.email, c.cargo.toLowerCase().includes("gerente") ? "admin" : "employee", c.cargo);
    setPermissoesEditaveis(perms);
  };

  const handleTogglePermission = (key: keyof UserPermissions) => {
    if (!permissoesEditaveis) return;
    setPermissoesEditaveis({
      ...permissoesEditaveis,
      [key]: !permissoesEditaveis[key],
    });
  };

  const handleSalvarPermissoes = () => {
    if (!colaboradorSelecionado || !permissoesEditaveis) return;

    updateUserPermissions(colaboradorSelecionado.email, permissoesEditaveis);
    addLog(
      `Alterou as permissões de acesso do colaborador ${colaboradorSelecionado.nome} (${colaboradorSelecionado.email})`,
      "seguranca"
    );

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Label map for readable translations
  const permissionLabels: Record<keyof UserPermissions, { title: string; desc: string }> = {
    visualizarEstoque: {
      title: "Visualizar Estoque",
      desc: "Permite ver os itens do catálogo e saldo de inventário.",
    },
    movimentarEstoque: {
      title: "Registrar Entradas e Saídas",
      desc: "Permite dar entrada e registrar saídas físicas de mercadorias no estoque.",
    },
    gerenciarEstoque: {
      title: "Gerenciar Cadastro de Produtos",
      desc: "Permite cadastrar novos produtos, editar e excluir permanentemente do catálogo.",
    },
    visualizarFinanceiro: {
      title: "Visualizar Painel Financeiro",
      desc: "Permite ter acesso a dados de caixa, faturamento e fluxo financeiro.",
    },
    gerenciarEquipe: {
      title: "Gerenciar Equipe (Colaboradores)",
      desc: "Permite contratar, desligar, editar dados de funcionários e alterar permissões.",
    },
    verLogsAuditoria: {
      title: "Visualizar Logs de Auditoria",
      desc: "Acesso privilegiado aos rastros e logs de segurança e conformidade de todo o sistema.",
    },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="h-5 w-5 text-white shrink-0" />
          <span className="text-sm font-semibold">Permissões salvas com sucesso!</span>
        </div>
      )}

      {/* Collaborator Selector Panel */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden lg:col-span-1 flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Lista de Colaboradores</h3>
            <p className="text-xs text-muted-foreground">Selecione para configurar acessos</p>
          </div>
        </div>

        <div className="p-4 flex-1 space-y-2 max-h-[400px] overflow-y-auto">
          {funcionarios.filter(f => f.status === "ativo").length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-6">
              Nenhum colaborador ativo cadastrado no sistema.
            </div>
          ) : (
            funcionarios
              .filter((f) => f.status === "ativo")
              .map((c) => {
                const isSelected = colaboradorSelecionado?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectColaborador(c)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border text-xs flex flex-col gap-1 transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                        : "bg-accent/10 border-transparent hover:bg-accent/30 text-foreground"
                    )}
                  >
                    <span className="font-semibold text-sm">{c.nome}</span>
                    <span className="text-muted-foreground font-mono">{c.email}</span>
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-border/50 text-[10px]">
                      <span className="font-medium text-foreground/80">{c.cargo}</span>
                      <span className="text-muted-foreground">{c.departamento}</span>
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* Permissions Editor Panel */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Privilégios e Papéis</h3>
            <p className="text-xs text-muted-foreground">Configuração de chaves de permissão da conta</p>
          </div>
        </div>

        {colaboradorSelecionado && permissoesEditaveis ? (
          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            {/* Header Selected info */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/50">
              <div className="text-xs">
                <span className="text-muted-foreground">Editando acessos de:</span>
                <div className="font-bold text-sm text-foreground">{colaboradorSelecionado.nome}</div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground">
                {colaboradorSelecionado.id}
              </span>
            </div>

            {/* Checkboxes List */}
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.keys(permissionLabels) as Array<keyof UserPermissions>).map((key) => {
                const label = permissionLabels[key];
                const active = permissoesEditaveis[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTogglePermission(key)}
                    className={cn(
                      "text-left p-3 rounded-lg border flex gap-3 transition-all cursor-pointer hover:border-border",
                      active
                        ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                        : "bg-card border-border text-foreground"
                    )}
                  >
                    <div className="pt-0.5">
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center transition-all",
                        active ? "bg-emerald-600 border-emerald-600 text-white" : "border-muted-foreground bg-transparent"
                      )}>
                        {active && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-foreground">{label.title}</div>
                      <p className="text-[10px] text-muted-foreground leading-normal">{label.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-border pt-4 flex justify-end">
              <Button onClick={handleSalvarPermissoes} className="text-xs font-semibold px-4 cursor-pointer">
                Salvar Configurações
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-3">
            <ShieldAlert className="h-8 w-8 text-muted-foreground/50" />
            <div className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Nenhum colaborador selecionado. Escolha um colaborador ativo na lista lateral para ajustar suas permissões de acesso.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
