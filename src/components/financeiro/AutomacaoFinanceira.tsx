"use client";

import React, { useState } from "react";
import { useAutomacaoFinanceira, RotinaFinanceira, CATEGORIAS_FINANCEIRAS, FREQUENCIAS_FINANCEIRAS } from "@/hooks/useAutomacaoFinanceira";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Plus,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Play,
  Lock,
  ChevronRight,
  TrendingUp,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AutomacaoFinanceira() {
  const { user } = useAuth();
  const {
    rotinas,
    historicoProcessamentos,
    error,
    setError,
    cadastrarRotina,
    editarRotina,
    executarRotina,
    removerRotina,
    verificarAcessoContador,
  } = useAutomacaoFinanceira();

  // Cadastro Fields
  const [codigoRotina, setCodigoRotina] = useState("");
  const [tipoOperacao, setTipoOperacao] = useState<RotinaFinanceira["tipoOperacao"]>("Pagamento");
  const [frequencia, setFrequencia] = useState<RotinaFinanceira["frequencia"]>("Mensal");
  const [formCadastroOpen, setFormCadastroOpen] = useState(false);

  // Edição Fields
  const [rotinaParaEditar, setRotinaParaEditar] = useState<RotinaFinanceira | null>(null);
  const [editTipo, setEditTipo] = useState<RotinaFinanceira["tipoOperacao"]>("Pagamento");
  const [editFrequencia, setEditFrequencia] = useState<RotinaFinanceira["frequencia"]>("Mensal");
  const [editStatus, setEditStatus] = useState<RotinaFinanceira["status"]>("ativa");

  const temAcesso = verificarAcessoContador();

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoRotina) {
      setError("Por favor, preencha o código da rotina.");
      return;
    }
    const sucesso = cadastrarRotina(codigoRotina, tipoOperacao, frequencia);
    if (sucesso) {
      setCodigoRotina("");
      setTipoOperacao("Pagamento");
      setFrequencia("Mensal");
      setFormCadastroOpen(false);
    }
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rotinaParaEditar) return;
    const sucesso = editarRotina(rotinaParaEditar.id, {
      tipoOperacao: editTipo,
      frequencia: editFrequencia,
      status: editStatus,
    });
    if (sucesso) {
      setRotinaParaEditar(null);
    }
  };

  const abrirEdicao = (r: RotinaFinanceira) => {
    setRotinaParaEditar(r);
    setEditTipo(r.tipoOperacao);
    setEditFrequencia(r.frequencia);
    setEditStatus(r.status);
    setError(null);
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

      {/* Banner de permissão contábil */}
      {!temAcesso && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 no-print">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            <strong>Acesso Contábil Restrito:</strong> Modificar e cadastrar parametrizações de faturamento recorrente exige perfil de Contador ou Administrador Financeiro.
          </span>
        </div>
      )}

      {/* Ações */}
      {temAcesso && (
        <div className="flex justify-end border-b border-border pb-4">
          <Button
            onClick={() => {
              setFormCadastroOpen(true);
              setError(null);
            }}
            className="h-9 shadow-md font-semibold gap-2"
          >
            <Plus className="h-4 w-4" /> Configurar Rotina Recorrente
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel Central: Rotinas Financeiras Programadas */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base tracking-tight flex items-center gap-2 border-b border-border pb-3">
            <Settings className="h-5 w-5 text-primary animate-spin-slow" />
            Configuração de Automação de Processos Recorrentes
          </h3>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3">Código</th>
                  <th className="p-3">Tipo de Operação</th>
                  <th className="p-3">Frequência</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Última Execução</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rotinas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      Nenhuma rotina contábil parametrizada no momento.
                    </td>
                  </tr>
                ) : (
                  rotinas.map((r) => (
                    <tr key={r.id} className="hover:bg-accent/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-foreground">
                        {r.codigoRotina}
                        <span className="block font-mono text-[9px] text-muted-foreground font-normal">ID: {r.id}</span>
                      </td>
                      <td className="p-3 font-medium text-foreground">{r.tipoOperacao}</td>
                      <td className="p-3 font-semibold text-muted-foreground">{r.frequencia}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                            r.status === "ativa"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded font-extrabold text-[10px]",
                            r.resultadoUltimaExecucao === "Sucesso"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : r.resultadoUltimaExecucao === "Falha"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-accent text-muted-foreground"
                          )}
                        >
                          {r.resultadoUltimaExecucao}
                        </span>
                        <span className="block text-[9px] text-muted-foreground/85 mt-1 font-mono">
                          {new Date(r.dataExecucao).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground font-medium flex items-center gap-1 mt-1.5 border-none">
                        <User className="h-3.5 w-3.5 shrink-0" /> {r.responsavel}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === "ativa" && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => executarRotina(r.id)}
                              className="text-primary hover:bg-primary/10"
                              title="Processar Agora (Simulação)"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {temAcesso && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => abrirEdicao(r)}
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                title="Editar Rotina"
                              >
                                <Settings2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => removerRotina(r.id)}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Excluir Rotina"
                              >
                                <Lock className="h-3.5 w-3.5" />
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

        {/* Painel Direito: Histórico de Processamento Imutável */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="h-4.5 w-4.5 text-primary shrink-0" />
              Histórico de Processamentos (Blindado)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rastro contábil de execuções de faturamentos automáticos. Processamentos efetuados são invioláveis.
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
            {historicoProcessamentos.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhum processamento automático registrado.
              </div>
            ) : (
              historicoProcessamentos.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "p-3.5 rounded-xl border space-y-2 text-xs",
                    log.resultado === "Sucesso"
                      ? "border-emerald-500/20 bg-emerald-500/[0.01]"
                      : "border-destructive/20 bg-destructive/[0.01]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold text-primary">
                      {log.codigoRotina}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      Ref: {log.rotinaId}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-semibold">Operação:</span>
                      <span className="font-bold text-foreground bg-accent px-1.5 py-0.5 rounded">
                        {log.tipoOperacao} ({log.frequencia})
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed pt-1 bg-accent/30 px-2 py-1.5 rounded border border-border/40 mt-1 italic">
                      "{log.detalhes}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/20 pt-1.5">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.dataExecucao).toLocaleString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-0.5 font-semibold">
                      <User className="h-3 w-3" /> {log.responsavel}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar Rotina */}
      {formCadastroOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary animate-spin-slow" />
                Configurar Rotina Recorrente
              </h3>
              <button
                onClick={() => setFormCadastroOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCadastrar} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Código da Rotina (Único)
                </label>
                <Input
                  required
                  placeholder="Ex: ROT-PAG-ALUGUEL"
                  value={codigoRotina}
                  onChange={(e) => setCodigoRotina(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Tipo de Operação
                  </label>
                  <select
                    value={tipoOperacao}
                    onChange={(e) => setTipoOperacao(e.target.value as RotinaFinanceira["tipoOperacao"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {CATEGORIAS_FINANCEIRAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Frequência de Execução
                  </label>
                  <select
                    value={frequencia}
                    onChange={(e) => setFrequencia(e.target.value as RotinaFinanceira["frequencia"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {FREQUENCIAS_FINANCEIRAS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormCadastroOpen(false)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Mapear Rotina
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Rotina */}
      {rotinaParaEditar && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Mapeamento de Parametrizações
              </h3>
              <button
                onClick={() => setRotinaParaEditar(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    ID da Rotina
                  </label>
                  <Input
                    disabled
                    value={rotinaParaEditar.id}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Código Rotina (Imutável)
                  </label>
                  <Input
                    disabled
                    value={rotinaParaEditar.codigoRotina}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Tipo de Operação
                  </label>
                  <select
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value as RotinaFinanceira["tipoOperacao"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {CATEGORIAS_FINANCEIRAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Frequência
                  </label>
                  <select
                    value={editFrequencia}
                    onChange={(e) => setEditFrequencia(e.target.value as RotinaFinanceira["frequencia"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {FREQUENCIAS_FINANCEIRAS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Status da Rotina
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as RotinaFinanceira["status"])}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  <option value="ativa">Ativa (Habilitada para Execução)</option>
                  <option value="inativa">Inativa (Suspensa)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRotinaParaEditar(null)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Confirmar Edição
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
