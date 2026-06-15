"use client";

import React, { useState } from "react";
import { useBancos } from "@/hooks/useBancos";
import { useBoletos, Boleto } from "@/hooks/useBoletos";
import { useCobrancas } from "@/hooks/useCobrancas";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import {
  Building2,
  RefreshCw,
  Plus,
  Trash2,
  Link2,
  ArrowUpRight,
  ArrowDownLeft,
  Barcode,
  Printer,
  CheckCircle,
  AlertTriangle,
  Mail,
  MessageSquare,
  Send,
  History,
  X,
  CheckSquare,
  Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function IntegracoesFinanceiras() {
  const { conexoes, errorBancos, limparErroBancos, adicionarConexao, removerConexao, sincronizarConexao } = useBancos();
  const { boletos, errorBoletos, limparErroBoletos, gerarBoleto, cancelarBoleto, liquidarBoleto } = useBoletos();
  const { cobrancas, enviarCobranca } = useCobrancas();
  const { lancamentos } = useFinanceiro();

  const [subAba, setSubAba] = useState<"bancos" | "boletos" | "cobrancas">("bancos");

  const [bancoNome, setBancoNome] = useState("");
  const [agencia, setAgencia] = useState("");
  const [contaNumero, setContaNumero] = useState("");
  const [modalBancoOpen, setModalBancoOpen] = useState(false);
  const [addBancoError, setAddBancoError] = useState<string | null>(null);

  const [selectedBoletoPrint, setSelectedBoletoPrint] = useState<Boleto | null>(null);

  const [cobrancaBoletoId, setCobrancaBoletoId] = useState("");
  const [cobrancaCanal, setCobrancaCanal] = useState<"email" | "whatsapp" | "sms">("email");
  const [successCobranca, setSuccessCobranca] = useState<string | null>(null);
  const [formCobrancaError, setFormCobrancaError] = useState<string | null>(null);

  const handleAddBanco = (e: React.FormEvent) => {
    e.preventDefault();
    setAddBancoError(null);

    if (!bancoNome || !agencia || !contaNumero) {
      setAddBancoError("Todos os campos de agência, conta e banco são obrigatórios.");
      return;
    }

    const sucesso = adicionarConexao({ bancoNome, agencia, contaNumero });
    if (sucesso) {
      setBancoNome("");
      setAgencia("");
      setContaNumero("");
      setModalBancoOpen(false);
    }
  };

  const handleGerarBoleto = (lancId: string, cliente: string, valor: number) => {
    gerarBoleto({ lancamentoId: lancId, clienteNome: cliente, valor });
  };

  const handleDispararCobranca = (e: React.FormEvent) => {
    e.preventDefault();
    setFormCobrancaError(null);
    setSuccessCobranca(null);

    if (!cobrancaBoletoId) {
      setFormCobrancaError("Selecione um boleto para emitir a cobrança.");
      return;
    }

    const targetBoleto = boletos.find((b) => b.id === cobrancaBoletoId);
    if (!targetBoleto) {
      setFormCobrancaError("Boleto inválido.");
      return;
    }

    const isVencido = targetBoleto.status === "vencido";
    const sucesso = enviarCobranca({
      clienteNome: targetBoleto.clienteNome,
      documentoBoletoId: targetBoleto.id,
      dataVencimento: targetBoleto.dataVencimento,
      canalEnvio: cobrancaCanal,
      valor: targetBoleto.valor,
      isVencido
    });

    if (sucesso) {
      setSuccessCobranca(`Notificação enviada com sucesso via ${cobrancaCanal.toUpperCase()}!`);
      setCobrancaBoletoId("");
      setTimeout(() => setSuccessCobranca(null), 3000);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border bg-accent/25 rounded-t-xl p-1 gap-1 w-fit">
        <button
          onClick={() => setSubAba("bancos")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            subAba === "bancos"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-3.5 w-3.5 inline mr-1.5" />
          Instituições Bancárias
        </button>
        <button
          onClick={() => setSubAba("boletos")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            subAba === "boletos"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Barcode className="h-3.5 w-3.5 inline mr-1.5" />
          Emissão de Boletos
        </button>
        <button
          onClick={() => setSubAba("cobrancas")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            subAba === "cobrancas"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="h-3.5 w-3.5 inline mr-1.5" />
          Automação de Cobranças
        </button>
      </div>

      {subAba === "bancos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Contas Bancárias Integradas</h3>
              <p className="text-xs text-muted-foreground">Sincronize extratos bancários e verifique saldos consolidados</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => { setAddBancoError(null); setModalBancoOpen(true); }}>
              <Plus className="h-4 w-4" />
              <span>Conectar Conta</span>
            </Button>
          </div>

          {errorBancos && (
            <div className="flex items-center justify-between text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {errorBancos}
              </span>
              <button onClick={limparErroBancos} className="text-destructive hover:opacity-80">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conexoes.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{c.bancoNome}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono">Ag: {c.agencia} | Cc: {c.contaNumero}</p>
                      </div>
                    </div>
                    {c.statusConexao === "ativa" ? (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                        Ativa
                      </Badge>
                    ) : c.statusConexao === "sincronizando" ? (
                      <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 gap-1 animate-pulse">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Sincronizando
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10">
                        Inativa
                      </Badge>
                    )}
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Saldo Disponível</span>
                    <p className="text-xl font-bold tracking-tight text-foreground">{formatCurrency(c.saldo)}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[9px] text-muted-foreground">
                    {c.dataSincronizacao
                      ? `Sinc: ${formatDateTime(c.dataSincronizacao)}`
                      : "Sem sincronização"}
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => sincronizarConexao(c.id)}
                      disabled={c.statusConexao === "sincronizando"}
                      className="h-7 text-[10px] font-bold"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${c.statusConexao === "sincronizando" ? "animate-spin" : ""}`} />
                      Sincronizar
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => removerConexao(c.id)}
                      className="text-muted-foreground hover:text-destructive h-7 w-7"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-accent/5">
              <h4 className="font-semibold text-sm">Últimos Lançamentos Reconciliados</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[10px] text-muted-foreground uppercase font-bold">
                    <th className="px-4 py-2.5 text-left">Identificador</th>
                    <th className="px-4 py-2.5 text-left">Banco de Origem</th>
                    <th className="px-4 py-2.5 text-left">Descrição da Transação</th>
                    <th className="px-4 py-2.5 text-left">Data</th>
                    <th className="px-4 py-2.5 text-left">Tipo</th>
                    <th className="px-4 py-2.5 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {conexoes.every((c) => c.transacoes.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhuma transação sincronizada ainda. Clique em &quot;Sincronizar&quot; em uma conta ativa.
                      </td>
                    </tr>
                  ) : (
                    conexoes.flatMap((c) =>
                      c.transacoes.map((t) => (
                        <tr key={t.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-muted-foreground">{t.id}</td>
                          <td className="px-4 py-2.5 font-medium">{c.bancoNome}</td>
                          <td className="px-4 py-2.5 font-medium">{t.descricao}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{formatDateTime(t.data)}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1 font-bold ${
                              t.tipo === "credito" ? "text-emerald-600" : "text-red-600"
                            }`}>
                              {t.tipo === "credito" ? (
                                <>
                                  <ArrowUpRight className="h-3 w-3" />
                                  Crédito
                                </>
                              ) : (
                                <>
                                  <ArrowDownLeft className="h-3 w-3" />
                                  Débito
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold tracking-tight">
                            {formatCurrency(t.valor)}
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subAba === "boletos" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border bg-accent/5">
                <h4 className="font-semibold text-sm">Contas a Receber Sem Boleto Emitido</h4>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase text-[10px]">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Cliente</th>
                      <th className="p-2.5">Descrição</th>
                      <th className="p-2.5">Vencimento</th>
                      <th className="p-2.5 text-right">Valor</th>
                      <th className="p-2.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lancamentos
                      .filter((l) => l.tipo === "receber" && l.status === "pendente")
                      .filter((l) => !boletos.some((b) => b.lancamentoId === l.id && b.status !== "cancelado"))
                      .length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                          Todas as faturas a receber já possuem boletos gerados.
                        </td>
                      </tr>
                    ) : (
                      lancamentos
                        .filter((l) => l.tipo === "receber" && l.status === "pendente")
                        .filter((l) => !boletos.some((b) => b.lancamentoId === l.id && b.status !== "cancelado"))
                        .map((l) => (
                          <tr key={l.id} className="hover:bg-accent/20">
                            <td className="p-2.5 font-mono text-muted-foreground">{l.id}</td>
                            <td className="p-2.5 font-bold">{l.contraparte}</td>
                            <td className="p-2.5 text-muted-foreground">{l.descricao}</td>
                            <td className="p-2.5">{formatDate(l.vencimento)}</td>
                            <td className="p-2.5 text-right font-bold">{formatCurrency(l.valor)}</td>
                            <td className="p-2.5 text-right">
                              <Button
                                size="xs"
                                onClick={() => handleGerarBoleto(l.id, l.contraparte, l.valor)}
                                className="h-7 text-[10px] font-bold"
                              >
                                <Barcode className="h-3 w-3 mr-1" />
                                Gerar Boleto
                              </Button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h4 className="font-semibold text-sm">Resumo de Cobranças por Boleto</h4>
              <div className="divide-y divide-border text-xs space-y-3">
                <div className="flex justify-between py-2 pt-0">
                  <span className="text-muted-foreground">Boletos Pendentes</span>
                  <span className="font-bold text-foreground">{boletos.filter((b) => b.status === "pendente").length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Boletos Liquidados</span>
                  <span className="font-bold text-emerald-600">{boletos.filter((b) => b.status === "pago").length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Boletos Vencidos</span>
                  <span className="font-bold text-amber-600">{boletos.filter((b) => b.status === "vencido").length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Boletos Cancelados</span>
                  <span className="font-bold text-destructive">{boletos.filter((b) => b.status === "cancelado").length}</span>
                </div>
              </div>
            </div>
          </div>

          {errorBoletos && (
            <div className="flex items-center justify-between text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {errorBoletos}
              </span>
              <button onClick={limparErroBoletos} className="text-destructive hover:opacity-80">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-accent/5">
              <h4 className="font-semibold text-sm">Boletos Bancários Registrados</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[10px] text-muted-foreground uppercase font-bold">
                    <th className="px-4 py-3 text-left">Boleto ID</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Código de Barras</th>
                    <th className="px-4 py-3 text-left">Vencimento</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {boletos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum boleto bancário emitido no sistema.
                      </td>
                    </tr>
                  ) : (
                    boletos.map((b) => (
                      <tr key={b.id} className="hover:bg-accent/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold">{b.id}</td>
                        <td className="px-4 py-3 font-bold">{b.clienteNome}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground tracking-tighter select-all">
                          {b.codigoBarras}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(b.dataVencimento)}</td>
                        <td className="px-4 py-3 text-right font-extrabold">{formatCurrency(b.valor)}</td>
                        <td className="px-4 py-3 text-center">
                          {b.status === "pago" ? (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                              Liquidado
                            </Badge>
                          ) : b.status === "vencido" ? (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                              Vencido
                            </Badge>
                          ) : b.status === "cancelado" ? (
                            <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10">
                              Cancelado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10">
                              Pendente
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              onClick={() => setSelectedBoletoPrint(b)}
                              title="Visualizar / Imprimir Boleto"
                            >
                              <Printer className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            {b.status === "pendente" && (
                              <>
                                <Button
                                  size="icon-xs"
                                  variant="ghost"
                                  onClick={() => liquidarBoleto(b.id)}
                                  className="text-emerald-500 hover:bg-emerald-50"
                                  title="Liquidar Boleto"
                                >
                                  <CheckSquare className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon-xs"
                                  variant="ghost"
                                  onClick={() => cancelarBoleto(b.id)}
                                  className="text-destructive hover:bg-destructive/10"
                                  title="Cancelar Boleto"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subAba === "cobrancas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm h-fit">
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                <Send className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-sm">Disparar Lembrete Manual</h4>
              </div>

              {successCobranca && (
                <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{successCobranca}</span>
                </div>
              )}

              {formCobrancaError && (
                <div className="mb-4 p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{formCobrancaError}</span>
                </div>
              )}

              <form onSubmit={handleDispararCobranca} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Selecione o Boleto</label>
                  <select
                    value={cobrancaBoletoId}
                    onChange={(e) => setCobrancaBoletoId(e.target.value)}
                    className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="">Escolher boleto ativo...</option>
                    {boletos
                      .filter((b) => b.status === "pendente" || b.status === "vencido")
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.id} - {b.clienteNome} ({formatCurrency(b.valor)})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Canal de Notificação</label>
                  <div className="flex gap-2">
                    {(["email", "whatsapp", "sms"] as const).map((canal) => (
                      <button
                        key={canal}
                        type="button"
                        onClick={() => setCobrancaCanal(canal)}
                        className={`flex-1 text-xs font-semibold py-2 rounded-md border transition-all duration-150 ${
                          cobrancaCanal === canal
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "border-border text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {canal === "email" ? (
                          <Mail className="h-3 w-3 inline mr-1" />
                        ) : canal === "whatsapp" ? (
                          <MessageSquare className="h-3 w-3 inline mr-1" />
                        ) : (
                          <Send className="h-3 w-3 inline mr-1" />
                        )}
                        {canal.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full h-8 text-xs font-semibold gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Disparar Notificação
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border bg-accent/5 flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Histórico de Cobranças e Lembretes Enviados</h4>
              </div>
              <div className="p-4 overflow-y-auto max-h-[300px] space-y-3">
                {cobrancas.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Nenhum lembrete de cobrança disparado ainda.
                  </div>
                ) : (
                  cobrancas.map((cob) => (
                    <div key={cob.id} className="p-3.5 rounded-xl border border-border bg-accent/10 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-muted-foreground font-bold">{cob.id} | Ref: {cob.documentoBoletoId}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 bg-background">
                            {cob.canalEnvio}
                          </Badge>
                          <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5 text-[9px] font-bold py-0">
                            {cob.statusNotificacao}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-foreground font-medium italic">&quot;{cob.mensagem}&quot;</p>
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/40 pt-1.5 mt-0.5">
                        <span>Cliente: <strong>{cob.clienteNome}</strong></span>
                        <span>Enviado: {cob.dataEnvio ? formatDateTime(cob.dataEnvio) : ""}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedBoletoPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white text-slate-900 border border-slate-300 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 font-sans p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight flex items-center gap-1.5">
                <Barcode className="h-5 w-5 text-slate-700" />
                Visualização do Boleto Bancário Fictício
              </h3>
              <button
                onClick={() => setSelectedBoletoPrint(null)}
                className="text-slate-500 hover:text-slate-900 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-400 p-4 space-y-4 rounded-md bg-slate-50 text-[10px] leading-snug">
              <div className="flex border-b border-slate-400 pb-2">
                <div className="w-1/4 font-extrabold text-sm border-r border-slate-400 pr-2">ERP Bank</div>
                <div className="w-12 font-bold text-center border-r border-slate-400 pr-2">341-9</div>
                <div className="flex-1 font-mono font-bold text-right pl-2 tracking-tighter text-[11px]">{selectedBoletoPrint.codigoBarras}</div>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-400 pb-1.5 gap-2">
                <div className="col-span-3">
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Local de Pagamento</span>
                  <span className="font-semibold">QUALQUER BANCO ATÉ O VENCIMENTO</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Vencimento</span>
                  <span className="font-extrabold">{formatDate(selectedBoletoPrint.dataVencimento)}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-400 pb-1.5 gap-2">
                <div className="col-span-3">
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Beneficiário</span>
                  <span className="font-semibold">ERP PRO S.A. | CNPJ: 12.345.678/0001-90</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Agência/Código Beneficiário</span>
                  <span className="font-semibold">0001 / 98765-4</span>
                </div>
              </div>

              <div className="grid grid-cols-4 border-b border-slate-400 pb-1.5 gap-2">
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Data do Documento</span>
                  <span className="font-semibold">{formatDate(selectedBoletoPrint.dataGeracao)}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Número Documento</span>
                  <span className="font-semibold">{selectedBoletoPrint.id}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-500">Espécie Doc</span>
                  <span className="font-semibold">DM</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-500">(=) Valor do Documento</span>
                  <span className="font-extrabold text-sm">{formatCurrency(selectedBoletoPrint.valor)}</span>
                </div>
              </div>

              <div className="border-b border-slate-400 pb-1.5">
                <span className="block text-[8px] uppercase font-bold text-slate-500">Instruções</span>
                <span className="font-medium text-slate-600 block">NÃO RECEBER APÓS 30 DIAS DE VENCIDO.</span>
                <span className="font-medium text-slate-600 block">ISENTO DE MULTAS E JUROS POR SE TRATAR DE SIMULAÇÃO DE SISTEMA ERP.</span>
              </div>

              <div>
                <span className="block text-[8px] uppercase font-bold text-slate-500">Pagador (Sacado)</span>
                <span className="font-bold block">{selectedBoletoPrint.clienteNome}</span>
                <span className="text-slate-600 block">Endereço Fictício Sacado - Centro, CEP: 00000-000</span>
              </div>

              <div className="pt-4 border-t border-dashed border-slate-400 flex flex-col items-center gap-1">
                <div className="h-10 bg-slate-900 w-11/12 flex items-center justify-between px-6 font-mono text-[7px] text-white tracking-widest select-none select-none opacity-85">
                  |||||| || | || ||||| | || |||| ||| |||| | ||||| || ||| || ||| || ||| || ||| || ||| || ||| || ||| || ||| || ||
                </div>
                <span className="text-[8px] font-mono text-slate-400">Linha Digitável: {selectedBoletoPrint.codigoBarras}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-300 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBoletoPrint(null)}
                className="border-slate-400 text-slate-700 hover:bg-slate-100"
              >
                Fechar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white"
              >
                Imprimir Boleto
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalBancoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Conectar Conta Bancária
              </h3>
              <button
                type="button"
                onClick={() => setModalBancoOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddBanco} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Selecione a Instituição Bancária
                </label>
                <select
                  value={bancoNome}
                  onChange={(e) => setBancoNome(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm cursor-pointer"
                >
                  <option value="">Escolher banco...</option>
                  <option value="Banco do Brasil">Banco do Brasil S.A. (001)</option>
                  <option value="Itaú Unibanco">Itaú Unibanco S.A. (341)</option>
                  <option value="Bradesco">Banco Bradesco S.A. (237)</option>
                  <option value="Santander">Banco Santander Brasil S.A. (033)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Agência</label>
                  <Input
                    type="text"
                    placeholder="Ex: 0001"
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Número da Conta</label>
                  <Input
                    type="text"
                    placeholder="Ex: 12345-6"
                    value={contaNumero}
                    onChange={(e) => setContaNumero(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {addBancoError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {addBancoError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalBancoOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <Link2 className="h-4 w-4" />
                  Autorizar Conexão
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
