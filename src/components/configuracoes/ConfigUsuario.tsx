"use client";

import React, { useState, useEffect } from "react";
import { UserCircle, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

/**
 * ConfigUsuario: Responsabilidade única — formulário de dados do usuário logado.
 */
export function ConfigUsuario() {
  const { user, updateUser } = useAuth();
  const { addLog } = useLogs();

  const [nome, setNome] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [showToast, setShowToast] = useState(false);

  // Sync state with selected simulated profile
  useEffect(() => {
    setNome(user.name);
    setEmail(user.email);
  }, [user]);

  const handleSalvarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;

    updateUser(nome.trim(), email.trim());
    addLog(`Atualizou as informações pessoais de seu perfil`, "seguranca");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getInitials = (n: string) => {
    return n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="h-5 w-5 text-white shrink-0" />
          <span className="text-sm font-semibold">Perfil atualizado com sucesso!</span>
        </div>
      )}

      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <UserCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Perfil do Usuário</h3>
          <p className="text-xs text-muted-foreground">Dados pessoais e credenciais de acesso</p>
        </div>
      </div>

      <form onSubmit={handleSalvarPerfil} className="p-6 space-y-5">
        {/* Avatar section */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary uppercase">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              {user.role === "admin" ? "Administrador do Sistema" : "Colaborador Administrativo"}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="perfil-nome" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Nome Completo
            </label>
            <Input
              id="perfil-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="h-9 text-xs text-foreground bg-card"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="perfil-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              E-mail
            </label>
            <Input
              id="perfil-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 text-xs text-foreground bg-card"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Alterar Senha
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="perfil-senha" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Nova Senha
            </label>
            <Input id="perfil-senha" type="password" placeholder="••••••••" className="h-9 bg-card text-xs" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="perfil-confirma" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Confirmar Senha
            </label>
            <Input id="perfil-confirma" type="password" placeholder="••••••••" className="h-9 bg-card text-xs" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" className="h-9 text-xs font-semibold cursor-pointer px-4">
            Salvar Perfil
          </Button>
        </div>
      </form>
    </div>
  );
}
