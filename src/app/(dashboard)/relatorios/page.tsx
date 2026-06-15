"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useEstoque } from "@/hooks/useEstoque";
import { useVendas } from "@/hooks/useVendas";
import { useProducao } from "@/hooks/useProducao";
import { useLogistica } from "@/hooks/useLogistica";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useRelatorios } from "@/hooks/useRelatorios";
import { Button } from "@/components/ui/button";
import { AnomaliasDetectadas } from "@/components/relatorios/AnomaliasDetectadas";
import { cn } from "@/lib/utils";
import {
  FileText,
  Filter,
  Printer,
  BarChart3,
  AlertTriangle,
  Calendar,
  Settings,
} from "lucide-react";

interface GiroRow {
  id: string;
  nome: string;
  categoria: string;
  estoqueAtual: number;
  unidadesVendidas: number;
  faturamento: number;
  taxaGiro: number;
}

interface ProducaoDemandaRow {
  nome: string;
  categoria: string;
  produzido: number;
  demandado: number;
  diferenca: number;
}

interface MargemLogisticaRow {
  cargaId: string;
  pedidoId: string;
  cliente: string;
  destino: string;
  faturamentoVenda: number;
  custoFrete: number;
  receitaLiquida: number;
  margemLiquida: number;
  impactoPercentual: number;
}

type TipoRelatorio = "giro" | "producao_demanda" | "margem_logistica" | "anomalias";

