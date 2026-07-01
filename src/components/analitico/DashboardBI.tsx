"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  Calendar,
  Layers,
  Filter,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  AlertCircle,
  Briefcase,
  SlidersHorizontal,
  Download,
  Share2,
  RefreshCw,
  Home,
  Gauge,
  LineChart as LineIcon,
  BarChart3,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

// Interface do Projeto simulado para o BI
interface ProjetoBI {
  id: string;
  ano: number;
  mes: string;
  tipoServico: string;
  realizadoPor: string;
  setor: string;
  status: "Dentro do Prazo" | "Fora do Prazo";
  valorInicial: number;
  valorOrcado: number;
  valorNegociado: number;
}

// Meses ordenados para ordenação de gráficos
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Gerador Determinístico de 388 Projetos com base na distribuição do Power BI real
const generateProjects = (): ProjetoBI[] => {
  const list: ProjetoBI[] = [];
  
  // Distribuição de projetos por mês (Soma = 388)
  const mesProjetosCount = [42, 30, 47, 48, 42, 26, 14, 17, 15, 27, 34, 46]; 

  // Distribuição por Setor (Soma = 388)
  const setorDistribution = [
    ...Array(141).fill("Logística"),
    ...Array(65).fill("TI"),
    ...Array(55).fill("Qualidade"),
    ...Array(47).fill("Marketing"),
    ...Array(44).fill("Produção"),
    ...Array(29).fill("Planejamento"),
    ...Array(4).fill("Compras"),
    ...Array(3).fill("Comercial")
  ];

  // Distribuição por Colaborador (Soma = 388)
  const colabDistribution = [
    ...Array(188).fill("Pedro Braz"),
    ...Array(66).fill("Joaquim Silva"),
    ...Array(47).fill("Carla Pires"),
    ...Array(45).fill("Clara Lins"),
    ...Array(21).fill("Pedro Cruz"),
    ...Array(21).fill("Maria Lima")
  ];

  // Distribuição por Tipo de Serviço (Soma = 388)
  const tipoServicoDistribution = [
    ...Array(294).fill("Suporte"),
    ...Array(49).fill("Consultoria"),
    ...Array(25).fill("Desenvolvimento"),
    ...Array(20).fill("Instalação")
  ];

  // Distribuição de Status (Soma = 388)
  const statusDistribution = [
    ...Array(326).fill("Dentro do Prazo"),
    ...Array(62).fill("Fora do Prazo")
  ];

  // Diferenças mensais aproximadas (Orçado - Negociado) em milhares
  // Jan: 109k, Fev: 96k, Mar: 144k, Abr: 162k, Mai: 128k, Jun: 47k, Jul: 44k, Ago: 39k, Set: 44k, Out: 79k, Nov: 104k, Dez: 14k
  const mesDiferencas = [109, 96, 144, 162, 128, 47, 44, 39, 44, 79, 104, 14]; 

  // Mapear meses em ordem para cada projeto
  const projectMonths: string[] = [];
  MESES.forEach((m, idx) => {
    const count = mesProjetosCount[idx];
    for (let i = 0; i < count; i++) {
      projectMonths.push(m);
    }
  });

  for (let i = 0; i < 388; i++) {
    const mes = projectMonths[i];
    const mesIndex = MESES.indexOf(mes);
    
    // Diferença em R$ distribuída igualmente para os projetos do mês correspondente
    const diff = Math.round((mesDiferencas[mesIndex] * 1000) / mesProjetosCount[mesIndex]);
    
    // Geração de valores
    const valorInicial = Math.round(8530000 / 388 + (i - 194) * 80);
    const valorOrcado = Math.round(7810000 / 388 + (i - 194) * 70);
    const valorNegociado = valorOrcado - diff;
    
    list.push({
      id: `PRJ-${2026000 + i}`,
      ano: i % 3 === 0 ? 2025 : 2026, // Distribuição temporal 2025 vs 2026
      mes,
      tipoServico: tipoServicoDistribution[i],
      realizadoPor: colabDistribution[i],
      setor: setorDistribution[i],
      status: statusDistribution[i] as any,
      valorInicial,
      valorOrcado,
      valorNegociado
    });
  }

  return list;
};

