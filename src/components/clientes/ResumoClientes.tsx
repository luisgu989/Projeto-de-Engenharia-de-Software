import React from "react";
import { Users, UserCheck, ShieldAlert, Award, FileText } from "lucide-react";

interface ResumoClientesProps {
  totalClientes: number;
  clientesAtivos: number;
  clientesInativos: number;
  totalPF: number;
  totalPJ: number;
}

export function ResumoClientes({
  totalClientes,
  clientesAtivos,
  clientesInativos,
  totalPF,
  totalPJ,
}: ResumoClientesProps) {
  // Calculate percentage of active clients
  const taxaAtividade = totalClientes > 0 ? Math.round((clientesAtivos / totalClientes) * 100) : 0;

  const cards = [
    {
      title: "Total de Clientes",
      value: totalClientes.toString(),
      icon: Users,
      desc: "Clientes registrados na base",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Clientes Ativos",
      value: clientesAtivos.toString(),
      icon: UserCheck,
      desc: `${taxaAtividade}% de atividade comercial`,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Pessoas Físicas (PF)",
      value: totalPF.toString(),
      icon: Award,
      desc: "Cadastro via CPF",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      title: "Pessoas Jurídicas (PJ)",
      value: totalPJ.toString(),
      icon: FileText,
      desc: "Cadastro via CNPJ",
      color: "text-amber-500 bg-amber-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
