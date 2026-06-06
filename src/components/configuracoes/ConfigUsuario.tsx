import React from "react";
import { UserCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * ConfigUsuario: Responsabilidade única — formulário de dados do usuário logado.
 */
export function ConfigUsuario() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <UserCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Perfil do Usuário</h3>
          <p className="text-xs text-muted-foreground">Dados pessoais e credenciais de acesso</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Avatar section */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
              US
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium">Usuário Suporte</p>
            <p className="text-xs text-muted-foreground">Administrador do sistema</p>
            <Button variant="outline" size="sm" className="h-7 text-xs mt-1">
              Alterar foto
            </Button>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nome Completo
            </label>
            <Input defaultValue="Usuário Suporte" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              E-mail
            </label>
            <Input defaultValue="admin@erppro.com" type="email" className="h-9" />
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Alterar Senha
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nova Senha
            </label>
            <Input type="password" placeholder="••••••••" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Confirmar Senha
            </label>
            <Input type="password" placeholder="••••••••" className="h-9" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="sm" className="h-9">
            Salvar Perfil
          </Button>
        </div>
      </div>
    </div>
  );
}
