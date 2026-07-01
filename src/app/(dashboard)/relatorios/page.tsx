"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useEstoque } from "@/hooks/useEstoque";
import { useVendas } from "@/hooks/useVendas";
import { useProducao } from "@/hooks/useProducao";
import { useLogistica } from "@/hooks/useLogistica";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useRelatorios } from "@/hooks/useRelatorios";
import { useClientes } from "@/hooks/useClientes";
import { useOportunidades } from "@/hooks/useOportunidades";
import { useContratos } from "@/hooks/useContratos";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { useChamados } from "@/hooks/useChamados";
import { useSolicitacoesInternas } from "@/hooks/useSolicitacoesInternas";
import { useAtivos } from "@/hooks/useAtivos";
import { useManutencaoPreventiva } from "@/hooks/useManutencaoPreventiva";
import { useFiscal } from "@/hooks/useFiscal";
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

interface ComercialCrmRow {
  clienteId: string;
  clienteNome: string;
  documento: string;
  totalVendas: number;
  faturamento: number;
  qtdOportunidades: number;
  conversao: number;
  statusCrm: string;
}

interface FinanceiroContratosRow {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  valor: number;
  statusLiquidacao: string;
  documentoFiscalId: string;
  contratoId: string;
}

interface RhProdutividadeRow {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  custoSalario: number;
  chamadosResolvidos: number;
  custoPorChamado: number;
}

interface SuporteTiRow {
  id: string;
  titulo: string;
  categoria: string;
  status: string;
  criticidade: string;
  solicitante: string;
  atendente: string;
  dataAbertura: string;
  solicitacaoVinculada: string;
}

interface AtivosTiRow {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  criticidade: string;
  manutencoesQtd: number;
  ultimaManutencao: string;
  custoReposicao: number;
}

type TipoRelatorio =
  | "giro"
  | "producao_demanda"
  | "margem_logistica"
  | "anomalias"
  | "comercial_crm"
  | "financeiro_contratos"
  | "rh_produtividade"
  | "suporte_ti"
  | "ativos_ti";

