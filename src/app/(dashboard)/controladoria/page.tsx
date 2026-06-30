"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { DollarSign, FileText } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export default function ControladoriaPage() {
  const { user } = useAuth();

  const submodules = useMemo(() => {
    const items = [
      { title: "Financeiro", href: "/financeiro", icon: DollarSign, permission: user.permissions.visualizarFinanceiro },
      { title: "Contratos", href: "/contratos", icon: FileText, permission: user.permissions.visualizarFinanceiro },
    ];
    return items.filter(i => i.permission);
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Controladoria</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe fluxo de caixa, impostos, auditorias fiscais e assine contratos digitais corporativos.
        </p>
      </div>

      {/* Grid of Submodules (Solidus style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {submodules.map((sub) => {
          const Icon = sub.icon;
          return (
            <Link
              key={sub.href}
              href={sub.href}
              className="flex items-center justify-between p-6 bg-card border border-border hover:border-primary/20 hover:shadow-md transition-all duration-200 rounded-2xl group cursor-pointer"
            >
              <span className="font-extrabold text-foreground group-hover:text-primary transition-colors text-base">
                {sub.title}
              </span>
              <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
