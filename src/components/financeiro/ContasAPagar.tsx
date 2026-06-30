"use client";

import React, { useState, useMemo } from "react";
import { useFinanceiro, Lancamento } from "@/hooks/useFinanceiro";
import { useFornecedores } from "@/hooks/useFornecedores";
import { Search, Plus, Calendar, Coins, ArrowRight, User, Trash2, CheckCircle2, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ContasAPagar() {
  const { todosLancamentos, adicionarLancamento, quitarLancamento } = useFinanceiro();
  const { fornecedores } = useFornecedores();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);

  // Form Fields
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [categoria, setCategoria] = useState("Insumos");
  const [contraparte, setContraparte] = useState(""); // fornecedor

  const fornecedoresAtivos = useMemo(() => {
    if (!fornecedores) return [];
    return fornecedores.filter(f => f.status === "ativo").map(f => f.nome);
  }, [fornecedores]);

  // Filter pagar lancamentos
  const contasPagar = useMemo(() => {
    return todosLancamentos.filter(l => l.tipo === "pagar");
  }, [todosLancamentos]);

  // Filtered list based on search and status
  const filteredContas = useMemo(() => {
    return contasPagar.filter(c => {
      const matchBusca =
        c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        c.contraparte.toLowerCase().includes(busca.toLowerCase()) ||
        c.categoria.toLowerCase().includes(busca.toLowerCase());
      
      const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
      
      return matchBusca && matchStatus;
    });
  }, [contasPagar, busca, filtroStatus]);

  // Metrics
  const metricas = useMemo(() => {
    const pendentes = contasPagar.filter(c => c.status === "pendente").reduce((acc, c) => acc + c.valor, 0);
    const pagas = contasPagar.filter(c => c.status === "pago").reduce((acc, c) => acc + c.valor, 0);
    const vencidas = contasPagar.filter(c => c.status === "vencido").reduce((acc, c) => acc + c.valor, 0);
    return { pendentes, pagas, vencidas, total: pendentes + pagas + vencidas };
  }, [contasPagar]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !contraparte.trim() || !valor || !vencimento) return;

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) return;

    // Determina status inicial baseado no vencimento
    const dataVenc = new Date(vencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const statusInicial = dataVenc.getTime() < hoje.getTime() ? "vencido" : "pendente";

    adicionarLancamento({
      descricao: descricao.trim(),
      tipo: "pagar",
      valor: valorNum,
      vencimento,
      status: statusInicial,
      categoria,
      contraparte: contraparte.trim()
    });

    // Reset Form
    setDescricao("");
    setValor("");
    setVencimento("");
    setCategoria("Insumos");
    setContraparte("");
    setModalOpen(false);
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
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">A Pagar (Em Aberto)</span>
          <div className="flex items-baseline gap-2 mt-2 text-amber-500 font-bold">
            <span className="text-2xl font-bold">{formatCurrency(metricas.pendentes)}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Pago (Liquido)</span>
          <div className="flex items-baseline gap-2 mt-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="text-2xl font-bold">{formatCurrency(metricas.pagas)}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Contas Vencidas</span>
          <div className="flex items-baseline gap-2 mt-2 text-destructive font-bold">
            <span className="text-2xl font-bold">{formatCurrency(metricas.vencidas)}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Volume Total de Obrigações</span>
          <div className="flex items-baseline gap-2 mt-2 text-foreground font-bold">
            <span className="text-2xl font-bold">{formatCurrency(metricas.total)}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por descrição, fornecedor ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 h-9 text-xs bg-card"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-card border border-border rounded-md px-3 h-9 text-xs font-semibold focus:outline-none text-foreground cursor-pointer"
          >
            <option value="todos">Todos Status</option>
            <option value="pendente">A Pagar</option>
            <option value="pago">Pagas</option>
            <option value="vencido">Vencidas</option>
          </select>
        </div>

        <Button onClick={() => setModalOpen(true)} className="gap-1.5 h-9 text-xs font-semibold">
          <Plus className="h-4 w-4" /> Registrar Conta a Pagar
        </Button>
      </div>

      {/* Table Card */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-muted-foreground font-bold uppercase tracking-wider">
                <th className="p-4 text-center">Código</th>
                <th className="p-4 text-left">Descrição da Despesa</th>
                <th className="p-4 text-left">Fornecedor (Contraparte)</th>
                <th className="p-4 text-center">Vencimento</th>
                <th className="p-4 text-left">Categoria</th>
                <th className="p-4 text-center">Valor</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredContas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground font-semibold">
                    Nenhuma obrigação de pagamento pendente ou registrada.
                  </td>
                </tr>
              ) : (
                filteredContas.map((c) => {
                  const isPendente = c.status === "pendente";
                  const isVencida = c.status === "vencido";
                  return (
                    <tr key={c.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-muted-foreground text-center">{c.id}</td>
                      <td className="p-4 font-bold text-foreground text-left">{c.descricao}</td>
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground/80">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.contraparte}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className={cn(isVencida ? "text-destructive font-bold" : "text-muted-foreground")}>
                            {formatDate(c.vencimento)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-semibold text-left">{c.categoria}</td>
                      <td className="p-4 font-bold text-foreground text-right">{formatCurrency(c.valor)}</td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase whitespace-nowrap",
                          c.status === "pago"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : c.status === "vencido"
                            ? "bg-destructive/10 text-destructive border border-destructive/20 animate-pulse"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20"
                        )}>
                          {c.status === "pago" ? "pago" : c.status === "vencido" ? "vencido" : "a pagar"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {c.status !== "pago" ? (
                          <Button
                            size="xs"
                            onClick={() => quitarLancamento(c.id)}
                            className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                          >
                            Baixar / Pagar
                          </Button>
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground/80 italic flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Liquidada
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Registrar Conta a Pagar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4 bg-accent/5">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Registrar Conta a Pagar (Despesa)
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground text-sm font-semibold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Descrição da Despesa</label>
                <Input
                  required
                  placeholder="Ex: Compra de Bobinas de Aço"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Fornecedor / Credor</label>
                <Input
                  required
                  placeholder="Ex: Gerdau S.A. ou TechDistrib"
                  value={contraparte}
                  onChange={(e) => setContraparte(e.target.value)}
                  list="financeiro-fornecedores-sugestoes"
                  className="h-9 text-xs"
                />
                <datalist id="financeiro-fornecedores-sugestoes">
                  {fornecedoresAtivos.map(nome => (
                    <option key={nome} value={nome} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Valor da Fatura (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Vencimento</label>
                  <Input
                    type="date"
                    required
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                    className="h-9 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer font-semibold"
                >
                  <option value="Insumos">Insumos / Produção</option>
                  <option value="Infraestrutura">Infraestrutura / Aluguel</option>
                  <option value="Pessoal">Pessoal / Salários</option>
                  <option value="Marketing">Marketing / Vendas</option>
                  <option value="TI e Licenças">TI e Licenças de Software</option>
                  <option value="Impostos">Tributos / Taxas</option>
                </select>
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="h-9 text-xs font-semibold">Cancelar</Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold bg-destructive hover:bg-destructive/95 text-white">Registrar Lançamento</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
