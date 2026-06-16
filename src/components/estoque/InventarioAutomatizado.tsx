"use client";

import React, { useState } from "react";
import { useInventario, SessaoInventario } from "@/hooks/useInventario";
import { useEstoque } from "@/hooks/useEstoque";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClipboardCheck,
  Plus,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InventarioAutomatizado() {
  const { user } = useAuth();
  const { estoque } = useEstoque();
  const {
    sessoes,
    historicoAjustes,
    error,
    setError,
    criarSessao,
    salvarContagem,
    finalizarConciliacao,
  } = useInventario();

  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState("");
  const [contagemInput, setContagemInput] = useState<Record<string, string>>({});
  const [sessaoAtivaId, setSessaoAtivaId] = useState<string | null>(null);

  const activeSessoes = sessoes.filter((s) => s.status === "pendente");
  const completedSessoes = sessoes.filter((s) => s.status === "concluido");

  const temPermissaoReconciliar =
    user.permissions.gerenciarEstoque || user.permissions.movimentarEstoque;

  const handleCriarSessao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoSelecionadoId) {
      setError("Por favor, selecione um produto.");
      return;
    }
    const novaSessao = criarSessao(produtoSelecionadoId);
    if (novaSessao) {
      setProdutoSelecionadoId("");
      setSessaoAtivaId(novaSessao.id);
    }
  };

  const handleSalvarContagem = (id: string) => {
    const val = contagemInput[id];
    if (val === undefined || val.trim() === "") {
      setError("Informe um valor numérico para a contagem.");
      return;
    }
    const count = parseInt(val, 10);
    if (isNaN(count) || count < 0) {
      setError("A quantidade contada deve ser maior ou igual a zero.");
      return;
    }
    const success = salvarContagem(id, count);
    if (success) {
      setError(null);
    }
  };

  const handleFinalizar = (id: string) => {
    const success = finalizarConciliacao(id);
    if (success) {
      setSessaoAtivaId(null);
      // Limpa input da contagem
      setContagemInput((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de Erro */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive animate-in fade-in duration-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:opacity-80 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Banner de aviso sobre permissão */}
      {!temPermissaoReconciliar && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            <strong>Acesso de Conciliação Restrito:</strong> Seu perfil atual permite visualizar contagens, mas a efetivação física dos saldos em estoque exige perfil de Administrador ou Gerente.
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel Esquerdo: Abertura e Contagem */}
        <div className="lg:col-span-1 space-y-6">
          {/* Abertura de Sessão */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <ClipboardCheck className="h-4.5 w-4.5 text-primary" />
              Nova Sessão de Contagem
            </h4>
            <form onSubmit={handleCriarSessao} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">
                  Produto do Catálogo
                </label>
                <select
                  value={produtoSelecionadoId}
                  onChange={(e) => setProdutoSelecionadoId(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  <option value="">Selecione um produto...</option>
                  {estoque.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nome} (Saldo atual: {prod.quantidade} un. - SKU: {prod.sku})
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full h-8 text-xs font-semibold gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Iniciar Inventário
              </Button>
            </form>
          </div>

          {/* Inventários Pendentes em Andamento */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
              Contagens Pendentes ({activeSessoes.length})
            </h4>
            {activeSessoes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhuma contagem pendente de preenchimento.
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {activeSessoes.map((sessao) => {
                  const valorInput = contagemInput[sessao.id] || "";
                  const inputNum = parseInt(valorInput, 10);
                  const ajustadoCalculado = !isNaN(inputNum)
                    ? inputNum - sessao.quantidadeAtual
                    : sessao.quantidadeAjustada;

                  return (
                    <div
                      key={sessao.id}
                      onClick={() => setSessaoAtivaId(sessao.id)}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md space-y-3",
                        sessaoAtivaId === sessao.id
                          ? "border-primary bg-primary/[0.01] shadow-sm"
                          : "border-border bg-card"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground">
                          {sessao.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-500">
                          {sessao.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-foreground truncate">
                          {sessao.produtoNome}
                        </h5>
                        <p className="text-[10px] text-muted-foreground">
                          Saldo do ERP: <span className="font-bold">{sessao.quantidadeAtual} un.</span>
                        </p>
                      </div>

                      {/* Input de Contagem Física */}
                      <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase">
                            Qtd Contada
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Contagem física"
                            value={valorInput}
                            onChange={(e) => {
                              setError(null);
                              setContagemInput((prev) => ({
                                ...prev,
                                [sessao.id]: e.target.value,
                              }));
                            }}
                            className="h-8 text-xs bg-accent/40"
                          />
                        </div>
                        <div className="self-end pb-0.5">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSalvarContagem(sessao.id);
                            }}
                            className="h-8 px-2 text-[10px] font-bold"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>

                      {/* Display do Ajuste Calculado */}
                      {ajustadoCalculado !== null && (
                        <div className="flex items-center justify-between text-[11px] font-semibold bg-accent/30 p-2 rounded-lg">
                          <span>Ajuste Projetado:</span>
                          <span
                            className={cn(
                              ajustadoCalculado === 0
                                ? "text-muted-foreground"
                                : ajustadoCalculado > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                            )}
                          >
                            {ajustadoCalculado > 0 ? "+" : ""}
                            {ajustadoCalculado} un.
                          </span>
                        </div>
                      )}

                      {/* Botão de Finalizar */}
                      <Button
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFinalizar(sessao.id);
                        }}
                        disabled={sessao.quantidadeContada === null}
                        className="w-full h-8 text-[10px] font-bold shadow-sm"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Finalizar Conciliação
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Painel Central e Direito: Relatório de Concluídas e Histórico Imutável */}
        <div className="lg:col-span-2 space-y-6">
          {/* Relatório Conclusivo de Inventários Fechados */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="font-bold text-base tracking-tight flex items-center gap-2 border-b border-border pb-3">
              <FileText className="h-5 w-5 text-primary" />
              Sessões Reconciliadas e Finalizadas
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                    <th className="p-3">Código</th>
                    <th className="p-3">Produto</th>
                    <th className="p-3 text-right">Qtd Anterior</th>
                    <th className="p-3 text-right">Contada</th>
                    <th className="p-3 text-right">Ajuste</th>
                    <th className="p-3">Executor</th>
                    <th className="p-3">Conclusão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {completedSessoes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">
                        Nenhum inventário finalizado nesta sessão.
                      </td>
                    </tr>
                  ) : (
                    completedSessoes.map((s) => (
                      <tr key={s.id} className="hover:bg-accent/5 transition-colors">
                        <td className="p-3 font-mono font-bold text-primary">{s.id}</td>
                        <td className="p-3">
                          <span className="font-semibold block">{s.produtoNome}</span>
                          <span className="text-[9px] text-muted-foreground font-mono">ID: {s.produtoId}</span>
                        </td>
                        <td className="p-3 text-right font-medium">{s.quantidadeAtual} un.</td>
                        <td className="p-3 text-right font-extrabold">{s.quantidadeContada} un.</td>
                        <td className="p-3 text-right font-extrabold">
                          <span
                            className={cn(
                              s.quantidadeAjustada === 0
                                ? "text-muted-foreground"
                                : (s.quantidadeAjustada || 0) > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                            )}
                          >
                            {(s.quantidadeAjustada || 0) > 0 ? "+" : ""}
                            {s.quantidadeAjustada}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground font-medium flex items-center gap-1">
                          <User className="h-3 w-3 shrink-0" /> {s.responsavel}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(s.dataContagem).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico de Ajustes Imutável (Audit Trail) */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
                Histórico de Ajustes de Saldo (Auditoria Imutável)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trilha imutável contendo as alterações físicas aplicadas ao saldo de estoque do ERP.
              </p>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {historicoAjustes.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                  Nenhuma trilha de auditoria gravada até o momento.
                </div>
              ) : (
                historicoAjustes.map((ajust) => (
                  <div
                    key={ajust.id}
                    className="p-4 rounded-xl border border-border/70 bg-accent/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {ajust.id}
                        </span>
                        <span className="text-[10px] bg-accent border border-border/80 px-2 py-0.5 rounded text-muted-foreground font-mono">
                          Ref: {ajust.inventarioId}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground">{ajust.produtoNome}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{" "}
                          {new Date(ajust.dataAjuste).toLocaleString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {ajust.responsavel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-center bg-card border border-border px-3 py-2 rounded-lg text-xs font-bold">
                      <div className="text-center">
                        <span className="text-[9px] text-muted-foreground uppercase block font-semibold">Anterior</span>
                        <span>{ajust.quantidadeAtual}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="text-center">
                        <span className="text-[9px] text-muted-foreground uppercase block font-semibold">Contada</span>
                        <span>{ajust.quantidadeContada}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="text-center">
                        <span className="text-[9px] text-muted-foreground uppercase block font-semibold">Ajuste</span>
                        <span
                          className={cn(
                            ajust.quantidadeAjustada === 0
                              ? "text-muted-foreground"
                              : ajust.quantidadeAjustada > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-destructive"
                          )}
                        >
                          {ajust.quantidadeAjustada > 0 ? "+" : ""}
                          {ajust.quantidadeAjustada}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
