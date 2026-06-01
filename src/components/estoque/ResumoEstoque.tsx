import React from "react";
import { Package, AlertTriangle, BadgeDollarSign, Layers } from "lucide-react";

interface ResumoEstoqueProps {
  valorTotalEstoque: number;
  totalItens: number;
  alertasBaixoEstoque: number;
  totalProdutos: number;
}

export function ResumoEstoque({
  valorTotalEstoque,
  totalItens,
  alertasBaixoEstoque,
  totalProdutos,
}: ResumoEstoqueProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const cards = [
    {
      title: "Patrimônio em Estoque",
      value: formatCurrency(valorTotalEstoque),
      icon: BadgeDollarSign,
      desc: "Avaliado pelo preço de custo",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Volume Total de Peças",
      value: totalItens.toLocaleString("pt-BR"),
      icon: Package,
      desc: "Soma de todas as unidades",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Tipos de Produtos",
      value: totalProdutos.toString(),
      icon: Layers,
      desc: "SKUs cadastrados no catálogo",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      title: "Alertas de Baixo Estoque",
      value: alertasBaixoEstoque.toString(),
      icon: AlertTriangle,
      desc: "Produtos atingiram limite mínimo",
      color: alertasBaixoEstoque > 0 ? "text-destructive bg-destructive/10 animate-pulse" : "text-muted-foreground bg-accent",
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
