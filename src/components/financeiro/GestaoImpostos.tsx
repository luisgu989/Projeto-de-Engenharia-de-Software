"use client";

import React, { useState, useMemo } from "react";
import { Calculator, ShieldCheck, Printer, BarChart3, CreditCard, Download, DollarSign, CheckCircle2, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImpostoControle {
  id: string;
  sigla: string;
  nome: string;
  periodoRef: string;
  valor: number;
  vencimento: string;
  status: "pago" | "pendente" | "vencido";
  codigoReceita: string;
}

const impostosIniciais: ImpostoControle[] = [
  { id: "IMP-001", sigla: "DAS", nome: "Simples Nacional consolidado", periodoRef: "05/2026", valor: 3620.00, vencimento: "2026-06-20", status: "pago", codigoReceita: "1406" },
  { id: "IMP-002", sigla: "GPS", nome: "Contribuição Previdenciária INSS", periodoRef: "05/2026", valor: 2150.00, vencimento: "2026-06-20", status: "pago", codigoReceita: "2909" },
  { id: "IMP-003", sigla: "DARF IRPJ", nome: "Imposto de Renda Pessoa Jurídica", periodoRef: "T1/2026", valor: 12450.00, vencimento: "2026-04-30", status: "pago", codigoReceita: "2089" },
  { id: "IMP-004", sigla: "DAS", nome: "Simples Nacional consolidado", periodoRef: "06/2026", valor: 4523.00, vencimento: "2026-07-20", status: "pendente", codigoReceita: "1406" },
  { id: "IMP-005", sigla: "GPS", nome: "Contribuição Previdenciária INSS", periodoRef: "06/2026", valor: 2280.00, vencimento: "2026-07-20", status: "pendente", codigoReceita: "2909" },
];

export function GestaoImpostos() {
  const [subAba, setSubAba] = useState<"calculo" | "controle" | "guias" | "relatorios">("calculo");

  // Impostos State
  const [impostos, setImpostos] = useState<ImpostoControle[]>(impostosIniciais);

  // Calculo States
  const [faturamentoCalc, setFaturamentoCalc] = useState("");
  const [regimeTributario, setRegimeTributario] = useState<"simples" | "presumido" | "real">("simples");
  const [calculoResultado, setCalculoResultado] = useState<{
    faturamento: number;
    regime: string;
    aliquotaEfetiva: number;
    totalImposto: number;
    detalhes: { imposto: string; aliquota: number; valor: number }[];
  } | null>(null);

  // Guia State
  const [selectedImpostoGuia, setSelectedImpostoGuia] = useState<ImpostoControle | null>(impostosIniciais[3]);
  const [visualizarGuia, setVisualizarGuia] = useState(false);

  // Handle Tax Calculation
  const handleCalcularTributos = (e: React.FormEvent) => {
    e.preventDefault();
    const fatVal = parseFloat(faturamentoCalc);
    if (isNaN(fatVal) || fatVal <= 0) return;

    let aliquotaEfetiva = 0;
    let detalhes: { imposto: string; aliquota: number; valor: number }[] = [];

    if (regimeTributario === "simples") {
      aliquotaEfetiva = 8.5; // Ex: Anexo III da tabela do Simples
      detalhes = [
        { imposto: "DAS (Simples Consolidado)", aliquota: 8.5, valor: fatVal * 0.085 }
      ];
    } else if (regimeTributario === "presumido") {
      // Ex: Lucro Presumido Serviços (PIS + COFINS + CSLL + IRPJ + ISS)
      aliquotaEfetiva = 16.33; // Média federal + ISS local
      detalhes = [
        { imposto: "PIS (Federal)", aliquota: 0.65, valor: fatVal * 0.0065 },
        { imposto: "COFINS (Federal)", aliquota: 3.00, valor: fatVal * 0.03 },
        { imposto: "CSLL (Federal)", aliquota: 2.88, valor: fatVal * 0.0288 },
        { imposto: "IRPJ (Federal)", aliquota: 4.80, valor: fatVal * 0.0480 },
        { imposto: "ISS (Municipal)", aliquota: 5.00, valor: fatVal * 0.05 }
      ];
    } else {
      // Lucro Real (Alíquotas não cumulativas)
      aliquotaEfetiva = 24.25;
      detalhes = [
        { imposto: "PIS (Não cumulativo)", aliquota: 1.65, valor: fatVal * 0.0165 },
        { imposto: "COFINS (Não cumulativo)", aliquota: 7.60, valor: fatVal * 0.076 },
        { imposto: "CSLL (Real)", aliquota: 9.00, valor: fatVal * 0.09 },
        { imposto: "IRPJ (Real)", aliquota: 15.00, valor: fatVal * 0.15 },
        { imposto: "ICMS/ISS (Estimado)", aliquota: 12.00, valor: fatVal * 0.12 }
      ];
    }

    const totalImposto = detalhes.reduce((acc, d) => acc + d.valor, 0);

    setCalculoResultado({
      faturamento: fatVal,
      regime: regimeTributario === "simples" ? "Simples Nacional" : regimeTributario === "presumido" ? "Lucro Presumido" : "Lucro Real",
      aliquotaEfetiva: parseFloat(aliquotaEfetiva.toFixed(2)),
      totalImposto: parseFloat(totalImposto.toFixed(2)),
      detalhes: detalhes.map(d => ({ ...d, valor: parseFloat(d.valor.toFixed(2)) }))
    });
  };

  const handleLancarCalculadoNoControle = () => {
    if (!calculoResultado) return;
    
    const sigla = regimeTributario === "simples" ? "DAS" : "DARF";
    const novoImposto: ImpostoControle = {
      id: `IMP-${Date.now().toString().slice(-3)}`,
      sigla,
      nome: regimeTributario === "simples" ? "Simples Nacional Consolidado" : "Tributação sobre Faturamento",
      periodoRef: new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }),
      valor: calculoResultado.totalImposto,
      vencimento: new Date(Date.now() + 3600000 * 24 * 20).toISOString().split("T")[0], // 20 dias a frente
      status: "pendente",
      codigoReceita: regimeTributario === "simples" ? "1406" : "2089"
    };

    setImpostos((prev) => [novoImposto, ...prev]);
    setSelectedImpostoGuia(novoImposto);
    alert("Guia e impostos projetados lançados com sucesso no controle de tributação!");
    setCalculoResultado(null);
    setFaturamentoCalc("");
    setSubAba("controle");
  };

  const pagarImposto = (id: string) => {
    setImpostos((prev) =>
      prev.map(i => i.id === id ? { ...i, status: "pago" as const } : i)
    );
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex border-b border-border bg-accent/5 p-1 rounded-lg gap-2 w-fit">
        <button
          onClick={() => { setSubAba("calculo"); setVisualizarGuia(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
            subAba === "calculo" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calculator className="h-3.5 w-3.5" />
          Cálculo de Tributos
        </button>
        <button
          onClick={() => { setSubAba("controle"); setVisualizarGuia(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
            subAba === "controle" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Controle de Pagos
        </button>
        <button
          onClick={() => { setSubAba("guias"); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
            subAba === "guias" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Printer className="h-3.5 w-3.5" />
          Emissão de Guias
        </button>
        <button
          onClick={() => { setSubAba("relatorios"); setVisualizarGuia(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
            subAba === "relatorios" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Relatórios Fiscais
        </button>
      </div>

      {/* cálculo content */}
      {subAba === "calculo" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-fit space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-border pb-3">
              <Calculator className="h-4.5 w-4.5 text-primary" />
              Calculadora de Tributos
            </h3>
            
            <form onSubmit={handleCalcularTributos} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Regime Tributário</label>
                <select
                  value={regimeTributario}
                  onChange={(e) => setRegimeTributario(e.target.value as any)}
                  className="w-full bg-accent/40 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="simples">Simples Nacional (Regime Simplificado)</option>
                  <option value="presumido">Lucro Presumido (Base Padrão)</option>
                  <option value="real">Lucro Real (Não cumulativo)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Faturamento Bruto Projetado (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Ex: 50.000,00"
                  value={faturamentoCalc}
                  onChange={(e) => setFaturamentoCalc(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <Button type="submit" className="w-full text-xs font-semibold h-9 cursor-pointer">
                Processar Cálculo de Impostos
              </Button>
            </form>
          </div>

          <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm min-h-[250px] flex flex-col justify-between">
            {calculoResultado ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">Projeção Tributária</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Regime de Enquadramento: <strong>{calculoResultado.regime}</strong></p>
                  </div>
                  <Badge variant="outline" className="border-indigo-500/20 text-indigo-500 bg-indigo-500/5 font-extrabold text-[10px]">
                    Alíquota Efetiva: {calculoResultado.aliquotaEfetiva}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent/20 p-3 rounded-lg border border-border/50 text-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Base de Faturamento</span>
                    <p className="text-base font-black text-foreground mt-0.5">{formatCurrency(calculoResultado.faturamento)}</p>
                  </div>
                  <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/15 text-center">
                    <span className="text-[9px] font-bold text-destructive uppercase">Custo Tributário Estimado</span>
                    <p className="text-base font-black text-destructive mt-0.5">{formatCurrency(calculoResultado.totalImposto)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Memória de Cálculo (Tributos)</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                    {calculoResultado.detalhes.map((det, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-accent/30 p-2 rounded text-xs border border-border/30">
                        <span className="font-bold text-foreground/80">{det.imposto}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground font-semibold">{det.aliquota}%</span>
                          <span className="font-black text-foreground">{formatCurrency(det.valor)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCalculoResultado(null)}
                    className="h-9 text-xs font-semibold"
                  >
                    Descartar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleLancarCalculadoNoControle}
                    className="h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Lançar no Controle de Pagamentos
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 m-auto text-muted-foreground space-y-2.5">
                <Calculator className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-xs font-semibold max-w-[280px] leading-relaxed">
                  Insira o faturamento bruto estimado e o enquadramento tributário para simular a carga fiscal.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* controle content */}
      {subAba === "controle" && (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-accent/20 text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="p-4">Cód. Guia</th>
                  <th className="p-4">Imposto / Contribuição</th>
                  <th className="p-4">Cód. Receita</th>
                  <th className="p-4">Período de Ref.</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4 text-right">Valor do Tributo</th>
                  <th className="p-4 text-center">Status Sefaz</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {impostos.map((imp) => {
                  const isPendente = imp.status === "pendente";
                  return (
                    <tr key={imp.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-muted-foreground">{imp.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black px-1.5 py-0.5 rounded bg-muted text-foreground border border-border text-[9px] shrink-0 font-mono">
                            {imp.sigla}
                          </span>
                          <span className="font-bold text-foreground">{imp.nome}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-foreground/80">{imp.codigoReceita}</td>
                      <td className="p-4 text-muted-foreground font-semibold">{imp.periodoRef}</td>
                      <td className="p-4 font-semibold text-muted-foreground">{formatDate(imp.vencimento)}</td>
                      <td className="p-4 text-right font-black text-foreground">{formatCurrency(imp.valor)}</td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border",
                          imp.status === "pago"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20"
                        )}>
                          {imp.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => { setSelectedImpostoGuia(imp); setSubAba("guias"); setVisualizarGuia(true); }}
                            className="h-7 text-[10px] font-bold border-indigo-500/25 text-indigo-500 hover:bg-indigo-500/10"
                          >
                            <Eye className="h-3 w-3 mr-1" /> Ver Guia
                          </Button>
                          {isPendente && (
                            <Button
                              size="xs"
                              onClick={() => pagarImposto(imp.id)}
                              className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                            >
                              Dar Baixa
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* guias content */}
      {subAba === "guias" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-fit space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-border pb-3">
              <Printer className="h-4.5 w-4.5 text-primary" />
              Seleção de Tributo para Emissão
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Selecione o Imposto Lançado</label>
                <select
                  value={selectedImpostoGuia?.id || ""}
                  onChange={(e) => {
                    const match = impostos.find(i => i.id === e.target.value);
                    if (match) setSelectedImpostoGuia(match);
                  }}
                  className="w-full bg-accent/40 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground font-semibold cursor-pointer focus:outline-none"
                >
                  {impostos.map((imp) => (
                    <option key={imp.id} value={imp.id}>
                      [{imp.id}] {imp.sigla} - Ref: {imp.periodoRef} ({formatCurrency(imp.valor)})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => setVisualizarGuia(true)}
                className="w-full text-xs font-semibold h-9 cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Gerar Guia Oficial de Recolhimento
              </Button>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col items-center">
            {visualizarGuia && selectedImpostoGuia ? (
              <div className="w-full max-w-xl bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xl overflow-hidden font-sans p-6 space-y-5 animate-in zoom-in-95 duration-200">
                {/* Header Guia */}
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
                  <div className="leading-tight">
                    <span className="text-[13px] font-black text-slate-900 tracking-tight uppercase">Ministério da Fazenda</span>
                    <p className="text-[8px] text-slate-500 font-bold tracking-wide">Secretaria da Receita Federal do Brasil</p>
                  </div>
                  <div className="text-right border border-slate-900 px-3 py-1 font-mono font-black text-sm">
                    {selectedImpostoGuia.sigla}
                  </div>
                </div>

                {/* Grid Fields */}
                <div className="grid grid-cols-2 gap-px bg-slate-900 border border-slate-900 text-[9px]">
                  <div className="bg-white p-2">
                    <span className="block font-bold text-slate-500 uppercase text-[7px]">01. Nome da Empresa / Contribuinte</span>
                    <span className="font-bold text-slate-800 text-[10px]">ERP PRO S.A.</span>
                  </div>
                  <div className="bg-white p-2">
                    <span className="block font-bold text-slate-500 uppercase text-[7px]">02. Período de Apuração</span>
                    <span className="font-bold text-slate-800 text-[10px]">{selectedImpostoGuia.periodoRef}</span>
                  </div>
                  <div className="bg-white p-2">
                    <span className="block font-bold text-slate-500 uppercase text-[7px]">03. CNPJ do Contribuinte</span>
                    <span className="font-bold text-slate-800 text-[10px] font-mono">12.345.678/0001-90</span>
                  </div>
                  <div className="bg-white p-2">
                    <span className="block font-bold text-slate-500 uppercase text-[7px]">04. Código da Receita</span>
                    <span className="font-bold text-slate-800 text-[10px] font-mono">{selectedImpostoGuia.codigoReceita}</span>
                  </div>
                  <div className="bg-white p-2">
                    <span className="block font-bold text-slate-500 uppercase text-[7px]">05. Data de Vencimento</span>
                    <span className="font-bold text-slate-800 text-[10px] font-mono">{formatDate(selectedImpostoGuia.vencimento)}</span>
                  </div>
                  <div className="bg-white p-2">
                    <span className="block font-bold text-slate-500 uppercase text-[7px]">06. Valor Principal</span>
                    <span className="font-bold text-slate-800 text-[10px] font-mono">{formatCurrency(selectedImpostoGuia.valor)}</span>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-between items-center bg-slate-100 border border-slate-300 p-3 rounded-lg">
                  <div className="text-[10px] leading-tight font-semibold text-slate-600">
                    <div>* Guia Oficial de Arrecadação Fiscal.</div>
                    <div>Integrado à Receita Federal via WebService Sefaz.</div>
                  </div>
                  <div className="text-right leading-none">
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Valor Total a Recolher</span>
                    <p className="text-lg font-black text-slate-900 font-mono mt-1">{formatCurrency(selectedImpostoGuia.valor)}</p>
                  </div>
                </div>

                {/* Barcode Mockup */}
                <div className="border-t border-dashed border-slate-300 pt-5 flex flex-col items-center gap-2">
                  <div className="w-full max-w-xs flex gap-0.5 justify-center py-2 select-none opacity-85">
                    {/* Simulated bars using thin vertical lines */}
                    {Array.from({ length: 42 }).map((_, idx) => {
                      const width = idx % 3 === 0 ? "w-1" : idx % 5 === 0 ? "w-[3px]" : "w-[1.5px]";
                      const bg = idx % 4 === 0 && idx > 5 && idx < 35 ? "bg-transparent" : "bg-slate-950";
                      return <div key={idx} className={`h-8 ${width} ${bg}`} />;
                    })}
                  </div>
                  <span className="font-mono text-[9px] text-slate-500 select-all tracking-widest text-center">
                    85640000004-3 52300000010-8 00000000000-0 {selectedImpostoGuia.id.replace("IMP-", "8821")}
                  </span>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="h-8 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Printer className="h-3.5 w-3.5 mr-1" /> Imprimir Guia
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => alert("Download simulado do arquivo PDF da Guia Fiscal concluído.")}
                    className="h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Baixar PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-xl p-8 bg-card w-full max-w-xl text-center flex flex-col items-center justify-center min-h-[300px] text-muted-foreground space-y-2.5">
                <Printer className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-xs font-semibold max-w-[280px] leading-relaxed">
                  Selecione um tributo no menu lateral e clique em "Gerar Guia Oficial" para visualizar e emitir a guia com código de barras.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* relatorios content */}
      {subAba === "relatorios" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest border-b border-border pb-2.5">Indicadores do Trimestre</h3>
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Tributos pagos (DAS)</span>
                  <span className="font-extrabold text-foreground">{formatCurrency(8143.00)}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Tributos trabalhistas (INSS)</span>
                  <span className="font-extrabold text-foreground">{formatCurrency(4430.00)}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Imposto de Renda (IRPJ)</span>
                  <span className="font-extrabold text-foreground">{formatCurrency(12450.00)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-foreground font-bold">Total Acumulado Pago</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(25023.00)}</span>
                </div>
              </div>
            </div>

            {/* Distribution Graph Simulation */}
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">Distribuição do Custo Tributário</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Representação proporcional dos tributos pagos em 2026</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground/80">
                    <span>Impostos Estaduais/Simplificados (DAS)</span>
                    <span>32.5%</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "32.5%" }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground/80">
                    <span>Impostos sobre o Lucro (DARF IRPJ/CSLL)</span>
                    <span>49.8%</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-2.5 overflow-hidden">
                    <div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style={{ width: "49.8%" }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground/80">
                    <span>Contribuições Trabalhistas (GPS/FGTS)</span>
                    <span>17.7%</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-2.5 overflow-hidden">
                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: "17.7%" }} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-3 text-[10px] text-muted-foreground leading-normal mt-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>Dados fiscais e DRE integrados sob auditoria da contabilidade interna.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
