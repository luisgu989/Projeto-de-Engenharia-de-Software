"use client";

import React, { useState } from "react";
import { ItemEstoque } from "@/hooks/useEstoque";
import { useLogs } from "@/contexts/logs-context";
import { useAuth } from "@/contexts/auth-context";
import { Calendar, DollarSign, Package, TrendingUp, AlertTriangle, FileText, Download, Printer, CheckCircle, BarChart3, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RelatoriosEstoqueProps {
  estoque: ItemEstoque[];
}

export function RelatoriosEstoque({ estoque }: RelatoriosEstoqueProps) {
  const { addLog } = useLogs();
  const { user } = useAuth();

  const [tipoRelatorio, setTipoRelatorio] = useState<"gerencial" | "movimentacoes">("gerencial");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const getCategoriasUnicas = () => {
    return Array.from(new Set(estoque.map((item) => item.categoria)));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  // 1. Data Calculation: Management Report (Relatório Gerencial)
  const getGerencialData = () => {
    // Filter active items by category
    const itemsFiltrados = estoque.filter((item) => {
      if (item.status !== "ativo") return false;
      if (categoriaFiltro !== "todas" && item.categoria !== categoriaFiltro) return false;
      return true;
    });

    let totalFinanceiro = 0;
    let totalItens = 0;
    let alertasReposicao = 0;
    
    // Analyze product turnover (exits inside the period)
    const itemsComGiro = itemsFiltrados.map((item) => {
      const movsPeriodo = (item.movimentacoes || []).filter((mov) => {
        const d = new Date(mov.data).toISOString().split("T")[0];
        if (dataInicio && d < dataInicio) return false;
        if (dataFim && d > dataFim) return false;
        return true;
      });

      const totalEntradas = movsPeriodo
        .filter((m) => m.tipo === "entrada")
        .reduce((sum, m) => sum + m.quantidade, 0);

      const totalSaidas = movsPeriodo
        .filter((m) => m.tipo === "saida")
        .reduce((sum, m) => sum + m.quantidade, 0);

      totalFinanceiro += item.quantidade * item.precoCusto;
      totalItens += item.quantidade;
      if (item.quantidade <= item.estoqueMinimo) {
        alertasReposicao++;
      }

      // Turnover Classification:
      // High: > 15 exits
      // Medium: 5 - 15 exits
      // Low: < 5 exits
      let giro: "Alto" | "Médio" | "Baixo" = "Baixo";
      if (totalSaidas > 15) giro = "Alto";
      else if (totalSaidas >= 5) giro = "Médio";

      return {
        ...item,
        totalEntradas,
        totalSaidas,
        giro,
        valorImobilizado: item.quantidade * item.precoCusto,
      };
    });

    // Sort by higher exits first
    const topGiro = [...itemsComGiro]
      .filter((i) => i.totalSaidas > 0)
      .sort((a, b) => b.totalSaidas - a.totalSaidas);

    return {
      items: itemsComGiro,
      topGiro,
      totalFinanceiro,
      totalItens,
      alertasReposicao,
    };
  };

  // 2. Data Calculation: Movement Report (Relatório de Movimentações)
  const getMovimentacoesData = () => {
    // Gather all movements in the period
    const todasMovs = estoque.flatMap((item) => {
      if (item.status !== "ativo") return [];
      if (categoriaFiltro !== "todas" && item.categoria !== categoriaFiltro) return [];

      return (item.movimentacoes || []).map((mov) => ({
        ...mov,
        itemSku: item.sku,
        itemNome: item.nome,
        itemCategoria: item.categoria,
        itemPrecoCusto: item.precoCusto,
        itemPrecoVenda: item.precoVenda,
      }));
    });

    // Filter by date range
    const movsFiltradas = todasMovs.filter((mov) => {
      const d = new Date(mov.data).toISOString().split("T")[0];
      if (dataInicio && d < dataInicio) return false;
      if (dataFim && d > dataFim) return false;
      return true;
    });

    const totalEntradasQtd = movsFiltradas
      .filter((m) => m.tipo === "entrada")
      .reduce((sum, m) => sum + m.quantidade, 0);

    const totalSaidasQtd = movsFiltradas
      .filter((m) => m.tipo === "saida")
      .reduce((sum, m) => sum + m.quantidade, 0);

    const valorEntradas = movsFiltradas
      .filter((m) => m.tipo === "entrada")
      .reduce((sum, m) => sum + m.quantidade * m.itemPrecoCusto, 0);

    const valorSaidas = movsFiltradas
      .filter((m) => m.tipo === "saida")
      .reduce((sum, m) => sum + m.quantidade * m.itemPrecoVenda, 0);

    // Sort chronologically (newest first)
    movsFiltradas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return {
      movimentacoes: movsFiltradas,
      totalEntradasQtd,
      totalSaidasQtd,
      saldoLiquidoQtd: totalEntradasQtd - totalSaidasQtd,
      valorEntradas,
      valorSaidas,
    };
  };

  const handleGerarRelatorio = (e: React.FormEvent) => {
    e.preventDefault();
    setRelatorioGerado(true);
    addLog(
      `Gerou relatório ${tipoRelatorio === "gerencial" ? "Gerencial" : "de Movimentações"} de estoque (Filtros: Categoria - ${categoriaFiltro}, Período - ${dataInicio || "Início"} a ${dataFim || "Fim"})`,
      "relatorios"
    );
    triggerToast("Relatório gerado com sucesso!");
  };

  // 3. Export to CSV (US020)
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const filename = `relatorio_${tipoRelatorio}_${new Date().toISOString().split("T")[0]}.csv`;

    if (tipoRelatorio === "gerencial") {
      const data = getGerencialData();
      csvContent += "SKU;Produto;Categoria;Estoque Atual;Estoque Minimo;Preco Custo;Preco Venda;Valor Imobilizado;Entradas no Periodo;Saidas no Periodo;Giro do Produto\r\n";
      
      data.items.forEach((item) => {
        csvContent += `"${item.sku}";"${item.nome}";"${item.categoria}";${item.quantidade};${item.estoqueMinimo};${item.precoCusto.toFixed(2)};${item.precoVenda.toFixed(2)};${item.valorImobilizado.toFixed(2)};${item.totalEntradas};${item.totalSaidas};"${item.giro}"\r\n`;
      });
    } else {
      const data = getMovimentacoesData();
      csvContent += "Data;SKU;Produto;Categoria;Tipo;Quantidade;Motivo;Valor Unitario;Operador\r\n";
      
      data.movimentacoes.forEach((mov) => {
        const valUnit = mov.tipo === "entrada" ? mov.itemPrecoCusto : mov.itemPrecoVenda;
        csvContent += `"${formatDate(mov.data)}";"${mov.itemSku}";"${mov.itemNome}";"${mov.itemCategoria}";"${mov.tipo === "entrada" ? "Entrada" : "Saída"}";${mov.quantidade};"${mov.motivo}";${valUnit.toFixed(2)};"${mov.usuario}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addLog(`Exportou dados do relatório ${tipoRelatorio === "gerencial" ? "Gerencial" : "de Movimentações"} para formato CSV`, "relatorios");
    triggerToast("Arquivo CSV exportado com sucesso!");
  };

  // 4. Print / Save as PDF (US020)
  const handlePrint = () => {
    addLog(`Imprimiu / Salvou em PDF o relatório ${tipoRelatorio === "gerencial" ? "Gerencial" : "de Movimentações"}`, "relatorios");
    window.print();
  };

  const gerencial = getGerencialData();
  const operacionais = getMovimentacoesData();

  return (
    <div className="space-y-6">
      {/* Print-specific layout container: inject CSS dynamically when printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="h-5 w-5 text-white shrink-0" />
          <span className="text-sm font-semibold">{showToast}</span>
        </div>
      )}

      {/* Filter and Config Bar */}
      <div className="no-print p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Configuração de Relatório
        </h3>

        <form onSubmit={handleGerarRelatorio} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
          {/* Report Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Tipo de Relatório</label>
            <select
              value={tipoRelatorio}
              onChange={(e) => {
                setTipoRelatorio(e.target.value as any);
                setRelatorioGerado(false);
              }}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all"
            >
              <option value="gerencial">Relatório Gerencial de Giro e Estoque</option>
              <option value="movimentacoes">Relatório Operacional de Movimentações</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Categoria</label>
            <select
              value={categoriaFiltro}
              onChange={(e) => {
                setCategoriaFiltro(e.target.value);
                setRelatorioGerado(false);
              }}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all"
            >
              <option value="todas">Todas as Categorias</option>
              {getCategoriasUnicas().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Period selector */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Período de Análise</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setRelatorioGerado(false);
                }}
                className="w-full bg-accent/20 border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none"
                title="Data Início"
              />
              <span className="text-muted-foreground text-xs">a</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setRelatorioGerado(false);
                }}
                className="w-full bg-accent/20 border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none"
                title="Data Fim"
              />
            </div>
          </div>

          <Button type="submit" className="w-full text-xs font-semibold shadow shadow-primary/20 cursor-pointer h-9 sm:col-span-2 lg:col-span-1">
            Gerar Relatório
          </Button>
        </form>
      </div>

      {/* Generated Report Output */}
      {relatorioGerado && (
        <div id="print-area" className="space-y-6 bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          {/* Header Report Meta */}
          <div className="flex flex-col md:flex-row justify-between border-b border-border pb-6 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
                Sistema ERP Pro &bull; Relatório Oficial
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {tipoRelatorio === "gerencial"
                  ? "Relatório Gerencial e Financeiro de Estoque"
                  : "Relatório Operacional de Movimentações de Estoque"}
              </h2>
              <div className="text-xs text-muted-foreground">
                Filtros: Categoria <strong>{categoriaFiltro === "todas" ? "Todas" : categoriaFiltro}</strong>
                {dataInicio || dataFim ? (
                  <span> &bull; Período de <strong>{dataInicio ? formatDate(dataInicio) : "início"}</strong> a <strong suppressHydrationWarning>{dataFim ? formatDate(dataFim) : "hoje"}</strong></span>
                ) : (
                  <span> &bull; Histórico Completo</span>
                )}
              </div>
            </div>

            <div className="no-print flex items-center gap-2 shrink-0 self-start md:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-xs font-semibold border-border hover:bg-accent flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs font-semibold border-border hover:bg-accent flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Imprimir / PDF
              </Button>
            </div>
          </div>

          {/* Renders Management KPIs if type is "gerencial" */}
          {tipoRelatorio === "gerencial" && (
            <div className="space-y-6">
              {/* KPIs Widgets */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-xl border border-border bg-accent/10 flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Valor Imobilizado</div>
                    <div className="text-lg font-bold font-mono">{formatCurrency(gerencial.totalFinanceiro)}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-accent/10 flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Itens em Estoque</div>
                    <div className="text-lg font-bold font-mono">{gerencial.totalItens} un</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-accent/10 flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Alertas de Reposição</div>
                    <div className="text-lg font-bold font-mono text-amber-600">{gerencial.alertasReposicao} prod</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-accent/10 flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Giro Geral Médio</div>
                    <div className="text-lg font-bold font-mono">
                      {gerencial.topGiro.length > 0 ? "Médio / Alto" : "Estável"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Giro / Turnover Analysis List */}
              {gerencial.topGiro.length > 0 && (
                <div className="p-4 rounded-xl border border-border bg-accent/5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    Produtos com Maior Giro no Período (Mais Vendidos/Saídos)
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {gerencial.topGiro.slice(0, 3).map((item) => (
                      <div key={item.id} className="p-3 bg-card border border-border rounded-lg flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono text-muted-foreground text-[10px]">{item.sku}</span>
                          <div className="font-semibold text-foreground truncate max-w-[150px]">{item.nome}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-rose-500 px-1.5 py-0.5 bg-rose-500/10 rounded">
                            -{item.totalSaidas} un
                          </span>
                          <div className="text-[9px] text-muted-foreground mt-1">Giro {item.giro}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Table Data */}
              <div className="border border-border rounded-xl bg-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-accent/20 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                      <th className="p-3 text-center">SKU</th>
                      <th className="p-3 text-left">Nome</th>
                      <th className="p-3 text-center">Saldo Físico</th>
                      <th className="p-3 text-center">Preço Custo</th>
                      <th className="p-3 text-center">Preço Venda</th>
                      <th className="p-3 font-bold text-center">Valor Imobilizado</th>
                      <th className="p-3 text-center">Giro no Período</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {gerencial.items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          Nenhum produto correspondente.
                        </td>
                      </tr>
                    ) : (
                      gerencial.items.map((item) => (
                        <tr key={item.id} className="hover:bg-accent/5">
                          <td className="p-3 font-mono text-[11px] text-center">{item.sku}</td>
                          <td className="p-3 font-medium text-left">{item.nome}</td>
                          <td className="p-3 text-right">
                            {item.quantidade} un 
                            {item.quantidade <= item.estoqueMinimo && (
                              <span className="text-[9px] text-amber-600 bg-amber-500/10 px-1 ml-1.5 rounded">Abaixo</span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-right">{formatCurrency(item.precoCusto)}</td>
                          <td className="p-3 font-mono text-right">{formatCurrency(item.precoVenda)}</td>
                          <td className="p-3 font-bold font-mono text-right">{formatCurrency(item.valorImobilizado)}</td>
                          <td className="p-3 text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                              item.giro === "Alto" ? "bg-purple-500/10 text-purple-600" :
                              item.giro === "Médio" ? "bg-blue-500/10 text-blue-600" :
                              "bg-accent text-muted-foreground"
                            )}>
                              {item.giro}
                            </span>
                            <span className="text-[9px] text-muted-foreground block mt-0.5">-{item.totalSaidas} saídas</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Renders Operational Movements if type is "movimentacoes" */}
          {tipoRelatorio === "movimentacoes" && (
            <div className="space-y-6">
              {/* Operational Stats cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-xl border border-border bg-accent/10 flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Itens Recebidos (+)</div>
                    <div className="text-lg font-bold font-mono text-emerald-600">+{operacionais.totalEntradasQtd} un</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">Custo: {formatCurrency(operacionais.valorEntradas)}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-accent/10 flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <ArrowDownLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Itens Retirados (-)</div>
                    <div className="text-lg font-bold font-mono text-rose-600">-{operacionais.totalSaidasQtd} un</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">Venda: {formatCurrency(operacionais.valorSaidas)}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-accent/10 flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Saldo Líquido Período</div>
                    <div className={cn(
                      "text-lg font-bold font-mono",
                      operacionais.saldoLiquidoQtd >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {operacionais.saldoLiquidoQtd >= 0 ? "+" : ""}{operacionais.saldoLiquidoQtd} un
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">Operações: {operacionais.movimentacoes.length} reg.</div>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="border border-border rounded-xl bg-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-accent/20 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                      <th className="p-3 text-center">Data</th>
                      <th className="p-3 text-center">SKU</th>
                      <th className="p-3 text-left">Produto</th>
                      <th className="p-3 text-center">Tipo</th>
                      <th className="p-3 text-center">Quantidade</th>
                      <th className="p-3 text-left">Motivo / Justificativa</th>
                      <th className="p-3 text-center">Valor Unitário</th>
                      <th className="p-3 text-center">Operador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {operacionais.movimentacoes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                          Nenhuma movimentação registrada no período selecionado.
                        </td>
                      </tr>
                    ) : (
                      operacionais.movimentacoes.map((mov, idx) => {
                        const isEntry = mov.tipo === "entrada";
                        const valUnit = isEntry ? mov.itemPrecoCusto : mov.itemPrecoVenda;
                        return (
                          <tr key={idx} className="hover:bg-accent/5">
                            <td className="p-3 font-mono text-[11px] text-muted-foreground text-center" suppressHydrationWarning>{formatDate(mov.data)}</td>
                            <td className="p-3 font-mono text-[11px] text-center">{mov.itemSku}</td>
                            <td className="p-3 font-medium text-left">{mov.itemNome}</td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase",
                                isEntry ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                              )}>
                                {isEntry ? "Entrada" : "Saída"}
                              </span>
                            </td>
                            <td className="text-center" className={cn(
                              "p-3 text-center font-bold font-mono",
                              isEntry ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {isEntry ? "+" : "-"}{mov.quantidade}
                            </td>
                            <td className="p-3 font-medium text-foreground/80 text-left">{mov.motivo}</td>
                            <td className="p-3 font-mono text-right">{formatCurrency(valUnit)}</td>
                            <td className="p-3 text-muted-foreground text-center">{mov.usuario}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Printed By Footer metadata (for physical print layout audit) */}
          <div className="visible-print-only hidden print:flex justify-between items-center border-t border-border mt-12 pt-4 text-[10px] text-muted-foreground">
            <span>Relatório gerado por: <strong>{user.name}</strong> ({user.email})</span>
            <span>Data de emissão: <strong suppressHydrationWarning>{new Date().toLocaleString("pt-BR")}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