export default function RelatoriosPage() {
  const { user } = useAuth();
  const { estoque } = useEstoque();
  const { vendas } = useVendas();
  const { ordens } = useProducao();
  const { cargas, rotas } = useLogistica();

  const { relatorios, gerarRelatorioRun, limparHistorico } = useRelatorios();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const cargo = user.cargo?.toLowerCase() || "";
  const isGerente = user.role === "admin" || cargo.includes("gerente") || cargo.includes("diretor");

  const [tipo, setTipo] = useState<TipoRelatorio>("giro");
  const [dataInicio, setDataInicio] = useState("2026-05-01");
  const [dataFim, setDataFim] = useState("2026-06-30");
  const [categoriaSel, setCategoriaSel] = useState("todas");
  const [valorMinimo, setValorMinimo] = useState<number>(0);

  const activeReport = selectedReportId ? relatorios.find(r => r.id === selectedReportId) : null;
  const isReportProcessing = activeReport && activeReport.status === "processando";

  const activeTipo = activeReport ? activeReport.parametros.tipoRelatorio : tipo;
  const activeDataInicio = activeReport ? activeReport.parametros.dataInicio : dataInicio;
  const activeDataFim = activeReport ? activeReport.parametros.dataFim : dataFim;
  const activeCategoriaSel = activeReport ? activeReport.parametros.categoriaSel : categoriaSel;
  const activeValorMinimo = activeReport ? activeReport.parametros.valorMinimo : valorMinimo;

  const categorias = useMemo(() => {
    const cats = estoque.map((item) => item.categoria);
    return ["todas", ...Array.from(new Set(cats))];
  }, [estoque]);

  const dadosRelatorio = useMemo(() => {
    const inicio = new Date(activeDataInicio);
    const fim = new Date(activeDataFim);

    // -------------------------------------------------------------
    // REPORT 1: GIRO DE ESTOQUE VS FATURAMENTO
    // -------------------------------------------------------------
    if (activeTipo === "giro") {
      const vendasPorProduto: Record<string, { totalQtd: number; totalValor: number }> = {};
      
      estoque.forEach((item) => {
        if (activeCategoriaSel === "todas" || item.categoria === activeCategoriaSel) {
          vendasPorProduto[item.nome] = { totalQtd: 0, totalValor: 0 };
        }
      });

      vendas
        .filter((v) => v.status === "confirmado")
        .filter((v) => {
          const vDate = new Date(v.data);
          return vDate >= inicio && vDate <= fim;
        })
        .forEach((v) => {
          let itemNome = "Teclado Mecânico RGB Pro";
          if (v.valorTotal < 300) itemNome = "Cabo HDMI 2.1 Trançado 2m";
          else if (v.valorTotal < 500 && v.metodoPagamento === "Boleto") itemNome = "Mouse Gamer Sem Fio 16000DPI";
          else if (v.valorTotal < 700) itemNome = "Headset Noise Cancelling Wireless";
          else itemNome = "Monitor 27' IPS 144Hz UltraWide";

          if (vendasPorProduto[itemNome]) {
            vendasPorProduto[itemNome].totalQtd += v.itens;
            vendasPorProduto[itemNome].totalValor += v.valorTotal;
          }
        });

      const list = estoque
        .filter((item) => activeCategoriaSel === "todas" || item.categoria === activeCategoriaSel)
        .map((item) => {
          const vendasProd = vendasPorProduto[item.nome] || { totalQtd: 0, totalValor: 0 };
          const totalBase = (vendasProd.totalQtd + item.quantidade);
          const taxaGiro = totalBase > 0 ? Math.round((vendasProd.totalQtd / totalBase) * 100) : 0;

          return {
            id: item.id,
            nome: item.nome,
            categoria: item.categoria,
            estoqueAtual: item.quantidade,
            unidadesVendidas: vendasProd.totalQtd,
            faturamento: vendasProd.totalValor,
            taxaGiro,
          };
        })
        .filter((row) => row.faturamento >= activeValorMinimo);

      return list;
    }

    // -------------------------------------------------------------
    // REPORT 2: PRODUÇÃO VS DEMANDA (VENDAS)
    // -------------------------------------------------------------
    if (activeTipo === "producao_demanda") {
      const compiled: Record<string, { produzida: number; demandada: number; categoria: string }> = {};

      estoque.forEach((p) => {
        if (activeCategoriaSel === "todas" || p.categoria === activeCategoriaSel) {
          compiled[p.nome] = { produzida: 0, demandada: 0, categoria: p.categoria };
        }
      });

      ordens
        .filter((op) => op.status === "concluido")
        .filter((op) => {
          const opDate = new Date(op.dataPrevisao);
          return opDate >= inicio && opDate <= fim;
        })
        .forEach((op) => {
          if (compiled[op.produtoNome]) {
            compiled[op.produtoNome].produzida += op.quantidade;
          }
        });

      vendas
        .filter((v) => v.status === "confirmado")
        .filter((v) => {
          const vDate = new Date(v.data);
          return vDate >= inicio && vDate <= fim;
        })
        .forEach((v) => {
          let itemNome = "Teclado Mecânico RGB Pro";
          if (v.valorTotal < 300) itemNome = "Cabo HDMI 2.1 Trançado 2m";
          else if (v.valorTotal < 500 && v.metodoPagamento === "Boleto") itemNome = "Mouse Gamer Sem Fio 16000DPI";
          else if (v.valorTotal < 700) itemNome = "Headset Noise Cancelling Wireless";
          else itemNome = "Monitor 27' IPS 144Hz UltraWide";

          if (compiled[itemNome]) {
            compiled[itemNome].demandada += v.itens;
          }
        });

      return Object.entries(compiled).map(([nome, val]) => ({
        nome,
        categoria: val.categoria,
        produzido: val.produzida,
        demandado: val.demandada,
        diferenca: val.produzida - val.demandada,
      })).filter(r => (r.produzido + r.demandado) >= activeValorMinimo);
    }

    // -------------------------------------------------------------
    // REPORT 3: CUSTOS LOGÍSTICOS VS MARGEM DE VENDAS
    // -------------------------------------------------------------
    return cargas
      .filter((c) => {
        const matchingVenda = vendas.find((v) => v.id === c.pedidoId);
        if (!matchingVenda) return false;
        const vDate = new Date(matchingVenda.data);
        return vDate >= inicio && vDate <= fim;
      })
      .map((c) => {
        const venda = vendas.find((v) => v.id === c.pedidoId)!;
        const rota = rotas.find((r) => r.id === c.rotaId);
        const custoTransporte = rota ? rota.custoCombustivel : 250.00;
        const receitaLiquida = venda.valorTotal - custoTransporte;
        const impactoPercentual = Math.round((custoTransporte / venda.valorTotal) * 100);
        const margemLiquida = Math.round((receitaLiquida / venda.valorTotal) * 100);

        return {
          cargaId: c.id,
          pedidoId: c.pedidoId,
          cliente: c.cliente,
          destino: c.destino,
          faturamentoVenda: venda.valorTotal,
          custoFrete: custoTransporte,
          receitaLiquida,
          margemLiquida,
          impactoPercentual,
        };
      })
      .filter((row) => row.faturamentoVenda >= activeValorMinimo);

  }, [activeTipo, activeDataInicio, activeDataFim, activeCategoriaSel, activeValorMinimo, estoque, vendas, ordens, cargas, rotas]);

  const totalizadores = useMemo(() => {
    if (activeTipo === "giro") {
      const list = dadosRelatorio as GiroRow[];
      const faturamentoTotal = list.reduce((acc, item) => acc + item.faturamento, 0);
      const mediaGiro = list.length > 0 ? Math.round(list.reduce((acc, item) => acc + item.taxaGiro, 0) / list.length) : 0;
      const totalVendidas = list.reduce((acc, item) => acc + item.unidadesVendidas, 0);
      return { faturamentoTotal, mediaGiro, totalVendidas };
    }
    if (activeTipo === "producao_demanda") {
      const list = dadosRelatorio as ProducaoDemandaRow[];
      const totalProduzido = list.reduce((acc, item) => acc + item.produzido, 0);
      const totalDemandado = list.reduce((acc, item) => acc + item.demandado, 0);
      const diferencaGlobal = totalProduzido - totalDemandado;
      return { totalProduzido, totalDemandado, diferencaGlobal };
    }
    const list = dadosRelatorio as MargemLogisticaRow[];
    const totalVendas = list.reduce((acc, item) => acc + item.faturamentoVenda, 0);
    const totalFretes = list.reduce((acc, item) => acc + item.custoFrete, 0);
    const margemGlobal = totalVendas > 0 ? Math.round(((totalVendas - totalFretes) / totalVendas) * 100) : 0;
    return { totalVendas, totalFretes, margemGlobal };
  }, [activeTipo, dadosRelatorio]);

  const handleGerarRelatorio = () => {
    const moduloMap = {
      giro: "Estoque",
      producao_demanda: "Produção",
      margem_logistica: "Logística",
      anomalias: "Qualidade",
    };
    const reportId = gerarRelatorioRun(
      tipo,
      moduloMap[tipo],
      dataInicio,
      dataFim,
      categoriaSel,
      valorMinimo
    );
    setSelectedReportId(reportId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4 no-print">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Relatórios Avançados Cruzados
          </h2>
          <p className="text-sm text-muted-foreground">
            Cruze e analise dados operacionais de estoque, vendas, produção e logística.
          </p>
        </div>

        {isGerente && activeReport && activeReport.status === "concluido" && dadosRelatorio.length > 0 && (
          <Button
            onClick={() => window.print()}
            className="h-9 shadow-md shadow-primary/20 shrink-0 gap-2 font-semibold cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Imprimir Relatório
          </Button>
        )}
      </div>

      {!isGerente && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 no-print">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            <strong>Acesso Restrito:</strong> Como gerente, você teria permissões completas de visualização. Como colaborador comum, esta seção de BI estratégico está em modo de leitura experimental.
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 no-print">
        <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <Filter className="h-4.5 w-4.5 text-primary" />
              <span className="font-bold text-sm">Parâmetros de Cruzamento</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase">Tipo de Cruzamento</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoRelatorio)}
                  className="w-full bg-accent/40 border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="giro">Estoque vs Vendas (Giro)</option>
                  <option value="producao_demanda">Produção vs Demanda</option>
                  <option value="margem_logistica">Margens vs Fretes</option>
                  <option value="anomalias">Anomalias Detectadas</option>
                </select>
              </div>

              {tipo !== "anomalias" && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Data Inicial
                    </label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full bg-accent/40 border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Data Final
                    </label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full bg-accent/40 border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground uppercase">Categoria</label>
                    <select
                      value={categoriaSel}
                      onChange={(e) => setCategoriaSel(e.target.value)}
                      disabled={tipo === "margem_logistica"}
                      className="w-full bg-accent/40 border border-border rounded-lg px-2.5 py-1.5 focus:outline-none disabled:opacity-40"
                    >
                      {categorias.map((c) => (
                        <option key={c} value={c}>
                          {c === "todas" ? "Todas as Categorias" : c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground uppercase">Valor Mínimo (Faturamento)</label>
                    <input
                      type="number"
                      min="0"
                      value={valorMinimo}
                      onChange={(e) => setValorMinimo(parseInt(e.target.value) || 0)}
                      className="w-full bg-accent/40 border border-border rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <Button
            onClick={handleGerarRelatorio}
            className="w-full font-semibold h-9 shadow-sm cursor-pointer mt-4"
          >
            Gerar Relatório
          </Button>
        </div>

        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                <span className="font-bold text-sm">Histórico de Relatórios Gerados</span>
              </div>
              {relatorios.length > 0 && (
                <button
                  onClick={limparHistorico}
                  className="text-[10px] text-destructive hover:underline font-bold cursor-pointer"
                >
                  Limpar Histórico
                </button>
              )}
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 max-h-[260px]">
              {relatorios.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  Nenhum relatório gerado no histórico local.
                </div>
              ) : (
                relatorios.map((rep) => {
                  const isSelected = selectedReportId === rep.id;
                  const isProcessing = rep.status === "processando";
                  return (
                    <button
                      key={rep.id}
                      onClick={() => setSelectedReportId(rep.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border text-xs flex justify-between items-center gap-4 transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-accent/10 border-transparent hover:bg-accent/20 text-foreground",
                        isProcessing && "animate-pulse"
                      )}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <span className="font-mono text-[9px] bg-primary/20 text-primary px-1 rounded">
                            {rep.id}
                          </span>
                          <span className="truncate">{rep.tipo}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {rep.periodo} | Cat: {rep.parametros.categoriaSel}
                        </div>
                        <div className="text-[9px] text-muted-foreground flex justify-between items-center mt-1">
                          <span>Solicitante: {rep.usuarioSolicitante}</span>
                          <span>{new Date(rep.dataGeracao).toLocaleTimeString("pt-BR")}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                            isProcessing ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                          )}
                        >
                          {rep.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          {selectedReportId && (
            <div className="border-t border-border pt-3 flex justify-between items-center text-xs">
              <span className="text-muted-foreground">
                Exibindo relatório: <strong className="font-mono text-foreground">{selectedReportId}</strong>
              </span>
              <button
                onClick={() => setSelectedReportId(null)}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Voltar à edição livre
              </button>
            </div>
          )}
        </div>
      </div>

      {!selectedReportId ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 border border-dashed border-border rounded-xl bg-card no-print">
          <FileText className="h-10 w-10 text-muted-foreground/30" />
          <div className="text-xs text-muted-foreground font-semibold max-w-sm leading-relaxed">
            Selecione um relatório do histórico ou configure os parâmetros e clique em "Gerar Relatório" para analisar a base de dados.
          </div>
        </div>
      ) : isReportProcessing ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 border border-border rounded-xl bg-card no-print">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="text-xs text-muted-foreground font-semibold">
            Processando bases operacionais assincronamente...
          </div>
        </div>
      ) : (
        <>
          {activeTipo !== "anomalias" && dadosRelatorio.length > 0 && (
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 no-print">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
                <span className="font-bold text-sm">Visualização Gráfica Analítica</span>
              </div>

              <div className="flex justify-center bg-accent/10 rounded-xl p-4 border border-border/40 aspect-[3/1] max-h-[200px]">
                {activeTipo === "giro" && (
                  <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                    {(dadosRelatorio as GiroRow[]).map((item, idx) => {
                      const maxFat = Math.max(...(dadosRelatorio as GiroRow[]).map((i) => i.faturamento || 1));
                      const height = (item.faturamento / maxFat) * 80;
                      const x = 50 + idx * 75;
                      const y = 90 - height;
                      return (
                        <g key={item.id}>
                          <rect
                            x={x}
                            y={y}
                            width="30"
                            height={height}
                            fill="url(#fatGrad)"
                            rx="3"
                            className="transition-all hover:opacity-80"
                          />
                          <text x={x + 15} y={y - 5} textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="bold">
                            R$ {Math.round(item.faturamento)}
                          </text>
                          <text x={x + 15} y="105" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">
                            {item.nome.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}
                    <defs>
                      <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <line x1="30" y1="90" x2="480" y2="90" stroke="#475569" strokeWidth="1.5" />
                  </svg>
                )}

                {activeTipo === "producao_demanda" && (
                  <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                    {(dadosRelatorio as ProducaoDemandaRow[]).map((item, idx) => {
                      const maxVal = Math.max(...(dadosRelatorio as ProducaoDemandaRow[]).map((i) => Math.max(i.produzido, i.demandado) || 1));
                      const hProd = (item.produzido / maxVal) * 80;
                      const hDem = (item.demandado / maxVal) * 80;
                      const x = 50 + idx * 80;
                      return (
                        <g key={idx}>
                          <rect
                            x={x}
                            y={90 - hProd}
                            width="14"
                            height={hProd}
                            fill="#3b82f6"
                            rx="2"
                          />
                          <rect
                            x={x + 18}
                            y={90 - hDem}
                            width="14"
                            height={hDem}
                            fill="#f59e0b"
                            rx="2"
                          />
                          <text x={x + 16} y="105" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">
                            {item.nome.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}
                    <line x1="30" y1="90" x2="480" y2="90" stroke="#475569" strokeWidth="1.5" />
                  </svg>
                )}

                {activeTipo === "margem_logistica" && (
                  <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                    {(dadosRelatorio as MargemLogisticaRow[]).map((item, idx) => {
                      const x = 50 + idx * 80;
                      const y = 90 - (item.margemLiquida / 100) * 80;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                          <text x={x} y={y - 8} textAnchor="middle" fill="#8b5cf6" fontSize="7" fontWeight="bold">
                            {item.margemLiquida}%
                          </text>
                          <text x={x} y="105" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">
                            {item.cargaId}
                          </text>
                        </g>
                      );
                    })}
                    <line x1="30" y1="90" x2="480" y2="90" stroke="#475569" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
            </div>
          )}

          {activeTipo !== "anomalias" && (
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6 print-container">
              <div className="hidden print:block space-y-2 border-b border-slate-300 pb-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl font-bold text-slate-800">ERP Pro - Relatório Analítico de Gestão</h1>
                  <span className="text-xs text-slate-500 font-mono">
                    Emissão: {new Date(activeReport ? activeReport.dataGeracao : new Date()).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold space-x-4 flex items-center justify-between">
                  <div>
                    <span>Período: {activeDataInicio} até {activeDataFim}</span>
                    <span>•</span>
                    <span>Tipo: {activeTipo === "giro" ? "Giro de Estoque" : activeTipo === "producao_demanda" ? "Produção vs Demanda" : "Margem vs Fretes"}</span>
                    <span>•</span>
                    <span>Emitido por: {activeReport ? activeReport.usuarioSolicitante : user.name}</span>
                  </div>
                  {activeReport && (
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      ID: {activeReport.id}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 grid-cols-3">
                {activeTipo === "giro" && (
                  <>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Faturamento Filtrado</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                        R$ {totalizadores.faturamentoTotal?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Giro Médio Geral</span>
                      <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {totalizadores.mediaGiro}%
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Unidades Despachadas</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                        {totalizadores.totalVendidas} un.
                      </span>
                    </div>
                  </>
                )}

                {activeTipo === "producao_demanda" && (
                  <>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Volume Produzido</span>
                      <span className="text-base sm:text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                        {totalizadores.totalProduzido} un.
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Volume Demandado</span>
                      <span className="text-base sm:text-xl font-extrabold text-amber-500 tracking-tight">
                        {totalizadores.totalDemandado} un.
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Balanço Final</span>
                      <span
                        className={cn(
                          "text-base sm:text-xl font-extrabold tracking-tight",
                          (totalizadores.diferencaGlobal ?? 0) >= 0 ? "text-emerald-500" : "text-destructive"
                        )}
                      >
                        {(totalizadores.diferencaGlobal ?? 0) >= 0 ? "+" : ""}
                        {totalizadores.diferencaGlobal ?? 0} un.
                      </span>
                    </div>
                  </>
                )}

                {activeTipo === "margem_logistica" && (
                  <>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Faturamento Bruto</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                        R$ {totalizadores.totalVendas?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Despesas com Rotas</span>
                      <span className="text-base sm:text-xl font-extrabold text-destructive tracking-tight">
                        R$ {totalizadores.totalFretes?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Margem Net Global</span>
                      <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {totalizadores.margemGlobal}%
                      </span>
                    </div>
                  </>
                )}
              </div>

              {dadosRelatorio.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
                  <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Não existem dados compilados para os filtros selecionados.
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase tracking-wide">
                        {activeTipo === "giro" && (
                          <>
                            <th className="p-3">Produto</th>
                            <th className="p-3">Categoria</th>
                            <th className="p-3 text-right">Estoque Atual</th>
                            <th className="p-3 text-right">Qtd Vendida</th>
                            <th className="p-3 text-right">Faturamento Bruto</th>
                            <th className="p-3 text-right">Giro de Estoque</th>
                          </>
                        )}
                        {activeTipo === "producao_demanda" && (
                          <>
                            <th className="p-3">Produto</th>
                            <th className="p-3">Categoria</th>
                            <th className="p-3 text-right">Qtd Fabricada (OPs)</th>
                            <th className="p-3 text-right">Qtd Vendida (Vendas)</th>
                            <th className="p-3 text-right">Diferença Operacional</th>
                          </>
                        )}
                        {activeTipo === "margem_logistica" && (
                          <>
                            <th className="p-3">Carga / Pedido</th>
                            <th className="p-3">Destinatário</th>
                            <th className="p-3">Destino</th>
                            <th className="p-3 text-right">Valor Venda</th>
                            <th className="p-3 text-right">Custo de Frete</th>
                            <th className="p-3 text-right">Receita Líquida</th>
                            <th className="p-3 text-right">Margem Net</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {activeTipo === "giro" &&
                        (dadosRelatorio as GiroRow[]).map((row) => (
                          <tr key={row.id} className="hover:bg-accent/10 transition-colors">
                            <td className="p-3 font-bold text-foreground">{row.nome}</td>
                            <td className="p-3 text-muted-foreground">{row.categoria}</td>
                            <td className="p-3 text-right">{row.estoqueAtual} un.</td>
                            <td className="p-3 text-right">{row.unidadesVendidas} un.</td>
                            <td className="p-3 text-right font-extrabold text-foreground">
                              R$ {row.faturamento?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded font-bold text-[10px]",
                                  row.taxaGiro > 50
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : row.taxaGiro > 20
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                                    : "bg-blue-500/10 text-blue-600"
                                )}
                              >
                                {row.taxaGiro}%
                              </span>
                            </td>
                          </tr>
                        ))}

                      {activeTipo === "producao_demanda" &&
                        (dadosRelatorio as ProducaoDemandaRow[]).map((row, idx) => (
                          <tr key={idx} className="hover:bg-accent/10 transition-colors">
                            <td className="p-3 font-bold text-foreground">{row.nome}</td>
                            <td className="p-3 text-muted-foreground">{row.categoria}</td>
                            <td className="p-3 text-right font-extrabold">{row.produzido} un.</td>
                            <td className="p-3 text-right font-extrabold">{row.demandado} un.</td>
                            <td className="p-3 text-right font-extrabold">
                              <span
                                className={cn(
                                  row.diferenca >= 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-destructive"
                                )}
                              >
                                {row.diferenca >= 0 ? "+" : ""}
                                {row.diferenca} un.
                              </span>
                            </td>
                          </tr>
                        ))}

                      {activeTipo === "margem_logistica" &&
                        (dadosRelatorio as MargemLogisticaRow[]).map((row) => (
                          <tr key={row.cargaId} className="hover:bg-accent/10 transition-colors">
                            <td className="p-3 font-bold text-foreground">
                              {row.cargaId} <span className="text-[10px] text-muted-foreground">({row.pedidoId})</span>
                            </td>
                            <td className="p-3">{row.cliente}</td>
                            <td className="p-3 text-muted-foreground">{row.destino}</td>
                            <td className="p-3 text-right font-bold text-foreground">
                              R$ {row.faturamentoVenda?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right font-bold text-destructive">
                              R$ {row.custoFrete?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right font-bold text-emerald-600">
                              R$ {row.receitaLiquida?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right font-extrabold">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-bold",
                                  row.margemLiquida > 80
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-amber-500/10 text-amber-500"
                                )}
                              >
                                {row.margemLiquida}%
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="hidden print:flex items-center justify-between border-t border-slate-300 pt-12 text-[10px] text-slate-400 font-medium">
                <span>Assinatura do Gerente Geral: ___________________________</span>
                <span>Emitido digitalmente via Módulo BI ERP Pro</span>
              </div>
            </div>
          )}

          {activeTipo === "anomalias" && <AnomaliasDetectadas />}
        </>
      )}

      <style jsx global>{`
        @media print {
          header, 
          aside,
          .no-print,
          button,
          input,
          select {
            display: none !important;
          }
          
          main, 
          body, 
          html {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          
          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
}
