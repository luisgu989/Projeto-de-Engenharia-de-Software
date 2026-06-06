import React from "react";
import { Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * ConfigEmpresa: Responsabilidade única — formulário de dados cadastrais da empresa.
 */
export function ConfigEmpresa() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Dados da Empresa</h3>
          <p className="text-xs text-muted-foreground">Informações cadastrais e fiscais</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Razão Social
            </label>
            <Input defaultValue="ERP Pro Soluções Ltda" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nome Fantasia
            </label>
            <Input defaultValue="ERP Pro" className="h-9" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              CNPJ
            </label>
            <Input defaultValue="12.345.678/0001-99" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Inscrição Estadual
            </label>
            <Input defaultValue="123.456.789.012" className="h-9" />
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Endereço
            </label>
            <Input defaultValue="Av. Paulista, 1000 — Sala 45" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              CEP
            </label>
            <Input defaultValue="01310-100" className="h-9" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Cidade
            </label>
            <Input defaultValue="São Paulo" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Estado
            </label>
            <Input defaultValue="SP" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Telefone
            </label>
            <Input defaultValue="(11) 3000-0000" className="h-9" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="sm" className="h-9">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
