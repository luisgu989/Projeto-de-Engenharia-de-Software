import React from "react";
import { Briefcase, UserCheck, UserX } from "lucide-react";

interface ResumoFuncionariosProps {
  totalFuncionarios: number;
  ativos: number;
  inativos: number;
}

export function ResumoFuncionarios({
  totalFuncionarios,
  ativos,
  inativos,
}: ResumoFuncionariosProps) {
  const cards = [
    {
      title: "Total de Colaboradores",
      value: totalFuncionarios,
      description: "Funcionários registrados no ERP",
      icon: Briefcase,
      className: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/15",
    },
    {
      title: "Ativos",
      value: ativos,
      description: "Colaboradores em atividade",
      icon: UserCheck,
      className: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/15",
    },
    {
      title: "Inativos",
      value: inativos,
      description: "Colaboradores desligados ou inativos",
      icon: UserX,
      className: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/15",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-xl border bg-gradient-to-br ${card.className} p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                {card.title}
              </span>
              <div className={`rounded-lg p-2 ${card.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
