"use client";

import React, { useState } from "react";
import { useManutencaoPreventiva, Manutencao, CATEGORIAS_MANUTENCAO, PERIODICIDADES_VALIDAS } from "@/hooks/useManutencaoPreventiva";
import { useAtivos } from "@/hooks/useAtivos";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Clock,
  Play,
  Check,
  Pause,
  Trash2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ManutencaoPreventiva() {
  const { user } = useAuth();
  const { ativos } = useAtivos();
  const {
    manutencoes,
    historicoIntervencoes,
    error,
    setError,
    agendarManutencao,
    editarAgendamento,
    atualizarStatusManutencao,
    removerManutencao,
    verificarPrivilegio,
  } = useManutencaoPreventiva();

  // Cadastro agendamento fields
  const [ativoId, setAtivoId] = useState("");
  const [tipoManutencao, setTipoManutencao] = useState<Manutencao["tipoManutencao"]>("Preventiva");
  const [periodicidade, setPeriodicidade] = useState<Manutencao["periodicidade"]>("Mensal");
  const [dataAgendada, setDataAgendada] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [formAgendarOpen, setFormAgendarOpen] = useState(false);

  // Edição agendamento fields
  const [manutencaoParaEditar, setManutencaoParaEditar] = useState<Manutencao | null>(null);
  const [editTipo, setEditTipo] = useState<Manutencao["tipoManutencao"]>("Preventiva");
  const [editPeriodicidade, setEditPeriodicidade] = useState<Manutencao["periodicidade"]>("Mensal");
  const [editData, setEditData] = useState("");
  const [editDetalhes, setEditDetalhes] = useState("");

  // Conclusão details modal/form
  const [manutencaoParaConcluir, setManutencaoParaConcluir] = useState<Manutencao | null>(null);
  const [detalhesIntervencao, setDetalhesIntervencao] = useState("");

  const temPrivilegio = verificarPrivilegio();

  const handleAgendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ativoId || !dataAgendada || !detalhes) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    const sucesso = agendarManutencao(
      ativoId,
      tipoManutencao,
      periodicidade,
      dataAgendada,
      detalhes
    );
    if (sucesso) {
      setAtivoId("");
      setTipoManutencao("Preventiva");
      setPeriodicidade("Mensal");
      setDataAgendada("");
      setDetalhes("");
      setFormAgendarOpen(false);
    }
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manutencaoParaEditar) return;
    const sucesso = editarAgendamento(
      manutencaoParaEditar.id,
      editTipo,
      editPeriodicidade,
      editData,
      editDetalhes
    );
    if (sucesso) {
      setManutencaoParaEditar(null);
    }
  };

  const handleConcluir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manutencaoParaConcluir) return;
    const sucesso = atualizarStatusManutencao(
      manutencaoParaConcluir.id,
      "concluida",
      detalhesIntervencao
    );
    if (sucesso) {
      setManutencaoParaConcluir(null);
      setDetalhesIntervencao("");
    }
  };

  const abrirEdicao = (m: Manutencao) => {
    setManutencaoParaEditar(m);
    setEditTipo(m.tipoManutencao);
    setEditPeriodicidade(m.periodicidade);
    setEditData(m.dataAgendada);
    setEditDetalhes(m.detalhes);
    setError(null);
  };

  // Filtra apenas ativas (agendadas e em execução)
  const manutencoesAtivas = manutencoes.filter(
    (m) => m.status === "agendada" || m.status === "em_execucao"
  );

  return (
    <div className="space-y-6">
      {/* Exibição do Erro */}
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

      {/* Banner de permissão restrita */}
      {!temPrivilegio && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            <strong>Privilégio de Agendamento Restrito:</strong> Visualização de cronogramas liberada. Modificações de cronograma e novos agendamentos são restritos a gestores de logística ou administradores.
          </span>
        </div>
      )}

      {/* Ações */}
      {temPrivilegio && (
        <div className="flex justify-end border-b border-border pb-4">
          <Button
            onClick={() => {
              setFormAgendarOpen(true);
              setError(null);
            }}
            className="h-9 shadow-md font-semibold gap-2"
          >
            <Plus className="h-4 w-4" /> Agendar Manutenção
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel Central: Cronograma de Manutenções Ativas */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base tracking-tight flex items-center gap-2 border-b border-border pb-3">
            <Wrench className="h-5 w-5 text-primary" />
            Cronograma Operacional de Revisões
          </h3>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">Código</th>
                  <th className="p-3 text-center">Equipamento (Ativo)</th>
                  <th className="p-3 text-left">Categoria</th>
                  <th className="p-3 text-center">Periodicidade</th>
                  <th className="p-3 text-center">Previsão</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {manutencoesAtivas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      Nenhuma manutenção programada pendente.
                    </td>
                  </tr>
                ) : (
                  manutencoesAtivas.map((m) => (
                    <tr key={m.id} className="hover:bg-accent/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-muted-foreground text-center">{m.id}</td>
                      <td className="p-3 text-center">
                        <span className="font-semibold block text-foreground">{m.ativoDescricao}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">Pat: {m.ativoCodigo}</span>
                      </td>
                      <td className="p-3 text-left">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold text-[10px]">
                          {m.tipoManutencao}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-muted-foreground text-center">{m.periodicidade}</td>
                      <td className="p-3 font-medium text-foreground text-center">
                        {new Date(m.dataAgendada).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase",
                            m.status === "em_execucao"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-amber-500/10 text-amber-500"
                          )}
                        >
                          {m.status === "em_execucao" ? "Em Execução" : "Agendada"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-end gap-1">
                          {/* Controles de Status */}
                          {m.status === "agendada" && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => atualizarStatusManutencao(m.id, "em_execucao")}
                              className="text-blue-600 hover:bg-blue-500/10"
                              title="Iniciar Execução"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {m.status === "em_execucao" && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setManutencaoParaConcluir(m);
                                setDetalhesIntervencao(m.detalhes);
                              }}
                              className="text-emerald-600 hover:bg-emerald-500/10"
                              title="Finalizar e Concluir"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {/* Edição de Cronograma (Exige privilégio) */}
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={!temPrivilegio}
                            onClick={() => abrirEdicao(m)}
                            className={cn(
                              "text-muted-foreground hover:text-primary hover:bg-primary/10",
                              !temPrivilegio && "opacity-40 cursor-not-allowed"
                            )}
                            title="Reprogramar Cronograma"
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </Button>

                          {/* Remoção de Agendamento (Impede concluídos) */}
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={!temPrivilegio}
                            onClick={() => removerManutencao(m.id)}
                            className={cn(
                              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                              !temPrivilegio && "opacity-40 cursor-not-allowed"
                            )}
                            title="Remover Agendamento"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Histórico de Intervenções Blindado */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="h-4.5 w-4.5 text-primary shrink-0" />
              Histórico de Intervenções (Blindado)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registro histórico inviolável de todas as revisões finalizadas. Exclusão e alteração são totalmente bloqueadas.
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
            {historicoIntervencoes.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhum histórico de intervenção gravado.
              </div>
            ) : (
              historicoIntervencoes.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.01] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                      Pat: {item.ativoCodigo}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground truncate">{item.ativoDescricao}</h4>
                    <div className="flex gap-2 text-[9px] font-semibold">
                      <span className="bg-accent px-1.5 py-0.5 rounded text-muted-foreground">{item.tipoManutencao}</span>
                      <span className="bg-accent px-1.5 py-0.5 rounded text-muted-foreground">{item.periodicidade}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed italic bg-accent/40 p-2 rounded border border-border/40 mt-1">
                      "{item.detalhes}"
                    </p>
                  </div>

                  <div className="flex flex-col gap-0.5 pt-1.5 border-t border-border/40 text-[9px] text-muted-foreground font-semibold">
                    <div className="flex justify-between">
                      <span>Executado em:</span>
                      <span className="text-foreground">
                        {item.dataExecucao ? new Date(item.dataExecucao).toLocaleDateString("pt-BR") : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operador Técnico:</span>
                      <span className="text-foreground">{item.responsavel}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar Agendamento */}
      {formAgendarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Agendar Revisão de Maquinário
              </h3>
              <button
                onClick={() => setFormAgendarOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAgendar} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Equipamento / Ativo Vinculado
                </label>
                <select
                  required
                  value={ativoId}
                  onChange={(e) => setAtivoId(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  <option value="">Selecione um equipamento...</option>
                  {ativos
                    .filter((a) => a.status !== "baixado")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.descricao} (Cód: {a.codigoPatrimonial} - {a.localizacaoAtual})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Tipo de Manutenção
                  </label>
                  <select
                    value={tipoManutencao}
                    onChange={(e) => setTipoManutencao(e.target.value as Manutencao["tipoManutencao"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {CATEGORIAS_MANUTENCAO.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Periodicidade
                  </label>
                  <select
                    value={periodicidade}
                    onChange={(e) => setPeriodicidade(e.target.value as Manutencao["periodicidade"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {PERIODICIDADES_VALIDAS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Data Planejada
                </label>
                <input
                  type="date"
                  required
                  value={dataAgendada}
                  onChange={(e) => setDataAgendada(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Instruções e Detalhes
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Instruções de manutenção, pontos a inspecionar..."
                  value={detalhes}
                  onChange={(e) => setDetalhes(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormAgendarOpen(false)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Confirmar Agendamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Agendamento (Reprogramar) */}
      {manutencaoParaEditar && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Reprogramar Cronograma
              </h3>
              <button
                onClick={() => setManutencaoParaEditar(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Maquinário (Bloqueado)
                  </label>
                  <Input
                    disabled
                    value={manutencaoParaEditar.ativoDescricao}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Patrimônio (Imutável)
                  </label>
                  <Input
                    disabled
                    value={manutencaoParaEditar.ativoCodigo}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Tipo de Manutenção
                  </label>
                  <select
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value as Manutencao["tipoManutencao"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {CATEGORIAS_MANUTENCAO.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Periodicidade
                  </label>
                  <select
                    value={editPeriodicidade}
                    onChange={(e) => setEditPeriodicidade(e.target.value as Manutencao["periodicidade"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {PERIODICIDADES_VALIDAS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Data Agendada
                </label>
                <input
                  type="date"
                  required
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Instruções e Detalhes
                </label>
                <textarea
                  required
                  rows={3}
                  value={editDetalhes}
                  onChange={(e) => setEditDetalhes(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setManutencaoParaEditar(null)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Salvar Modificações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Concluir Manutenção (Registrar Intervenção) */}
      {manutencaoParaConcluir && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                Registrar Conclusão de Manutenção
              </h3>
              <button
                onClick={() => setManutencaoParaConcluir(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConcluir} className="p-6 space-y-4">
              <div className="p-3 bg-accent/40 rounded-xl border border-border text-xs space-y-1 text-muted-foreground">
                <div>
                  <strong>Equipamento:</strong> {manutencaoParaConcluir.ativoDescricao}
                </div>
                <div>
                  <strong>Código:</strong> {manutencaoParaConcluir.ativoCodigo}
                </div>
                <div>
                  <strong>Tipo / Periodicidade:</strong> {manutencaoParaConcluir.tipoManutencao} ({manutencaoParaConcluir.periodicidade})
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Relatório Técnico de Execução
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Relate os serviços prestados, peças substituídas e o estado operacional final..."
                  value={detalhesIntervencao}
                  onChange={(e) => setDetalhesIntervencao(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setManutencaoParaConcluir(null)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                  Finalizar Intervenção
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
