import React from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";

interface ResumoFinanceiroProps {
  totalReceber: number;
  totalPagar: number;
  saldoProjetado: number;
  totalVencidos: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * ResumoFinanceiro: Exibe cards de KPI do módulo financeiro.
 * Responsabilidade única: renderização dos indicadores de saúde financeira.
 */
export function ResumoFinanceiro({
  totalReceber,
  totalPagar,
  saldoProjetado,
  totalVencidos,
}: ResumoFinanceiroProps) {
  const kpis = [
    {
      title: "A Receber",
      value: formatCurrency(totalReceber),
      icon: TrendingUp,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
      description: "Contas em aberto",
    },
    {
      title: "A Pagar",
      value: formatCurrency(totalPagar),
      icon: TrendingDown,
      color: "from-red-500/20 to-rose-500/20 text-red-600 dark:text-red-400",
      description: "Obrigações pendentes",
    },
    {
      title: "Saldo Realizado",
      value: formatCurrency(saldoProjetado),
      icon: DollarSign,
      color: saldoProjetado >= 0
        ? "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400"
        : "from-red-500/20 to-rose-500/20 text-red-600 dark:text-red-400",
      description: "Caixa efetivado",
    },
    {
      title: "Lançamentos Vencidos",
      value: String(totalVencidos),
      icon: AlertTriangle,
      color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
      description: "Requer atenção imediata",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="group p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">{kpi.value}</h3>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
