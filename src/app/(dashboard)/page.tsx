"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { config, salvarConfig, restaurarPadrao } = useDashboardConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tempNome, setTempNome] = useState(config.nomeDashboard);
  const [tempPeriodo, setTempPeriodo] = useState(config.periodoFiltro);
  const [tempKpis, setTempKpis] = useState<string[]>(config.kpisAtivos);
  const [tempWidgets, setTempWidgets] = useState<string[]>(config.widgetsAtivos);

  const handleOpenModal = () => {
    setTempNome(config.nomeDashboard);
    setTempPeriodo(config.periodoFiltro);
    setTempKpis(config.kpisAtivos);
    setTempWidgets(config.widgetsAtivos);
    setIsModalOpen(true);
  };

  const kpiMap = {
    faturamento: {
      title: "Faturamento Mensal",
      value: "R$ 45.231,89",
      change: "+12.5%",
      positive: true,
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
    },
    vendas: {
      title: "Vendas Realizadas",
      value: "354",
      change: "+8.2%",
      positive: true,
      icon: ShoppingCart,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400",
    },
    estoque: {
      title: "Produtos em Estoque",
      value: "1.289",
      change: "-2.4%",
      positive: false,
      icon: Package,
      color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
    },
    clientes: {
      title: "Novos Clientes",
      value: "+48",
      change: "+18.1%",
      positive: true,
      icon: Users,
      color: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400",
    },
  };

  const recentSales = [
    { id: "1", customer: "Ana Silva", status: "Confirmado", value: "R$ 1.250,00", date: "Hoje, 14:32" },
    { id: "2", customer: "Carlos Souza", status: "Pendente", value: "R$ 420,50", date: "Hoje, 11:15" },
    { id: "3", customer: "Juliana Santos", status: "Confirmado", value: "R$ 3.890,00", date: "Ontem, 17:40" },
    { id: "4", customer: "Marcos Oliveira", status: "Cancelado", value: "R$ 150,00", date: "Ontem, 10:20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {config.nomeDashboard || "Bem-vindo ao ERP Pro"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Aqui está o resumo geral das operações da sua empresa nos últimos {config.periodoFiltro} dias.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button onClick={handleOpenModal} variant="outline" size="sm" className="h-9 gap-1.5 cursor-pointer">
            <Settings className="h-4 w-4" />
            Personalizar Painel
          </Button>
        </div>
      </div>

      {config.kpisAtivos.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-border rounded-xl bg-card text-xs text-muted-foreground font-semibold">
          Nenhum KPI ativado. Configure as opções clicando em "Personalizar Painel".
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {config.kpisAtivos.map((kpiKey) => {
            const kpi = kpiMap[kpiKey as keyof typeof kpiMap];
            if (!kpi) return null;
            const Icon = kpi.icon;
            return (
              <div
                key={kpiKey}
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
                      className={cn(
                        "inline-flex items-center text-xs font-semibold",
                        kpi.positive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive"
                      )}
                    >
                      {kpi.positive ? (
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      )}
                      {kpi.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs. anterior</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {config.widgetsAtivos.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 border border-dashed border-border rounded-xl bg-card">
          <Settings className="h-8 w-8 text-muted-foreground/30" />
          <div className="text-xs text-muted-foreground font-semibold">
            Nenhum widget ativo. Clique em "Personalizar Painel" no banner para ativar blocos visuais.
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {config.widgetsAtivos.includes("vendasRecentes") && (
            <div className={cn(
              "p-6 rounded-xl border border-border bg-card shadow-sm space-y-6",
              config.widgetsAtivos.includes("statusSistema") ? "lg:col-span-2" : "lg:col-span-3"
            )}>
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
                        className={cn(
                          "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                          sale.status === "Confirmado"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : sale.status === "Pendente"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {sale.status}
                      </span>
                      <span className="text-sm font-bold tracking-tight">{sale.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {config.widgetsAtivos.includes("statusSistema") && (
            <div className={cn(
              "p-6 rounded-xl border border-border bg-card shadow-sm space-y-6",
              config.widgetsAtivos.includes("vendasRecentes") ? "lg:col-span-1" : "lg:col-span-3"
            )}>
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
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Personalizar Painel
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Nome do Painel</label>
                <input
                  type="text"
                  value={tempNome}
                  onChange={(e) => setTempNome(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Período Padrão</label>
                <select
                  value={tempPeriodo}
                  onChange={(e) => setTempPeriodo(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all text-foreground"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">KPIs Ativos</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(kpiMap).map((kpiKey) => {
                    const active = tempKpis.includes(kpiKey);
                    return (
                      <button
                        key={kpiKey}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setTempKpis(tempKpis.filter((k) => k !== kpiKey));
                          } else {
                            setTempKpis([...tempKpis, kpiKey]);
                          }
                        }}
                        className={cn(
                          "text-left p-2.5 rounded-lg border text-xs font-semibold capitalize cursor-pointer transition-all",
                          active ? "bg-primary/10 border-primary text-primary" : "bg-card border-border hover:bg-accent/20"
                        )}
                      >
                        {kpiKey}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">Widgets Ativos</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "vendasRecentes", label: "Vendas Recentes" },
                    { key: "statusSistema", label: "Status do Sistema" }
                  ].map((w) => {
                    const active = tempWidgets.includes(w.key);
                    return (
                      <button
                        key={w.key}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setTempWidgets(tempWidgets.filter((key) => key !== w.key));
                          } else {
                            setTempWidgets([...tempWidgets, w.key]);
                          }
                        }}
                        className={cn(
                          "text-left p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                          active ? "bg-primary/10 border-primary text-primary" : "bg-card border-border hover:bg-accent/20"
                        )}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-between gap-2">
                <button
                  onClick={() => {
                    restaurarPadrao();
                    setIsModalOpen(false);
                  }}
                  className="px-3 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Restaurar Padrão
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-2 bg-accent hover:bg-accent/80 text-foreground text-xs font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      salvarConfig({
                        nomeDashboard: tempNome.trim() || "Painel Principal",
                        kpisAtivos: tempKpis,
                        widgetsAtivos: tempWidgets,
                        periodoFiltro: tempPeriodo,
                      });
                      setIsModalOpen(false);
                    }}
                    className="px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg shadow transition-all cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