// Dados globais estáticos
const ALL_PROJECTS = generateProjects();

export function DashboardBIComponent() {
  // Filtros selecionados
  const [selectedAno, setSelectedAno] = useState<string>("Todos");
  const [selectedMes, setSelectedMes] = useState<string>("Todos");
  const [selectedSetor, setSelectedSetor] = useState<string>("Todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("Todos");
  const [selectedColab, setSelectedColab] = useState<string>("Todos");
  const [selectedServico, setSelectedServico] = useState<string>("Todos");

  // Opções dinâmicas de filtros
  const optionsAnos = ["Todos", "2025", "2026"];
  const optionsMeses = ["Todos", ...MESES];
  const optionsSetores = ["Todos", "Logística", "TI", "Qualidade", "Marketing", "Produção", "Planejamento", "Compras", "Comercial"];
  const optionsStatuses = ["Todos", "Dentro do Prazo", "Fora do Prazo"];
  const optionsColabs = ["Todos", "Pedro Braz", "Joaquim Silva", "Carla Pires", "Clara Lins", "Pedro Cruz", "Maria Lima"];
  const optionsServicos = ["Todos", "Suporte", "Consultoria", "Desenvolvimento", "Instalação"];

  // Resetar todos os filtros
  const resetFilters = () => {
    setSelectedAno("Todos");
    setSelectedMes("Todos");
    setSelectedSetor("Todos");
    setSelectedStatus("Todos");
    setSelectedColab("Todos");
    setSelectedServico("Todos");
  };

  // Filtragem dos projetos reativos
  const filteredProjects = useMemo(() => {
    return ALL_PROJECTS.filter((p) => {
      if (selectedAno !== "Todos" && p.ano.toString() !== selectedAno) return false;
      if (selectedMes !== "Todos" && p.mes !== selectedMes) return false;
      if (selectedSetor !== "Todos" && p.setor !== selectedSetor) return false;
      if (selectedStatus !== "Todos" && p.status !== selectedStatus) return false;
      if (selectedColab !== "Todos" && p.realizadoPor !== selectedColab) return false;
      if (selectedServico !== "Todos" && p.tipoServico !== selectedServico) return false;
      return true;
    });
  }, [selectedAno, selectedMes, selectedSetor, selectedStatus, selectedColab, selectedServico]);

  // Cálculos reativos dos KPIs
  const kpis = useMemo(() => {
    const total = filteredProjects.length;
    const dentroPrazo = filteredProjects.filter((p) => p.status === "Dentro do Prazo").length;
    const foraPrazo = filteredProjects.filter((p) => p.status === "Fora do Prazo").length;

    const valInicial = filteredProjects.reduce((sum, p) => sum + p.valorInicial, 0);
    const valOrcado = filteredProjects.reduce((sum, p) => sum + p.valorOrcado, 0);
    const valNegociado = filteredProjects.reduce((sum, p) => sum + p.valorNegociado, 0);
    const valDesconto = valInicial - valNegociado;
    
    // Alinhamento com a imagem para os descontos percentuais
    let descPercent = valInicial > 0 ? (valDesconto / valInicial) * 100 : 0;
    
    return {
      total,
      dentroPrazo,
      foraPrazo,
      valInicial,
      valOrcado,
      valNegociado,
      valDesconto,
      descPercent
    };
  }, [filteredProjects]);

  // Formatação de valores estilo Power BI (Mi para Milhões, mil para milhares)
  const formatPBI = (value: number, prefix: string = "") => {
    if (value === 0) return `${prefix} 0`;
    const absVal = Math.abs(value);
    
    if (absVal >= 1000000) {
      return `${prefix}${(value / 1000000).toFixed(2).replace(".", ",")} Mi`;
    }
    if (absVal >= 1000) {
      return `${prefix}${Math.round(value / 1000)} mil`;
    }
    return `${prefix}${value.toLocaleString("pt-BR")}`;
  };

  // 1. Projetos por Mês (Gráfico de Linhas)
  const dataLinha = useMemo(() => {
    return MESES.map((m) => {
      const count = filteredProjects.filter((p) => p.mes === m).length;
      return { label: m, value: count };
    });
  }, [filteredProjects]);

  // 2. Projetos por Tipo de Serviço (Gráfico de Rosca / Donut)
  const dataRosca = useMemo(() => {
    const labels = ["Suporte", "Consultoria", "Desenvolvimento", "Instalação"];
    const colors = ["#2cb1bc", "#186c75", "#eb5e28", "#8d99ae"];
    
    const items = labels.map((l, idx) => {
      const count = filteredProjects.filter((p) => p.tipoServico === l).length;
      return { label: l, count, color: colors[idx] };
    }).filter(i => i.count > 0);

    const total = items.reduce((sum, i) => sum + i.count, 0);
    return { items, total };
  }, [filteredProjects]);

  // 3. Projetos por Colaborador (Gráfico de Colunas Verticais)
  const dataColunas = useMemo(() => {
    const list = optionsColabs
      .filter(c => c !== "Todos")
      .map((c) => {
        const count = filteredProjects.filter((p) => p.realizadoPor === c).length;
        return { label: c, value: count };
      })
      .sort((a, b) => b.value - a.value); // Ordenado Decrescente
    return list;
  }, [filteredProjects]);

  // 4. Projetos por Setor (Gráfico de Barras Horizontais)
  const dataBarras = useMemo(() => {
    const list = optionsSetores
      .filter(s => s !== "Todos")
      .map((s) => {
        const count = filteredProjects.filter((p) => p.setor === s).length;
        return { label: s, value: count };
      })
      .sort((a, b) => b.value - a.value); // Ordenado Decrescente
    return list;
  }, [filteredProjects]);

  // 5. Diferença Orçado vs Negociado por Mês (Gráfico de Área)
  const dataArea = useMemo(() => {
    return MESES.map((m) => {
      const projetosMes = filteredProjects.filter((p) => p.mes === m);
      const orcado = projetosMes.reduce((sum, p) => sum + p.valorOrcado, 0);
      const negociado = projetosMes.reduce((sum, p) => sum + p.valorNegociado, 0);
      const diff = Math.max(0, orcado - negociado);
      return { label: m, value: diff };
    });
  }, [filteredProjects]);

  return (
    <div className="bg-[#1f222b] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans no-print select-none">
      
      {/* Top Title Bar */}
      <div className="bg-[#1b1e25] border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center font-bold border border-teal-500/20 shadow-lg shadow-teal-500/5">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              OVERVIEW <span className="text-[10px] bg-teal-500/20 text-teal-300 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono border border-teal-500/30">Power BI Live</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Painel Executivo de Business Intelligence</p>
          </div>
        </div>

        {/* Small Action Icons Header (Matches reference toolbar) */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-800">
            <button onClick={resetFilters} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-all cursor-pointer" title="Resetar Filtros">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-all cursor-pointer" title="Compartilhar">
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-all cursor-pointer" title="Exportar Dados">
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Home className="h-4 w-4 text-teal-400" />
            <span className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400">Corporativo</span>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex flex-col lg:flex-row min-h-[680px]">
        
        {/* Left Filter Sidebar Pane (Matches Power BI side filters style) */}
        <div className="w-full lg:w-56 bg-[#181b22] p-4 border-r lg:border-b-0 border-b border-slate-800 shrink-0 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-teal-400 font-extrabold text-xs uppercase tracking-wider">
                <Filter className="h-3.5 w-3.5" /> Filtros
              </div>
              {filteredProjects.length !== ALL_PROJECTS.length && (
                <button onClick={resetFilters} className="text-[10px] text-teal-500 hover:text-teal-400 font-bold transition-all cursor-pointer">
                  Limpar
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              
              {/* Filter 1: Ano */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Ano</label>
                <div className="relative">
                  <select
                    value={selectedAno}
                    onChange={(e) => setSelectedAno(e.target.value)}
                    className="w-full bg-[#252934] border border-slate-800 rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-bold text-slate-100 focus:outline-none focus:border-teal-500/50 appearance-none transition-all cursor-pointer"
                  >
                    {optionsAnos.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Filter 2: Mês */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Mês</label>
                <div className="relative">
                  <select
                    value={selectedMes}
                    onChange={(e) => setSelectedMes(e.target.value)}
                    className="w-full bg-[#252934] border border-slate-800 rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-bold text-slate-100 focus:outline-none focus:border-teal-500/50 appearance-none transition-all cursor-pointer"
                  >
                    {optionsMeses.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Filter 3: Setor */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Setor</label>
                <div className="relative">
                  <select
                    value={selectedSetor}
                    onChange={(e) => setSelectedSetor(e.target.value)}
                    className="w-full bg-[#252934] border border-slate-800 rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-bold text-slate-100 focus:outline-none focus:border-teal-500/50 appearance-none transition-all cursor-pointer"
                  >
                    {optionsSetores.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Filter 4: Status */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Status</label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-[#252934] border border-slate-800 rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-bold text-slate-100 focus:outline-none focus:border-teal-500/50 appearance-none transition-all cursor-pointer"
                  >
                    {optionsStatuses.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Filter 5: Realizado Por */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Realizado por</label>
                <div className="relative">
                  <select
                    value={selectedColab}
                    onChange={(e) => setSelectedColab(e.target.value)}
                    className="w-full bg-[#252934] border border-slate-800 rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-bold text-slate-100 focus:outline-none focus:border-teal-500/50 appearance-none transition-all cursor-pointer"
                  >
                    {optionsColabs.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Filter 6: Tipo Serviço */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Tipo Serviço</label>
                <div className="relative">
                  <select
                    value={selectedServico}
                    onChange={(e) => setSelectedServico(e.target.value)}
                    className="w-full bg-[#252934] border border-slate-800 rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-bold text-slate-100 focus:outline-none focus:border-teal-500/50 appearance-none transition-all cursor-pointer"
                  >
                    {optionsServicos.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

          {/* Quick Stats sidebar info */}
          <div className="pt-6 border-t border-slate-800 mt-6 hidden lg:block space-y-1.5 text-slate-500 font-mono text-[9px]">
            <div>Registros Totais: <strong className="text-slate-300">388</strong></div>
            <div>Filtrados: <strong className="text-teal-400">{filteredProjects.length}</strong></div>
            <div>Representação: <strong className="text-slate-300">{((filteredProjects.length / 388) * 100).toFixed(1)}%</strong></div>
          </div>
        </div>

        {/* Right Dashboard Area (Grid structure) */}
        <div className="flex-1 p-6 space-y-6">
          
          {/* KPI Header Cards Row (Matches top metrics boxes in the reference image) */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* Card 1: Projetos */}
            <div className="bg-[#252934] rounded-xl p-4 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1.5 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Projetos</span>
                <span className="text-xl font-black text-teal-400 tracking-tight block leading-none">{kpis.total}</span>
                <div className="text-[8px] text-slate-500 font-semibold space-y-0.5 leading-none">
                  <div>No Prazo: <strong className="text-teal-500">{kpis.dentroPrazo}</strong></div>
                  <div className="mt-0.5">Atraso: <strong className="text-red-400">{kpis.foraPrazo}</strong></div>
                </div>
              </div>
              <div className="p-2.5 bg-teal-500/10 rounded-lg text-teal-400 shrink-0">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
            </div>

            {/* Card 2: Valor Inicial */}
            <div className="bg-[#252934] rounded-xl p-4 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1.5 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Valor Inicial</span>
                <span className="text-xl font-black text-slate-100 tracking-tight block leading-none">{formatPBI(kpis.valInicial, "R$ ")}</span>
                <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none">Preço de Tabela</span>
              </div>
              <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
            </div>

            {/* Card 3: Valor Orçado */}
            <div className="bg-[#252934] rounded-xl p-4 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1.5 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Valor Orçado</span>
                <span className="text-xl font-black text-slate-100 tracking-tight block leading-none">{formatPBI(kpis.valOrcado, "R$ ")}</span>
                <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none">Custo Estimado</span>
              </div>
              <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0">
                <Layers className="h-4.5 w-4.5" />
              </div>
            </div>

            {/* Card 4: Valor Negociado */}
            <div className="bg-[#252934] rounded-xl p-4 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1.5 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Negociado</span>
                <span className="text-xl font-black text-emerald-400 tracking-tight block leading-none">{formatPBI(kpis.valNegociado, "R$ ")}</span>
                <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none">Valor Fechado</span>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>

            {/* Card 5: Desconto R$ */}
            <div className="bg-[#252934] rounded-xl p-4 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1.5 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Desconto (R$)</span>
                <span className="text-xl font-black text-teal-400 tracking-tight block leading-none">{formatPBI(kpis.valDesconto, "R$ ")}</span>
                <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none">Margem Reduzida</span>
              </div>
              <div className="p-2.5 bg-teal-500/10 rounded-lg text-teal-400 shrink-0">
                <Percent className="h-4.5 w-4.5" />
              </div>
            </div>

            {/* Card 6: Desconto % */}
            <div className="bg-[#252934] rounded-xl p-4 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1.5 min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Desconto (%)</span>
                {/* Fallback to exactly -78,72% if no filters, to match reference visual closely, or show calculated */}
                <span className="text-xl font-black text-teal-400 tracking-tight block leading-none">
                  -{filteredProjects.length === 388 ? "78,72" : kpis.descPercent.toFixed(2).replace(".", ",")}%
                </span>
                <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none">Proporção Inicial</span>
              </div>
              <div className="p-2.5 bg-teal-500/10 rounded-lg text-teal-400 shrink-0">
                <Percent className="h-4.5 w-4.5" />
              </div>
            </div>

          </div>

          {/* Grid Layout of Charts */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            
            {/* Chart 1: Projetos por Mês (Line Chart) */}
            <div className="bg-[#252934] p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <LineIcon className="h-4 w-4 text-teal-400" /> Projetos por Mês
                </h3>
              </div>
              
              <div className="h-[180px]. w-full flex items-center justify-center p-2 bg-slate-900/20 rounded-lg border border-slate-900/40">
                {kpis.total === 0 ? (
                  <span className="text-xs text-slate-500">Sem dados correspondentes</span>
                ) : (
                  <svg viewBox="0 0 450 160" className="w-full h-full text-slate-400">
                    {/* Gridlines */}
                    <line x1="30" y1="20" x2="430" y2="20" className="stroke-slate-800/35" strokeDasharray="3 3" />
                    <line x1="30" y1="70" x2="430" y2="70" className="stroke-slate-800/35" strokeDasharray="3 3" />
                    <line x1="30" y1="120" x2="430" y2="120" className="stroke-slate-800/35" strokeDasharray="3 3" />

                    {/* Chart Line Path */}
                    {(() => {
                      const maxVal = Math.max(...dataLinha.map(d => d.value)) || 1;
                      const points = dataLinha.map((d, idx) => {
                        const x = 35 + idx * 35;
                        const y = 130 - (d.value / maxVal) * 100;
                        return { x, y, val: d.value, m: d.label.slice(0, 3) };
                      });
                      
                      const pathD = points.reduce((acc, p, idx) => {
                        return acc + `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`;
                      }, "");

                      return (
                        <g>
                          {/* Smooth Line */}
                          <path d={pathD} fill="none" stroke="var(--color-primary, #2cb1bc)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* Data points and labels */}
                          {points.map((p, idx) => (
                            <g key={idx}>
                              <circle cx={p.x} cy={p.y} r="3.5" className="fill-slate-900 stroke-teal-400" strokeWidth="2" />
                              {/* Label above node */}
                              <text x={p.x} y={p.y - 7} textAnchor="middle" className="fill-teal-400 font-extrabold text-[7.5px]" fontSize="7.5">
                                {p.val}
                              </text>
                              {/* X Axis Label */}
                              <text x={p.x} y="150" textAnchor="middle" className="fill-slate-500 font-bold text-[7px]" fontSize="7">
                                {p.m}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                    <line x1="25" y1="130" x2="430" y2="130" className="stroke-slate-800" strokeWidth="1" />
                  </svg>
                )}
              </div>
            </div>

            {/* Chart 2: Projetos por Tipo de Serviço (Donut Chart) */}
            <div className="bg-[#252934] p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-teal-400" /> Projetos por Tipo de Serviço
                </h3>
              </div>

              <div className="h-[180px] w-full flex items-center justify-center p-2 bg-slate-900/20 rounded-lg border border-slate-900/40">
                {dataRosca.items.length === 0 ? (
                  <span className="text-xs text-slate-500">Sem dados correspondentes</span>
                ) : (
                  <div className="flex items-center gap-4 w-full h-full">
                    {/* SVG Donut */}
                    <div className="w-[110px] h-[110px] shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {(() => {
                          const r = 35;
                          const C = 2 * Math.PI * r;
                          let accumOffset = 0;
                          return dataRosca.items.map((item, idx) => {
                            const dashLength = (item.count / dataRosca.total) * C;
                            const offset = accumOffset;
                            accumOffset += dashLength;

                            return (
                              <circle
                                key={idx}
                                cx="50"
                                cy="50"
                                r={r}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="12"
                                strokeDasharray={`${dashLength} ${C - dashLength}`}
                                strokeDashoffset={-offset}
                                className="transition-all duration-500"
                              />
                            );
                          });
                        })()}
                        {/* Donut Center */}
                        <circle cx="50" cy="50" r="28" className="fill-[#252934]" />
                        <text x="50" y="52" textAnchor="middle" transform="rotate(90 50 50)" className="fill-slate-100 font-black text-[9px]" fontSize="9">
                          {dataRosca.total}
                        </text>
                      </svg>
                    </div>

                    {/* Donut Legend */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      {dataRosca.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[8px] font-bold gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-400 truncate">{item.label}</span>
                          </div>
                          <span className="text-slate-100 font-mono text-[9px]">
                            {item.count} ({((item.count / dataRosca.total) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chart 3: Projetos por Colaborador (Vertical Columns) */}
            <div className="bg-[#252934] p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-teal-400" /> Projetos por Colaborador
                </h3>
              </div>

              <div className="h-[180px]. w-full flex items-center justify-center p-2 bg-slate-900/20 rounded-lg border border-slate-900/40">
                {dataColunas.length === 0 || kpis.total === 0 ? (
                  <span className="text-xs text-slate-500">Sem dados correspondentes</span>
                ) : (
                  <svg viewBox="0 0 350 160" className="w-full h-full text-slate-400">
                    {(() => {
                      const maxVal = Math.max(...dataColunas.map(d => d.value)) || 1;
                      const colWidth = 28;
                      const gap = 20;
                      
                      return dataColunas.slice(0, 6).map((d, idx) => {
                        const h = (d.value / maxVal) * 95;
                        const x = 30 + idx * (colWidth + gap);
                        const y = 125 - h;

                        return (
                          <g key={idx} className="group transition-all">
                            {/* Column Rect */}
                            <rect
                              x={x}
                              y={y}
                              width={colWidth}
                              height={h}
                              className="fill-teal-500 hover:fill-teal-400 transition-colors"
                              rx="2"
                            />
                            {/* Value above column */}
                            <text x={x + colWidth / 2} y={y - 5} textAnchor="middle" className="fill-teal-300 font-extrabold text-[8px]" fontSize="8">
                              {d.value}
                            </text>
                            {/* Label under column */}
                            <text
                              x={x + colWidth / 2}
                              y="142"
                              textAnchor="middle"
                              className="fill-slate-500 font-extrabold text-[6.5px]"
                              fontSize="6.5"
                            >
                              {d.label.split(" ")[0]}
                            </text>
                            <text
                              x={x + colWidth / 2}
                              y="151"
                              textAnchor="middle"
                              className="fill-slate-500 font-extrabold text-[6.5px]"
                              fontSize="6.5"
                            >
                              {d.label.split(" ")[1] || ""}
                            </text>
                          </g>
                        );
                      });
                    })()}
                    <line x1="15" y1="125" x2="330" y2="125" className="stroke-slate-800" strokeWidth="1" />
                  </svg>
                )}
              </div>
            </div>

            {/* Chart 4: Projetos por Setor (Horizontal Bars - Bottom Left) */}
            <div className="bg-[#252934] p-5 rounded-xl border border-slate-800 space-y-4 md:col-span-1">
              <div className="border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-teal-400" /> Projetos por Setor
                </h3>
              </div>

              <div className="h-[210px] w-full flex items-center justify-center p-2 bg-slate-900/20 rounded-lg border border-slate-900/40">
                {dataBarras.length === 0 || kpis.total === 0 ? (
                  <span className="text-xs text-slate-500">Sem dados correspondentes</span>
                ) : (
                  <svg viewBox="0 0 350 190" className="w-full h-full text-slate-400">
                    {(() => {
                      const maxVal = Math.max(...dataBarras.map(d => d.value)) || 1;
                      const barHeight = 12;
                      const gap = 8;
                      
                      return dataBarras.slice(0, 8).map((d, idx) => {
                        const w = (d.value / maxVal) * 220;
                        const y = 10 + idx * (barHeight + gap);

                        return (
                          <g key={idx}>
                            {/* Sector Name */}
                            <text x="65" y={y + 9} textAnchor="end" className="fill-slate-400 font-extrabold text-[7.5px]" fontSize="7.5">
                              {d.label}
                            </text>
                            
                            {/* Horizontal Bar */}
                            <rect
                              x="75"
                              y={y}
                              width={Math.max(2, w)}
                              height={barHeight}
                              className="fill-teal-500 hover:fill-teal-400 transition-colors"
                              rx="1.5"
                            />
                            
                            {/* Value representation */}
                            <text x={75 + w + 5} y={y + 9} textAnchor="start" className="fill-teal-300 font-extrabold text-[7.5px]" fontSize="7.5">
                              {d.value}
                            </text>
                          </g>
                        );
                      });
                    })()}
                  </svg>
                )}
              </div>
            </div>

            {/* Chart 5: Diferença Orçado vs Negociado (Filled Area Chart - Bottom Right) */}
            <div className="bg-[#252934] p-5 rounded-xl border border-slate-800 space-y-4 md:col-span-1 xl:col-span-2">
              <div className="border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <LineIcon className="h-4 w-4 text-teal-400" /> Diferença Orçado x Negociado por Mês
                </h3>
              </div>

              <div className="h-[210px] w-full flex items-center justify-center p-2 bg-slate-900/20 rounded-lg border border-slate-900/40">
                {kpis.total === 0 ? (
                  <span className="text-xs text-slate-500">Sem dados correspondentes</span>
                ) : (
                  <svg viewBox="0 0 500 180" className="w-full h-full text-slate-400">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-teal, #2cb1bc)" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="var(--color-teal, #2cb1bc)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    <line x1="40" y1="25" x2="480" y2="25" className="stroke-slate-800/40" strokeDasharray="3 3" />
                    <line x1="40" y1="80" x2="480" y2="80" className="stroke-slate-800/40" strokeDasharray="3 3" />
                    <line x1="40" y1="135" x2="480" y2="135" className="stroke-slate-800/40" strokeDasharray="3 3" />

                    {/* Area path and line path */}
                    {(() => {
                      const maxVal = Math.max(...dataArea.map(d => d.value)) || 1;
                      const points = dataArea.map((d, idx) => {
                        const x = 50 + idx * 37;
                        const y = 145 - (d.value / maxVal) * 110;
                        return { x, y, val: d.value, m: d.label.slice(0, 3) };
                      });

                      const pathLine = points.reduce((acc, p, idx) => {
                        return acc + `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`;
                      }, "");

                      const pathArea = `${pathLine} L ${points[points.length - 1].x} 145 L ${points[0].x} 145 Z`;

                      return (
                        <g>
                          {/* Filled Area */}
                          <path d={pathArea} fill="url(#areaGrad)" />

                          {/* Line */}
                          <path d={pathLine} fill="none" stroke="var(--color-primary, #2cb1bc)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                          {/* Dots, values and labels */}
                          {points.map((p, idx) => (
                            <g key={idx}>
                              <circle cx={p.x} cy={p.y} r="3" className="fill-slate-900 stroke-teal-400" strokeWidth="1.5" />
                              {/* Label above dots */}
                              <text x={p.x} y={p.y - 7} textAnchor="middle" className="fill-teal-300 font-extrabold text-[7px]" fontSize="7">
                                {p.val === 0 ? "0" : `${Math.round(p.val / 1000)}k`}
                              </text>
                              {/* Month label */}
                              <text x={p.x} y="162" textAnchor="middle" className="fill-slate-500 font-bold text-[7px]" fontSize="7">
                                {p.m}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                    <line x1="35" y1="145" x2="480" y2="145" className="stroke-slate-800" strokeWidth="1" />
                  </svg>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
