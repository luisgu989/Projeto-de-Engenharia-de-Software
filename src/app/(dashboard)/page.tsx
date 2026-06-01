import React from "react";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  // Mock data for ERP Dashboard
  const kpis = [
    {
      title: "Faturamento Mensal",
      value: "R$ 45.231,89",
      change: "+12.5%",
      positive: true,
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Vendas Realizadas",
      value: "354",
      change: "+8.2%",
      positive: true,
      icon: ShoppingCart,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Produtos em Estoque",
      value: "1.289",
      change: "-2.4%",
      positive: false,
      icon: Package,
      color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Novos Clientes",
      value: "+48",
      change: "+18.1%",
      positive: true,
      icon: Users,
      color: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400",
    },
  ];

  const recentSales = [
    { id: "1", customer: "Ana Silva", status: "Confirmado", value: "R$ 1.250,00", date: "Hoje, 14:32" },
    { id: "2", customer: "Carlos Souza", status: "Pendente", value: "R$ 420,50", date: "Hoje, 11:15" },
    { id: "3", customer: "Juliana Santos", status: "Confirmado", value: "R$ 3.890,00", date: "Ontem, 17:40" },
    { id: "4", customer: "Marcos Oliveira", status: "Cancelado", value: "R$ 150,00", date: "Ontem, 10:20" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Bem-vindo ao ERP Pro</h2>
          <p className="text-sm text-muted-foreground">
            Aqui está o resumo geral das operações da sua empresa hoje.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button variant="outline" size="sm" className="h-9">
            Filtrar Período
          </Button>
          <Button size="sm" className="h-9 shadow-md shadow-primary/20">
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
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
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center text-xs font-semibold ${
                      kpi.positive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    }`}
                  >
                    {kpi.positive ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {kpi.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs. mês anterior</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Sales / Transactions */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg tracking-tight">Vendas Recentes</h3>
              <p className="text-xs text-muted-foreground">Monitoramento de transações em tempo real</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              Ver Todas
            </Button>
          </div>

          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/40 transition-colors border border-transparent hover:border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center font-bold text-xs">
                    {sale.customer
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{sale.customer}</h4>
                    <p className="text-xs text-muted-foreground">{sale.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      sale.status === "Confirmado"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : sale.status === "Pendente"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {sale.status}
                  </span>
                  <span className="text-sm font-bold tracking-tight">{sale.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status / Quick Info */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg tracking-tight">Status do Sistema</h3>
            <p className="text-xs text-muted-foreground">Indicadores de integridade operacional</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Capacidade do Estoque</span>
                <span className="text-muted-foreground">64%</span>
              </div>
              <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "64%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Metas de Vendas do Mês</span>
                <span className="text-muted-foreground">78%</span>
              </div>
              <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "78%" }} />
              </div>
            </div>

            <div className="h-px bg-border my-2" />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status API ERP</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1.5 before:content-[''] before:h-2 before:w-2 before:bg-emerald-500 before:rounded-full">
                  Operacional
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sincronização Fiscal</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1.5 before:content-[''] before:h-2 before:w-2 before:bg-emerald-500 before:rounded-full">
                  Atualizada
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
