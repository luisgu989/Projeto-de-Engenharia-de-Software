import React from "react";
import { TrendingUp, Target, DollarSign, BarChart2 } from "lucide-react";

interface ResumoOportunidadesProps {
  totalAbertas: number;
  valorPipelineTotal: number;
  valorGanhoTotal: number;
  taxaConversao: number;
}

export function ResumoOportunidades({
  totalAbertas,
  valorPipelineTotal,
  valorGanhoTotal,
  taxaConversao,
}: ResumoOportunidadesProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);

  const cards = [
    {
      title: "Oportunidades Abertas",
      value: totalAbertas.toString(),
      icon: Target,
      desc: "Negociações ativas no pipeline",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Valor do Pipeline",
      value: formatCurrency(valorPipelineTotal),
      icon: TrendingUp,
      desc: "Receita potencial estimada",
      color: "text-violet-500 bg-violet-500/10",
    },
    {
      title: "Receita Fechada",
      value: formatCurrency(valorGanhoTotal),
      icon: DollarSign,
      desc: "Oportunidades ganhas no período",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Taxa de Conversão",
      value: `${taxaConversao}%`,
      icon: BarChart2,
      desc: "Ganhos sobre fechados (ganho + perdido)",
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
            className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {card.title}
              </span>
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