export default function RelatoriosPage() {
  const { user } = useAuth();
  const { estoque } = useEstoque();
  const { vendas } = useVendas();
  const { ordens } = useProducao();
  const { cargas, rotas } = useLogistica();

  const { clientes } = useClientes();
  const { oportunidades } = useOportunidades();
  const { contratos } = useContratos();
  const { documentos: documentosFiscais } = useFiscal();
  const { todosLancamentos } = useFinanceiro();
  const { funcionarios } = useFuncionarios();
  const { chamados } = useChamados();
  const { solicitacoes: solicitacoesInternas } = useSolicitacoesInternas();
  const { ativos } = useAtivos();
  const { manutencoes } = useManutencaoPreventiva();

  const { relatorios, gerarRelatorioRun, limparHistorico } = useRelatorios();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };
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
    if (activeTipo === "margem_logistica") {
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
    }

    // -------------------------------------------------------------
    // REPORT 4: DESEMPENHO COMERCIAL E CRM
    // -------------------------------------------------------------
    if (activeTipo === "comercial_crm") {
      return clientes
        .map((c) => {
          const vendasCliente = vendas.filter((v) => v.cliente.toLowerCase() === c.nome.toLowerCase() && v.status === "confirmado");
          const totalVendas = vendasCliente.length;
          const faturamento = vendasCliente.reduce((sum, v) => sum + v.valorTotal, 0);
          
          const opCliente = oportunidades.filter((op) => op.cliente.toLowerCase() === c.nome.toLowerCase() || op.cliente.toLowerCase().includes(c.nome.toLowerCase()));
          const qtdOportunidades = opCliente.length;
          const ganhas = opCliente.filter((op) => op.status === "fechado_ganho").length;
          const conversao = qtdOportunidades > 0 ? Math.round((ganhas / qtdOportunidades) * 100) : 0;

          return {
            clienteId: c.id,
            clienteNome: c.nome,
            documento: c.documento,
            totalVendas,
            faturamento,
            qtdOportunidades,
            conversao,
            statusCrm: c.status,
          };
        })
        .filter((row) => row.faturamento >= activeValorMinimo);
    }

    // -------------------------------------------------------------
    // REPORT 5: SAÚDE FINANCEIRA E CONTRATOS
    // -------------------------------------------------------------
    if (activeTipo === "financeiro_contratos") {
      return todosLancamentos
        .filter((t) => {
          const tDate = new Date(t.vencimento);
          return tDate >= inicio && tDate <= fim;
        })
        .map((t) => {
          const matchingContrato = contratos.find((c) => 
            c.empresaVinculada.toLowerCase().includes(t.descricao.toLowerCase()) || 
            t.descricao.toLowerCase().includes(c.empresaVinculada.toLowerCase()) ||
            t.descricao.toLowerCase().includes(c.id.toLowerCase()) ||
            t.contraparte.toLowerCase().includes(c.empresaVinculada.toLowerCase())
          );
          
          const matchingDocFiscal = documentosFiscais.find((df) => 
            df.destinatarioNome.toLowerCase().includes(t.descricao.toLowerCase()) ||
            t.descricao.toLowerCase().includes(df.destinatarioNome.toLowerCase()) ||
            t.descricao.toLowerCase().includes(df.id.toLowerCase()) ||
            t.contraparte.toLowerCase().includes(df.destinatarioNome.toLowerCase())
          );

          return {
            id: t.id,
            data: t.vencimento,
            tipo: t.tipo === "receber" ? "receita" : "despesa",
            descricao: t.descricao,
            valor: t.valor,
            statusLiquidacao: t.status,
            documentoFiscalId: matchingDocFiscal ? matchingDocFiscal.id : "-",
            contratoId: matchingContrato ? matchingContrato.id : "-",
          };
        })
        .filter((row) => Math.abs(row.valor) >= activeValorMinimo);
    }

    // -------------------------------------------------------------
    // REPORT 6: EFICIÊNCIA E CUSTO DE PESSOAL (RH)
    // -------------------------------------------------------------
    if (activeTipo === "rh_produtividade") {
      return funcionarios
        .map((f) => {
          const salario = f.cargo.toLowerCase() === "gerente" ? 8500.00 : f.cargo.toLowerCase() === "analista" ? 4800.00 : 3500.00;
          const resolvidos = chamados.filter((ch) => {
            if (ch.status !== "Resolvido") return false;
            const atendLog = ch.historicoAtendimento.find((h) => h.status === "Em Atendimento" || h.status === "Resolvido");
            const atendenteNome = atendLog ? atendLog.usuario : "";
            return atendenteNome.toLowerCase() === f.nome.toLowerCase();
          }).length;
          
          const custoPorChamado = resolvidos > 0 ? Math.round(salario / resolvidos) : salario;

          return {
            id: f.id,
            nome: f.nome,
            cargo: f.cargo,
            departamento: f.departamento,
            custoSalario: salario,
            chamadosResolvidos: resolvidos,
            custoPorChamado,
          };
        })
        .filter((row) => row.custoSalario >= activeValorMinimo);
    }

    // -------------------------------------------------------------
    // REPORT 7: EFICIÊNCIA DE SUPORTE E TI
    // -------------------------------------------------------------
    if (activeTipo === "suporte_ti") {
      return chamados
        .filter((ch) => {
          const chDate = new Date(ch.dataAbertura);
          return chDate >= inicio && chDate <= fim;
        })
        .map((ch) => {
          const matchingSolicitacao = solicitacoesInternas.find((s) => 
            s.tipoSolicitacao.toLowerCase() === ch.categoria.toLowerCase() || 
            s.historicoAprovacoes.some((h) => h.justificativa.toLowerCase().includes(ch.descricao.toLowerCase()))
          );

          const atendLog = ch.historicoAtendimento.find((h) => h.status === "Em Atendimento" || h.status === "Resolvido");
          const atendente = atendLog ? atendLog.usuario : "Suporte";
          const criticidade = ch.descricao.toLowerCase().includes("urgente") || ch.descricao.toLowerCase().includes("crítico") ? "alta" : "media";

          return {
            id: ch.idChamado,
            titulo: ch.descricao.length > 40 ? ch.descricao.slice(0, 40) + "..." : ch.descricao,
            categoria: ch.categoria,
            status: ch.status,
            criticidade: criticidade,
            solicitante: ch.usuarioSolicitante,
            atendente: atendente,
            dataAbertura: ch.dataAbertura,
            solicitacaoVinculada: matchingSolicitacao ? matchingSolicitacao.id : "-",
          };
        })
        .filter((row) => row.titulo.length >= activeValorMinimo / 1000);
    }

    // -------------------------------------------------------------
    // REPORT 8: GESTÃO DE ATIVOS E MANUTENÇÕES (TI)
    // -------------------------------------------------------------
    if (activeTipo === "ativos_ti") {
      return ativos
        .map((a) => {
          const matchingManutencoes = manutencoes.filter((m) => m.ativoId === a.id);
          const manutencoesQtd = matchingManutencoes.length;
          const ultimaManutencao = matchingManutencoes.length > 0 
            ? matchingManutencoes[matchingManutencoes.length - 1].dataAgendada 
            : "-";
          const custoReposicao = a.descricao.toLowerCase().includes("cnc") ? 150000.00 : a.descricao.toLowerCase().includes("dell") || a.descricao.toLowerCase().includes("workstation") ? 7800.00 : 2500.00;
          const criticidade = a.setorResponsavel.toLowerCase() === "ti" || a.descricao.toLowerCase().includes("cnc") ? "alta" : "media";

          return {
            id: a.id,
            nome: a.descricao,
            tipo: a.setorResponsavel,
            status: a.status,
            criticidade: criticidade,
            manutencoesQtd,
            ultimaManutencao,
            custoReposicao,
          };
        })
        .filter((row) => row.custoReposicao >= activeValorMinimo);
    }

    return [];

  }, [activeTipo, activeDataInicio, activeDataFim, activeCategoriaSel, activeValorMinimo, estoque, vendas, ordens, cargas, rotas, clientes, oportunidades, contratos, documentosFiscais, todosLancamentos, funcionarios, chamados, solicitacoesInternas, ativos, manutencoes]);

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
    if (activeTipo === "margem_logistica") {
      const list = dadosRelatorio as MargemLogisticaRow[];
      const totalVendas = list.reduce((acc, item) => acc + item.faturamentoVenda, 0);
      const totalFretes = list.reduce((acc, item) => acc + item.custoFrete, 0);
      const margemGlobal = totalVendas > 0 ? Math.round(((totalVendas - totalFretes) / totalVendas) * 100) : 0;
      return { totalVendas, totalFretes, margemGlobal };
    }
    if (activeTipo === "comercial_crm") {
      const list = dadosRelatorio as ComercialCrmRow[];
      const fatTotal = list.reduce((acc, item) => acc + item.faturamento, 0);
      const ticketMedio = list.reduce((acc, item) => acc + item.totalVendas, 0) > 0 
        ? Math.round(fatTotal / list.reduce((acc, item) => acc + item.totalVendas, 0)) 
        : 0;
      const conversaoMedia = list.length > 0 ? Math.round(list.reduce((acc, item) => acc + item.conversao, 0) / list.length) : 0;
      return { fatTotal, ticketMedio, conversaoMedia };
    }
    if (activeTipo === "financeiro_contratos") {
      const list = dadosRelatorio as FinanceiroContratosRow[];
      const totalRecebido = list.filter(r => r.tipo === "receita").reduce((acc, item) => acc + item.valor, 0);
      const totalPago = list.filter(r => r.tipo === "despesa").reduce((acc, item) => acc + Math.abs(item.valor), 0);
      const saldoFinanceiro = totalRecebido - totalPago;
      return { totalRecebido, totalPago, saldoFinanceiro };
    }
    if (activeTipo === "rh_produtividade") {
      const list = dadosRelatorio as RhProdutividadeRow[];
      const folhaSalarial = list.reduce((acc, item) => acc + item.custoSalario, 0);
      const totalResolvidos = list.reduce((acc, item) => acc + item.chamadosResolvidos, 0);
      const mediaCustoChamado = totalResolvidos > 0 ? Math.round(folhaSalarial / totalResolvidos) : folhaSalarial;
      return { folhaSalarial, totalResolvidos, mediaCustoChamado };
    }
    if (activeTipo === "suporte_ti") {
      const list = dadosRelatorio as SuporteTiRow[];
      const totalChamados = list.length;
      const chamadosCriticos = list.filter(r => r.criticidade === "alta" || r.criticidade === "critica").length;
      const vinculacaoTaxa = totalChamados > 0 
        ? Math.round((list.filter(r => r.solicitacaoVinculada !== "-").length / totalChamados) * 100) 
        : 0;
      return { totalChamados, chamadosCriticos, vinculacaoTaxa };
    }
    if (activeTipo === "ativos_ti") {
      const list = dadosRelatorio as AtivosTiRow[];
      const custoTotalAtivos = list.reduce((acc, item) => acc + item.custoReposicao, 0);
      const totalManutencoes = list.reduce((acc, item) => acc + item.manutencoesQtd, 0);
      const ativosCriticos = list.filter(r => r.criticidade === "alta" || r.criticidade === "critica").length;
      return { custoTotalAtivos, totalManutencoes, ativosCriticos };
    }
    return {};
  }, [activeTipo, dadosRelatorio]);

  const handleGerarRelatorio = () => {
    const moduloMap = {
      giro: "Estoque",
      producao_demanda: "Produção",
      margem_logistica: "Logística",
      comercial_crm: "Comercial",
      financeiro_contratos: "Financeiro",
      rh_produtividade: "RH",
      suporte_ti: "Suporte & TI",
      ativos_ti: "Ativos & TI",
      anomalias: "Qualidade",
    };
    const reportId = gerarRelatorioRun(
      tipo,
      moduloMap[tipo as keyof typeof moduloMap],
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
                  <option value="comercial_crm">Comercial & CRM (Vendas/Clientes)</option>
                  <option value="financeiro_contratos">Financeiro & Contratos (Fluxo Caixa)</option>
                  <option value="rh_produtividade">Custo e Eficiência de Equipe (RH)</option>
                  <option value="suporte_ti">Eficiência de Atendimento (Suporte/TI)</option>
                  <option value="ativos_ti">Gestão de Ativos e Manutenções (TI)</option>
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
                          <span suppressHydrationWarning>{new Date(rep.dataGeracao).toLocaleTimeString("pt-BR")}</span>
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
                          <text x={x + 15} y={y - 5} textAnchor="middle" fill="var(--chart-1)" fontSize="7" fontWeight="bold">
                            R$ {Math.round(item.faturamento)}
                          </text>
                          <text x={x + 15} y="105" textAnchor="middle" className="fill-muted-foreground" fontSize="6" fontWeight="bold">
                            {item.nome.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}
                    <defs>
                      <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <line x1="30" y1="90" x2="480" y2="90" className="stroke-border" strokeWidth="1.5" />
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
                            fill="var(--chart-2)"
                            rx="2"
                          />
                          <rect
                            x={x + 18}
                            y={90 - hDem}
                            width="14"
                            height={hDem}
                            fill="var(--chart-3)"
                            rx="2"
                          />
                          <text x={x + 16} y="105" textAnchor="middle" className="fill-muted-foreground" fontSize="6" fontWeight="bold">
                            {item.nome.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}
                    <line x1="30" y1="90" x2="480" y2="90" className="stroke-border" strokeWidth="1.5" />
                  </svg>
                )}

                {activeTipo === "margem_logistica" && (
                  <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                    {(dadosRelatorio as MargemLogisticaRow[]).map((item, idx) => {
                      const x = 50 + idx * 80;
                      const y = 90 - (item.margemLiquida / 100) * 80;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="4" fill="var(--chart-4)" className="stroke-background" strokeWidth="1.5" />
                          <text x={x} y={y - 8} textAnchor="middle" fill="var(--chart-4)" fontSize="7" fontWeight="bold">
                            {item.margemLiquida}%
                          </text>
                          <text x={x} y="105" textAnchor="middle" className="fill-muted-foreground" fontSize="6" fontWeight="bold">
                            {item.cargaId}
                          </text>
                        </g>
                      );
                    })}
                    <line x1="30" y1="90" x2="480" y2="90" className="stroke-border" strokeWidth="1.5" />
                  </svg>
                )}

                {activeTipo === "comercial_crm" && (
                  <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                    {(dadosRelatorio as ComercialCrmRow[]).slice(0, 6).map((item, idx) => {
                      const maxVal = Math.max(...(dadosRelatorio as ComercialCrmRow[]).map((i) => i.faturamento || 1));
                      const height = (item.faturamento / maxVal) * 80;
                      const x = 40 + idx * 75;
                      const y = 90 - height;
                      return (
                        <g key={item.clienteId}>
                          <rect
                            x={x}
                            y={y}
                            width="25"
                            height={height}
                            fill="var(--chart-1)"
                            rx="2"
                          />
                          <text x={x + 12} y={y - 5} textAnchor="middle" fill="var(--chart-1)" fontSize="7" fontWeight="bold">
                            R$ {Math.round(item.faturamento / 1000)}k
                          </text>
                          <text x={x + 12} y="105" textAnchor="middle" className="fill-muted-foreground" fontSize="6" fontWeight="bold">
                            {item.clienteNome.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}
                    <line x1="30" y1="90" x2="480" y2="90" className="stroke-border" strokeWidth="1.5" />
                  </svg>
                )}

                {activeTipo === "financeiro_contratos" && (
                  <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                    {(() => {
                      const maxVal = Math.max(...(dadosRelatorio as FinanceiroContratosRow[]).map((i) => Math.abs(i.valor) || 1));
                      return (dadosRelatorio as FinanceiroContratosRow[]).slice(0, 10).map((item, idx) => {
                        const isReceita = item.tipo === "receita" || item.valor > 0;
                        const height = (Math.abs(item.valor) / maxVal) * 80;
                        const x = 40 + idx * 42;
                        const y = 90 - height;
                        return (
                          <g key={item.id}>
                            <rect
                              x={x}
                              y={y}
                              width="18"
                              height={height}
                              fill={isReceita ? "var(--chart-2)" : "var(--chart-5)"}
                              rx="2"
                            />
                            <text x={x + 9} y="105" textAnchor="middle" className="fill-muted-foreground" fontSize="5" fontWeight="bold">
                              {item.id.replace("TX-", "")}
                            </text>
                          </g>
                        );
                      });
                    })()}
                    <line x1="30" y1="90" x2="480" y2="90" className="stroke-border" strokeWidth="1.5" />
                  </svg>
                )}

                {activeTipo === "rh_produtividade" && (
                  <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                    {(dadosRelatorio as RhProdutividadeRow[]).slice(0, 6).map((item, idx) => {
                      const maxVal = Math.max(...(dadosRelatorio as RhProdutividadeRow[]).map((i) => i.custoSalario || 1));
                      const height = (item.custoSalario / maxVal) * 80;
                      const x = 40 + idx * 75;
                      const y = 90 - height;
                      return (
                        <g key={item.id}>
                          <rect
                            x={x}
                            y={y}
                            width="25"
                            height={height}
                            fill="var(--chart-3)"
                            rx="2"
                          />
                          <text x={x + 12} y={y - 5} textAnchor="middle" fill="var(--chart-3)" fontSize="7" fontWeight="bold">
                            {item.chamadosResolvidos} Res.
                          </text>
                          <text x={x + 12} y="105" textAnchor="middle" className="fill-muted-foreground" fontSize="6" fontWeight="bold">
                            {item.nome.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}
                    <line x1="30" y1="90" x2="480" y2="90" className="stroke-border" strokeWidth="1.5" />
                  </svg>
                )}

                {activeTipo === "suporte_ti" && (
                  <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                    {(() => {
                      const list = (dadosRelatorio as SuporteTiRow[]).slice(0, 10);
                      const points = list.map((item, idx) => {
                        const x = 50 + idx * 42;
                        const isCrit = item.criticidade === "alta" || item.criticidade === "critica";
                        const y = isCrit ? 30 : item.status === "resolvido" ? 80 : 55;
                        return { x, y };
                      });
                      
                      const pathD = points.reduce((acc, p, i) => 
                        i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, 
                        ""
                      );

                      return (
                        <>
                          {points.length > 1 && (
                            <path d={pathD} fill="none" stroke="var(--chart-4)" strokeWidth="2" strokeLinecap="round" />
                          )}
                          {points.map((p, idx) => (
                            <g key={idx}>
                              <circle cx={p.x} cy={p.y} r="3.5" fill="var(--chart-4)" stroke="white" strokeWidth="1" />
                              <text x={p.x} y="105" textAnchor="middle" className="fill-muted-foreground" fontSize="5" fontWeight="bold">
                                {list[idx].id}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                    <line x1="30" y1="90" x2="480" y2="90" className="stroke-border" strokeWidth="1.5" />
                  </svg>
                )}

                {activeTipo === "ativos_ti" && (
                  <svg viewBox="0 0 500 120" className="w-full h-full text-xs">
                    {(dadosRelatorio as AtivosTiRow[]).slice(0, 6).map((item, idx) => {
                      const maxVal = Math.max(...(dadosRelatorio as AtivosTiRow[]).map((i) => i.custoReposicao || 1));
                      const height = (item.custoReposicao / maxVal) * 80;
                      const x = 40 + idx * 75;
                      const y = 90 - height;
                      return (
                        <g key={item.id}>
                          <rect
                            x={x}
                            y={y}
                            width="25"
                            height={height}
                            fill="var(--chart-5)"
                            rx="2"
                          />
                          <text x={x + 12} y={y - 5} textAnchor="middle" fill="var(--chart-5)" fontSize="7" fontWeight="bold">
                            M: {item.manutencoesQtd}
                          </text>
                          <text x={x + 12} y="105" textAnchor="middle" className="fill-muted-foreground" fontSize="6" fontWeight="bold">
                            {item.nome.slice(0, 8)}
                          </text>
                        </g>
                      );
                    })}
                    <line x1="30" y1="90" x2="480" y2="90" className="stroke-border" strokeWidth="1.5" />
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

              <div className="grid gap-4 grid-cols-3 text-left">
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

                {activeTipo === "comercial_crm" && (
                  <>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Faturamento Bruto</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                        {formatCurrency(totalizadores.fatTotal || 0)}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Conversão Média (CRM)</span>
                      <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {totalizadores.conversaoMedia}%
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Ticket Médio Vendas</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                        {formatCurrency(totalizadores.ticketMedio || 0)}
                      </span>
                    </div>
                  </>
                )}

                {activeTipo === "financeiro_contratos" && (
                  <>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Recebido</span>
                      <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {formatCurrency(totalizadores.totalRecebido || 0)}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Pago / Despesa</span>
                      <span className="text-base sm:text-xl font-extrabold text-destructive tracking-tight">
                        {formatCurrency(totalizadores.totalPago || 0)}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Saldo Net Operacional</span>
                      <span className={cn(
                        "text-base sm:text-xl font-extrabold tracking-tight",
                        (totalizadores.saldoFinanceiro ?? 0) >= 0 ? "text-emerald-500" : "text-destructive"
                      )}>
                        {formatCurrency(totalizadores.saldoFinanceiro || 0)}
                      </span>
                    </div>
                  </>
                )}

                {activeTipo === "rh_produtividade" && (
                  <>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Custo da Folha (RH)</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                        {formatCurrency(totalizadores.folhaSalarial || 0)}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Chamados Resolvidos</span>
                      <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {totalizadores.totalResolvidos} chamados
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Custo Médio / Chamado</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                        {formatCurrency(totalizadores.mediaCustoChamado || 0)}
                      </span>
                    </div>
                  </>
                )}

                {activeTipo === "suporte_ti" && (
                  <>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Total de Chamados</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                        {totalizadores.totalChamados} chamados
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Alertas Críticos</span>
                      <span className="text-base sm:text-xl font-extrabold text-destructive tracking-tight">
                        {totalizadores.chamadosCriticos} ocorrências
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Taxa de Vinculação TI</span>
                      <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {totalizadores.vinculacaoTaxa}%
                      </span>
                    </div>
                  </>
                )}

                {activeTipo === "ativos_ti" && (
                  <>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Custo Reposição Ativos</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
                        {formatCurrency(totalizadores.custoTotalAtivos || 0)}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Manutenções Preventivas</span>
                      <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {totalizadores.totalManutencoes} registradas
                      </span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Ativos Críticos</span>
                      <span className="text-base sm:text-xl font-extrabold text-destructive tracking-tight">
                        {totalizadores.ativosCriticos} servidores
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
                            <th className="p-3 text-left">Produto</th>
                            <th className="p-3 text-left">Categoria</th>
                            <th className="p-3 text-center">Estoque Atual</th>
                            <th className="p-3 text-center">Qtd Vendida</th>
                            <th className="p-3 text-center">Faturamento Bruto</th>
                            <th className="p-3 text-center">Giro de Estoque</th>
                          </>
                        )}
                        {activeTipo === "producao_demanda" && (
                          <>
                            <th className="p-3 text-left">Produto</th>
                            <th className="p-3 text-left">Categoria</th>
                            <th className="p-3 text-center">Qtd Fabricada (OPs)</th>
                            <th className="p-3 text-center">Qtd Vendida (Vendas)</th>
                            <th className="p-3 text-center">Diferença Operacional</th>
                          </>
                        )}
                        {activeTipo === "margem_logistica" && (
                          <>
                            <th className="p-3 text-center">Carga / Pedido</th>
                            <th className="p-3 text-center">Destinatário</th>
                            <th className="p-3 text-center">Destino</th>
                            <th className="p-3 text-center">Valor Venda</th>
                            <th className="p-3 text-center">Custo de Frete</th>
                            <th className="p-3 text-center">Receita Líquida</th>
                            <th className="p-3 text-center">Margem Net</th>
                          </>
                        )}
                        {activeTipo === "comercial_crm" && (
                          <>
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-left">CNPJ/CPF</th>
                            <th className="p-3 text-center">Total de Vendas</th>
                            <th className="p-3 text-center">Faturamento Acumulado</th>
                            <th className="p-3 text-center">Oportunidades (CRM)</th>
                            <th className="p-3 text-center">Taxa Conversão</th>
                          </>
                        )}
                        {activeTipo === "financeiro_contratos" && (
                          <>
                            <th className="p-3 text-center">ID Transação</th>
                            <th className="p-3 text-center">Data</th>
                            <th className="p-3 text-left">Descrição</th>
                            <th className="p-3 text-center">Contrato Vinc.</th>
                            <th className="p-3 text-center">Doc. Fiscal</th>
                            <th className="p-3 text-right">Valor</th>
                            <th className="p-3 text-center">Status</th>
                          </>
                        )}
                        {activeTipo === "rh_produtividade" && (
                          <>
                            <th className="p-3 text-left">Funcionário</th>
                            <th className="p-3 text-left">Cargo / Departamento</th>
                            <th className="p-3 text-center">Folha Salarial</th>
                            <th className="p-3 text-center">Chamados Resolvidos</th>
                            <th className="p-3 text-center">Custo/Chamado Resolvido</th>
                          </>
                        )}
                        {activeTipo === "suporte_ti" && (
                          <>
                            <th className="p-3 text-center">ID Chamado</th>
                            <th className="p-3 text-left">Título / Categoria</th>
                            <th className="p-3 text-center">Solicitante</th>
                            <th className="p-3 text-center">Atendente</th>
                            <th className="p-3 text-center">Criticidade</th>
                            <th className="p-3 text-center">Sol. Interna Vinc.</th>
                            <th className="p-3 text-center">Status</th>
                          </>
                        )}
                        {activeTipo === "ativos_ti" && (
                          <>
                            <th className="p-3 text-center">ID Ativo</th>
                            <th className="p-3 text-left">Equipamento</th>
                            <th className="p-3 text-center">Tipo / Criticidade</th>
                            <th className="p-3 text-center">Qtd Manutenções</th>
                            <th className="p-3 text-center">Próxima / Última</th>
                            <th className="p-3 text-right">Custo Reposição</th>
                            <th className="p-3 text-center">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium text-left">
                      {activeTipo === "giro" &&
                        (dadosRelatorio as GiroRow[]).map((row) => (
                          <tr key={row.id} className="hover:bg-accent/10 transition-colors">
                            <td className="p-3 font-bold text-foreground text-left">{row.nome}</td>
                            <td className="p-3 text-muted-foreground text-left">{row.categoria}</td>
                            <td className="p-3 text-center">{row.estoqueAtual} un.</td>
                            <td className="p-3 text-center">{row.unidadesVendidas} un.</td>
                            <td className="p-3 font-extrabold text-foreground text-right">
                              R$ {row.faturamento?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-center">
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
                            <td className="p-3 font-bold text-foreground text-left">{row.nome}</td>
                            <td className="p-3 text-muted-foreground text-left">{row.categoria}</td>
                            <td className="p-3 font-extrabold text-center">{row.produzido} un.</td>
                            <td className="p-3 font-extrabold text-center">{row.demandado} un.</td>
                            <td className="p-3 font-extrabold text-center">
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
                            <td className="p-3 font-bold text-foreground text-center">
                              {row.cargaId} <span className="text-[10px] text-muted-foreground">({row.pedidoId})</span>
                            </td>
                            <td className="p-3 text-center">{row.cliente}</td>
                            <td className="p-3 text-muted-foreground text-center">{row.destino}</td>
                            <td className="p-3 font-bold text-foreground text-right">
                              R$ {row.faturamentoVenda?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 font-bold text-destructive text-right">
                              R$ {row.custoFrete?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 font-bold text-emerald-600 text-center">
                              R$ {row.receitaLiquida?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 font-extrabold text-center">
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

                      {activeTipo === "comercial_crm" &&
                        (dadosRelatorio as ComercialCrmRow[]).map((row) => (
                          <tr key={row.clienteId} className="hover:bg-accent/10 transition-colors">
                            <td className="p-3 font-bold text-foreground text-left">{row.clienteNome}</td>
                            <td className="p-3 text-muted-foreground text-left">{row.documento}</td>
                            <td className="p-3 text-center">{row.totalVendas} vendas</td>
                            <td className="p-3 font-extrabold text-foreground text-right">
                              {formatCurrency(row.faturamento)}
                            </td>
                            <td className="p-3 text-center">{row.qtdOportunidades} leads</td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded font-bold text-[10px]",
                                row.conversao > 50
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-500/10 text-amber-500"
                              )}>
                                {row.conversao}%
                              </span>
                            </td>
                          </tr>
                        ))}

                      {activeTipo === "financeiro_contratos" &&
                        (dadosRelatorio as FinanceiroContratosRow[]).map((row) => (
                          <tr key={row.id} className="hover:bg-accent/10 transition-colors">
                            <td className="p-3 font-mono font-bold text-center">{row.id}</td>
                            <td className="p-3 text-center" suppressHydrationWarning>{new Date(row.data).toLocaleDateString("pt-BR")}</td>
                            <td className="p-3 text-left font-semibold text-foreground max-w-[200px] truncate">{row.descricao}</td>
                            <td className="p-3 text-center font-mono text-xs">{row.contratoId}</td>
                            <td className="p-3 text-center font-mono text-xs">{row.documentoFiscalId}</td>
                            <td className={cn(
                              "p-3 font-extrabold text-right",
                              row.tipo === "receita" ? "text-emerald-600" : "text-destructive"
                            )}>
                              {row.tipo === "receita" ? "+" : "-"} {formatCurrency(Math.abs(row.valor))}
                            </td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded font-bold text-[10px]",
                                row.statusLiquidacao === "pago" || row.statusLiquidacao === "recebido"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-500/10 text-amber-500"
                              )}>
                                {row.statusLiquidacao}
                              </span>
                            </td>
                          </tr>
                        ))}

                      {activeTipo === "rh_produtividade" &&
                        (dadosRelatorio as RhProdutividadeRow[]).map((row) => (
                          <tr key={row.id} className="hover:bg-accent/10 transition-colors">
                            <td className="p-3 font-bold text-foreground text-left">{row.nome}</td>
                            <td className="p-3 text-left text-muted-foreground">
                              {row.cargo} <span className="text-[10px] block font-semibold text-slate-500">{row.departamento}</span>
                            </td>
                            <td className="p-3 text-center font-bold">{formatCurrency(row.custoSalario)}</td>
                            <td className="p-3 text-center font-extrabold text-emerald-600">{row.chamadosResolvidos} chamados</td>
                            <td className="p-3 text-center font-bold text-slate-700">{formatCurrency(row.custoPorChamado)} / cham.</td>
                          </tr>
                        ))}

                      {activeTipo === "suporte_ti" &&
                        (dadosRelatorio as SuporteTiRow[]).map((row) => (
                          <tr key={row.id} className="hover:bg-accent/10 transition-colors">
                            <td className="p-3 font-mono font-bold text-center">{row.id}</td>
                            <td className="p-3 text-left">
                              <span className="font-semibold text-foreground block">{row.titulo}</span>
                              <span className="text-[10px] text-muted-foreground">{row.categoria}</span>
                            </td>
                            <td className="p-3 text-center">{row.solicitante}</td>
                            <td className="p-3 text-center">{row.atendente}</td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded font-bold text-[9px] uppercase",
                                row.criticidade === "alta" || row.criticidade === "critica"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-blue-500/10 text-blue-600"
                              )}>
                                {row.criticidade}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono text-xs">{row.solicitacaoVinculada}</td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded font-bold text-[10px]",
                                row.status.toLowerCase() === "resolvido" || row.status.toLowerCase() === "concluido"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-500/10 text-amber-500"
                              )}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                      {activeTipo === "ativos_ti" &&
                        (dadosRelatorio as AtivosTiRow[]).map((row) => (
                          <tr key={row.id} className="hover:bg-accent/10 transition-colors">
                            <td className="p-3 font-mono font-bold text-center">{row.id}</td>
                            <td className="p-3 text-left">
                              <span className="font-bold text-foreground block">{row.nome}</span>
                              <span className="text-[10px] text-muted-foreground">{row.tipo}</span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded font-bold text-[9px] uppercase",
                                row.criticidade === "alta" || row.criticidade === "critica"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-slate-500/10 text-slate-600"
                              )}>
                                {row.criticidade}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold">{row.manutencoesQtd} manut.</td>
                            <td className="p-3 text-center font-semibold text-muted-foreground" suppressHydrationWarning>
                              {row.ultimaManutencao !== "-" ? new Date(row.ultimaManutencao).toLocaleDateString("pt-BR") : "-"}
                            </td>
                            <td className="p-3 text-right font-extrabold text-foreground">{formatCurrency(row.custoReposicao)}</td>
                            <td className="p-3 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded font-bold text-[10px]",
                                row.status.toLowerCase() === "ativo" || row.status.toLowerCase() === "operacional"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-destructive/10 text-destructive"
                              )}>
                                {row.status}
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
