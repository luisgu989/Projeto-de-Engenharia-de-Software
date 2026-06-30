"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { BarChart3, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export default function InteligenciaPage() {
  const { user } = useAuth();

  const submodules = useMemo(() => {
    return [
      { title: "Relatórios", href: "/relatorios", icon: BarChart3 },
      { title: "BI & Analítico", href: "/analitico", icon: Sparkles },
    ];
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Inteligência de Negócio</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe relatórios operacionais estruturados e insights analíticos em tempo real.
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
