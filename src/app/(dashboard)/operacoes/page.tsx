"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Package, Hammer, Truck, Layers } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export default function OperacoesPage() {
  const { user } = useAuth();

  const submodules = useMemo(() => {
    const items = [
      { title: "Estoque", href: "/estoque", icon: Package, permission: user.permissions.visualizarEstoque },
      { title: "Produção", href: "/producao", icon: Hammer, permission: user.permissions.visualizarEstoque },
      { title: "Logística", href: "/logistica", icon: Truck, permission: user.permissions.visualizarEstoque },
      { title: "Ativos & Patrimônio", href: "/ativos", icon: Layers, permission: user.permissions.visualizarEstoque },
    ];
    return items.filter(i => i.permission);
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Operações & Logística</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie inventário, produção fabril, frotas, movimentação logística e patrimônio ativo.
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
              className="flex items-center justify-between p-6 bg-card border border-border hover:border-rose-500/20 hover:shadow-md transition-all duration-200 rounded-2xl group cursor-pointer"
            >
              <span className="font-extrabold text-foreground group-hover:text-rose-600 transition-colors text-base">
                {sub.title}
              </span>
              <div className="p-3 bg-rose-600/10 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all shrink-0">
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
