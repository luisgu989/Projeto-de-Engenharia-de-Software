"use client";

import React, { useState, useEffect } from "react";
import { useProducao, OrdemProducao } from "@/hooks/useProducao";
import { useEstoque } from "@/hooks/useEstoque";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  Plus,
  Hammer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Trash2,
  Play,
  Check,
  Pause,
  Sliders,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function ProducaoPage() {
  const { user } = useAuth();
  const {
    ordens,
    recursos,
    adicionarOP,
    atualizarOPStatus,
    removerOP,
    calcularCargaRecurso,
  } = useProducao();
  const { estoque } = useEstoque();

  const cargo = user.cargo?.toLowerCase() || "";
  const isGerente = user.role === "admin" || cargo.includes("gerente") || cargo.includes("diretor");

  // State
  const [dataFiltroRecurso, setDataFiltroRecurso] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [formOpen, setFormOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"todas" | "planejado" | "em_producao" | "concluido">("todas");

  // Form Fields
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(10);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [dataPrevisao, setDataPrevisao] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [recursoId, setRecursoId] = useState("");
  const [prioridade, setPrioridade] = useState<"baixa" | "media" | "alta">("media");
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Live Load Warning in Form
  const [cargaPrevia, setCargaPrevia] = useState(0);

  useEffect(() => {
    if (recursoId && dataInicio) {
      const cargaExistente = calcularCargaRecurso(recursoId, dataInicio);
      const recursoSel = recursos.find((r) => r.id === recursoId);
      const capacidadeMax = recursoSel ? recursoSel.capacidadeMax : 100;
      const cargaNova = Math.round((quantidade / capacidadeMax) * 100);
      setCargaPrevia(cargaExistente + cargaNova);
    } else {
      setCargaPrevia(0);
    }
  }, [recursoId, dataInicio, quantidade, recursos, calcularCargaRecurso]);

  // Set default resource in form
  useEffect(() => {
    if (recursos.length > 0 && !recursoId) {
      setRecursoId(recursos[0].id);
    }
  }, [recursos, recursoId]);

  // Set default product in form
  useEffect(() => {
    if (estoque.length > 0 && !produtoId) {
      setProdutoId(estoque[0].id);
    }
  }, [estoque, produtoId]);

  // Calculations
  const ordensAtivas = ordens.filter(
    (o) => o.status === "planejado" || o.status === "em_producao"
  );
  const ordensConcluidas = ordens.filter((o) => o.status === "concluido");
  
  // Products with low stock (under limit) - Demand (US075)
  const produtosAbaixoDoMinimo = estoque.filter(
    (p) => p.quantidade <= p.estoqueMinimo
  );

  const handleCreateOP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    if (!produtoId) {
      setErrorForm("Por favor, selecione um produto.");
      return;
    }
    if (quantidade <= 0) {
      setErrorForm("A quantidade deve ser maior do que zero.");
      return;
    }
    if (!dataInicio || !dataPrevisao) {
      setErrorForm("Defina as datas de início e previsão.");
      return;
    }
    if (new Date(dataInicio) > new Date(dataPrevisao)) {
      setErrorForm("A data de início não pode ser posterior à data de previsão.");
      return;
    }
    if (!recursoId) {
      setErrorForm("Selecione o recurso operacional.");
      return;
    }

    const produtoNome = estoque.find((p) => p.id === produtoId)?.nome || "Produto";

    const sucesso = adicionarOP({
      produtoId,
      produtoNome,
      quantidade,
      dataInicio,
      dataPrevisao,
      recursoId,
      prioridade,
    });

    if (sucesso) {
      setFormOpen(false);
      // reset form
      setQuantidade(10);
      setErrorForm(null);
    }
  };

  const handleQuickSchedule = (prod: typeof estoque[0]) => {
    if (!isGerente) return;
    setProdutoId(prod.id);
    // suggest quantity to bring stock up to double minimum
    const sugerido = Math.max(10, prod.estoqueMinimo * 2 - prod.quantidade);
    setQuantidade(sugerido);
    
    // Auto select logical resource
    let recId = "REC-001"; // default Linha A
    if (prod.categoria.toLowerCase().includes("periférico")) recId = "REC-001";
    else if (prod.categoria.toLowerCase().includes("acessório")) recId = "REC-002";
    else if (prod.categoria.toLowerCase().includes("áudio")) recId = "REC-005";
    else if (prod.categoria.toLowerCase().includes("monitor")) recId = "REC-003";
    setRecursoId(recId);
    
    setFormOpen(true);
  };

  const ordensFiltradas = ordens.filter((o) => {
    if (abaAtiva === "todas") return true;
    return o.status === abaAtiva;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4 no-print">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Planejamento Operacional de Produção
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie ordens produtivas alinhadas à capacidade de maquinário e à demanda de vendas e estoque.
          </p>
        </div>
        {isGerente && (
          <Button
            onClick={() => setFormOpen(true)}
            className="h-9 shadow-md shadow-primary/20 shrink-0 gap-2 font-semibold"
          >
            <Plus className="h-4 w-4" /> Planejar Nova OP
          </Button>
        )}
      </div>

      {/* Role Notice Banner */}
      {!isGerente && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 no-print">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            <strong>Acesso Restrito:</strong> Como você não está logado como gerente, as ações de agendamento e alteração de status estão em modo de leitura. Use o seletor no topo da página para alternar o perfil.
          </span>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 no-print">
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">OPs Ativas</span>
            <h3 className="text-2xl font-extrabold tracking-tight">{ordensAtivas.length}</h3>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Concluídas este mês</span>
            <h3 className="text-2xl font-extrabold tracking-tight">{ordensConcluidas.length}</h3>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Demanda Pendente</span>
            <h3 className="text-2xl font-extrabold tracking-tight text-amber-600 dark:text-amber-500">
              {produtosAbaixoDoMinimo.length} produtos
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Recursos Operando</span>
            <h3 className="text-2xl font-extrabold tracking-tight">
              {recursos.length} Ativos
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Hammer className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Resource Loads & Demand Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resource Capacity Load Indicator */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
            <div className="space-y-0.5">
              <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-primary" />
                Carga Operacional de Recursos
              </h3>
              <p className="text-xs text-muted-foreground">
                Consumo de capacidade das máquinas no dia selecionado.
              </p>
            </div>
            {/* Date Picker Filter */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={dataFiltroRecurso}
                onChange={(e) => setDataFiltroRecurso(e.target.value)}
                className="bg-accent/40 border border-border text-xs px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {recursos.map((rec) => {
              const carga = calcularCargaRecurso(rec.id, dataFiltroRecurso);
              const isOverloaded = carga > 100;
              const barColor = isOverloaded
                ? "bg-destructive"
                : carga > 75
                ? "bg-amber-500"
                : "bg-emerald-500";

              return (
                <div key={rec.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span>{rec.nome}</span>
                      <span className="text-[10px] text-muted-foreground font-medium bg-accent px-1.5 py-0.5 rounded">
                        {rec.tipo}
                      </span>
                    </div>
                    <span className={cn(isOverloaded && "text-destructive font-bold flex items-center gap-0.5")}>
                      {carga}% {isOverloaded && <AlertTriangle className="h-3 w-3" />}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", barColor)}
                      style={{ width: `${Math.min(100, carga)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Máx: {rec.capacidadeMax} {rec.unidade.split("/")[0]}</span>
                    <span>
                      Alocado:{" "}
                      {Math.round((carga / 100) * rec.capacidadeMax)}{" "}
                      {rec.unidade.split("/")[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demand Alignment (Low Stock Items) */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              Alinhamento com Demanda
            </h3>
            <p className="text-xs text-muted-foreground">
              Produtos com estoque crítico necessitando de reposição produtiva.
            </p>
          </div>

          <div className="space-y-3 max-h-[295px] overflow-y-auto pr-1">
            {produtosAbaixoDoMinimo.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500/20 mb-2" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Tudo em ordem! Nenhum produto está com estoque crítico.
                </span>
              </div>
            ) : (
              produtosAbaixoDoMinimo.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-accent/20 transition-all gap-3"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold truncate max-w-[180px] sm:max-w-none">
                      {prod.nome}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Cat: {prod.categoria}</span>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-500 font-semibold">
                        Qtd: {prod.quantidade} (Mín: {prod.estoqueMinimo})
                      </span>
                    </div>
                  </div>

                  {isGerente ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSchedule(prod)}
                      className="h-7 text-[10px] font-bold border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground gap-1 hover:border-transparent transition-all"
                    >
                      Planejar <ChevronRight className="h-3 w-3" />
                    </Button>
                  ) : (
                    <span className="text-[10px] font-semibold text-destructive px-2 py-0.5 rounded bg-destructive/10 uppercase tracking-wide">
                      Crítico
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Orders Manager */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        {/* Table/List Header tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex gap-2 border border-border p-0.5 rounded-lg bg-accent/40 w-fit no-print">
            {(["todas", "planejado", "em_producao", "concluido"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setAbaAtiva(tab)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-bold capitalize transition-all cursor-pointer",
                  abaAtiva === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "em_producao" ? "Em Produção" : tab === "todas" ? "Ver Todas" : tab}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            {ordensFiltradas.length} ordens encontradas
          </div>
        </div>

        {/* Orders Content */}
        {ordensFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/20 mb-2 animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground">
              Nenhuma ordem de produção correspondente cadastrada.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/80">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="bg-accent/40 border-b border-border text-xs font-bold text-muted-foreground">
                  <th className="p-3">Cód OP</th>
                  <th className="p-3">Produto</th>
                  <th className="p-3 text-right">Qtd</th>
                  <th className="p-3">Recurso Alocado</th>
                  <th className="p-3">Início</th>
                  <th className="p-3">Previsão</th>
                  <th className="p-3">Prioridade</th>
                  <th className="p-3">Status</th>
                  {isGerente && <th className="p-3 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {ordensFiltradas.map((op) => {
                  const recursoNome = recursos.find((r) => r.id === op.recursoId)?.nome || "Recurso";
                  return (
                    <tr
                      key={op.id}
                      className={cn(
                        "hover:bg-accent/10 transition-colors",
                        op.status === "concluido" && "bg-emerald-500/5 dark:bg-emerald-500/[0.02]"
                      )}
                    >
                      <td className="p-3 font-bold">{op.id}</td>
                      <td className="p-3 font-medium">
                        <div className="flex flex-col">
                          <span>{op.produtoNome}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">ID: {op.produtoId}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-extrabold">{op.quantidade}</td>
                      <td className="p-3 font-medium text-muted-foreground">{recursoNome}</td>
                      <td className="p-3 font-medium">{op.dataInicio}</td>
                      <td className="p-3 font-medium">{op.dataPrevisao}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            op.prioridade === "alta"
                              ? "bg-destructive/10 text-destructive"
                              : op.prioridade === "media"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          )}
                        >
                          {op.prioridade}
                        </span>
                      </td>
                      <td className="p-3">
                        {isGerente && op.status !== "concluido" ? (
                          <select
                            value={op.status}
                            onChange={(e) =>
                              atualizarOPStatus(op.id, e.target.value as OrdemProducao["status"])
                            }
                            className="bg-accent/60 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-xs"
                          >
                            <option value="planejado">Planejado</option>
                            <option value="em_producao">Em Produção</option>
                            <option value="concluido">Concluir</option>
                            <option value="suspenso">Suspenso</option>
                          </select>
                        ) : (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              op.status === "concluido"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : op.status === "em_producao"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : op.status === "suspenso"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-accent text-muted-foreground"
                            )}
                          >
                            {op.status === "em_producao" ? "Em Produção" : op.status}
                          </span>
                        )}
                      </td>
                      {isGerente && (
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removerOP(op.id)}
                            className="hover:text-destructive hover:bg-destructive/10"
                            title="Excluir Ordem"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards View (US078) */}
            <div className="grid gap-3 p-3 md:hidden">
              {ordensFiltradas.map((op) => {
                const recursoNome = recursos.find((r) => r.id === op.recursoId)?.nome || "Recurso";
                return (
                  <div
                    key={op.id}
                    className={cn(
                      "p-4 rounded-xl border border-border bg-card shadow-sm space-y-3",
                      op.status === "concluido" && "border-emerald-500/20 bg-emerald-500/[0.01]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">{op.id}</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase",
                          op.status === "concluido"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : op.status === "em_producao"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-500"
                        )}
                      >
                        {op.status === "em_producao" ? "Em Produção" : op.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">{op.produtoNome}</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                        <div>Qtd: <span className="font-extrabold text-foreground">{op.quantidade}</span></div>
                        <div>Prioridade: <span className="font-bold text-foreground capitalize">{op.prioridade}</span></div>
                        <div className="col-span-2">Recurso: <span className="font-medium text-foreground">{recursoNome}</span></div>
                        <div>Início: <span className="font-medium text-foreground">{op.dataInicio}</span></div>
                        <div>Previsão: <span className="font-medium text-foreground">{op.dataPrevisao}</span></div>
                      </div>
                    </div>

                    {isGerente && op.status !== "concluido" && (
                      <div className="flex items-center justify-between border-t border-border pt-2 gap-2">
                        <select
                          value={op.status}
                          onChange={(e) =>
                            atualizarOPStatus(op.id, e.target.value as OrdemProducao["status"])
                          }
                          className="bg-accent/60 border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer flex-1"
                        >
                          <option value="planejado">Planejado</option>
                          <option value="em_producao">Em Produção</option>
                          <option value="concluido">Concluir</option>
                          <option value="suspenso">Suspenso</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removerOP(op.id)}
                          className="hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Planning Form (US075) */}
      {formOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Hammer className="h-5 w-5 text-primary" />
                Agendar Ordem de Produção
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOP} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              {errorForm && (
                <div className="flex items-center gap-2 p-3 text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorForm}</span>
                </div>
              )}

              {/* Product Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Produto para Produzir
                </label>
                <select
                  value={produtoId}
                  onChange={(e) => setProdutoId(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer"
                >
                  {estoque.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome} (Estoque: {item.quantidade} un.)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Prioridade
                  </label>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer animate-in transition-all"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              {/* Resource Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Recurso / Equipamento
                </label>
                <select
                  value={recursoId}
                  onChange={(e) => setRecursoId(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer"
                >
                  {recursos.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.nome} ({rec.tipo} - máx: {rec.capacidadeMax})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Data de Início
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Data de Previsão
                  </label>
                  <input
                    type="date"
                    value={dataPrevisao}
                    onChange={(e) => setDataPrevisao(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer"
                  />
                </div>
              </div>

              {/* Capacity Preview Warning (US075 / US079) */}
              {cargaPrevia > 0 && (
                <div
                  className={cn(
                    "p-3 rounded-xl border text-xs font-medium space-y-1 transition-all duration-300",
                    cargaPrevia > 100
                      ? "border-destructive/30 bg-destructive/5 text-destructive"
                      : cargaPrevia > 75
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-500"
                      : "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {cargaPrevia > 100 ? (
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                    ) : (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                    <span>Projeção de Utilização do Recurso: {cargaPrevia}%</span>
                  </div>
                  <p className="text-[11px] leading-snug opacity-90">
                    {cargaPrevia > 100
                      ? "Aviso: O agendamento desta quantidade sobrecarregará o recurso para o dia selecionado. Recomenda-se dividir a produção ou alterar a data."
                      : "A alocação está dentro do limite operacional de capacidade para este dia."}
                  </p>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormOpen(false)}
                  className="h-9 font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 shadow-md shadow-primary/20 font-semibold"
                >
                  Agendar Ordem
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
