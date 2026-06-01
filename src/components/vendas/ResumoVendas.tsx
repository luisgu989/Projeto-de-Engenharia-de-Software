import React from "react";
import { TrendingUp, ShoppingBag, CreditCard, Clock } from "lucide-react";

interface ResumoVendasProps {
  faturamentoTotal: number;
  ticketMedio: number;
  totalVendas: number;
  pendentes: number;
}

export function ResumoVendas({
  faturamentoTotal,
  ticketMedio,
  totalVendas,
  pendentes,
}: ResumoVendasProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const cards = [
    {
      title: "Faturamento Confirmado",
      value: formatCurrency(faturamentoTotal),
      icon: TrendingUp,
      desc: "Vendas com status Confirmado",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(ticketMedio),
      icon: CreditCard,
      desc: "Média por venda confirmada",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Total de Vendas",
      value: totalVendas.toString(),
      icon: ShoppingBag,
      desc: "Volume de pedidos no período",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      title: "Pedidos Pendentes",
      value: pendentes.toString(),
      icon: Clock,
      desc: "Aguardando pagamento",
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
