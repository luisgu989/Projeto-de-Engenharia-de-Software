"use client";

import React, { useState } from "react";
import { useProducaoChao, ProducaoChao, ETAPAS_PRODUCAO } from "@/hooks/useProducaoChao";
import { useEstoque } from "@/hooks/useEstoque";
import { useProducao } from "@/hooks/useProducao";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Hammer,
  Plus,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ControleProducaoChao() {
  const { user } = useAuth();
  const { estoque } = useEstoque();
  const { ordens } = useProducao();
  const {
    producoesChao,
    historicoOperacional,
    error,
    setError,
    iniciarAcompanhamento,
    atualizarProducao,
    homologarProducao,
  } = useProducaoChao();

  // Iniciar acompanhamento fields
  const [ordemProdutivaId, setOrdemProdutivaId] = useState("");
  const [insumoId, setInsumoId] = useState("");
  const [etapaProducao, setEtapaProducao] = useState<ProducaoChao["etapaProducao"]>("Corte");
  const [quantidadeConsumida, setQuantidadeConsumida] = useState(1);
  const [formAcompanhamentoOpen, setFormAcompanhamentoOpen] = useState(false);

  // Edição progresso fields
  const [registroParaEditar, setRegistroParaEditar] = useState<ProducaoChao | null>(null);
  const [editEtapa, setEditEtapa] = useState<ProducaoChao["etapaProducao"]>("Corte");
  const [editQuantidade, setEditQuantidade] = useState(1);

  const activeTracking = producoesChao.filter((p) => p.status === "em_andamento");

  const handleIniciar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordemProdutivaId || !insumoId || quantidadeConsumida <= 0) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const sucesso = iniciarAcompanhamento(
      ordemProdutivaId,
      insumoId,
      etapaProducao,
      quantidadeConsumida
    );
    if (sucesso) {
      setOrdemProdutivaId("");
      setInsumoId("");
      setEtapaProducao("Corte");
      setQuantidadeConsumida(1);
      setFormAcompanhamentoOpen(false);
    }
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroParaEditar) return;
    const sucesso = atualizarProducao(
      registroParaEditar.id,
      editEtapa,
      editQuantidade
    );
    if (sucesso) {
      setRegistroParaEditar(null);
    }
  };

  const handleHomologar = (id: string) => {
    homologarProducao(id);
  };

  const abrirEdicao = (p: ProducaoChao) => {
    setRegistroParaEditar(p);
    setEditEtapa(p.etapaProducao);
    setEditQuantidade(p.quantidadeConsumida);
    setError(null);
  };

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

      {/* Ações e Filtros */}
      <div className="flex justify-end border-b border-border pb-4">
        <Button
          onClick={() => {
            setFormAcompanhamentoOpen(true);
            setError(null);
          }}
          className="h-9 shadow-md font-semibold gap-2"
        >
          <Plus className="h-4 w-4" /> Iniciar Acompanhamento
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel Esquerdo: Acompanhamentos em Andamento */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base tracking-tight flex items-center gap-2 border-b border-border pb-3">
            <Cpu className="h-5 w-5 text-primary" />
            Acompanhamento de Chão de Fábrica (Tempo Real)
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {activeTracking.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhum lote produtivo sendo rastreado no momento.
              </div>
            ) : (
              activeTracking.map((p) => {
                const insumoReal = estoque.find((e) => e.id === p.insumoId);
                const saldoAtual = insumoReal ? insumoReal.quantidade : 0;
                const saldoInsuficiente = saldoAtual < p.quantidadeConsumida;

                return (
                  <div
                    key={p.id}
                    className={cn(
                      "p-4 rounded-xl border bg-card hover:shadow-md transition-all space-y-3",
                      saldoInsuficiente ? "border-destructive/30 bg-destructive/[0.01]" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">
                        {p.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {p.etapaProducao}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-primary font-bold uppercase block">
                        OP Vinculada: {p.ordemProdutivaId}
                      </span>
                      <h4 className="text-xs font-bold text-foreground truncate">{p.produtoNome}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        Insumo: <span className="font-semibold text-foreground">{p.insumoNome}</span>
                      </p>
                      <div className="flex justify-between items-center text-[10px]">
                        <span>Qtd Consumida:</span>
                        <span className="font-bold text-foreground">{p.quantidadeConsumida} un.</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] pt-1 border-t border-border/40">
                        <span>Disponível em Estoque:</span>
                        <span
                          className={cn(
                            "font-bold",
                            saldoInsuficiente ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {saldoAtual} un.
                        </span>
                      </div>
                    </div>

                    {/* Alerta de Estoque Insuficiente */}
                    {saldoInsuficiente && (
                      <div className="flex items-center gap-1.5 text-[9px] text-destructive bg-destructive/10 p-1.5 rounded font-semibold">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Saldo em estoque insuficiente para homologação!</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-border/40">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => abrirEdicao(p)}
                        className="flex-1 h-8 text-[10px] font-bold"
                      >
                        Atualizar Etapa
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => handleHomologar(p.id)}
                        disabled={saldoInsuficiente}
                        className={cn(
                          "flex-1 h-8 text-[10px] font-bold shadow-sm",
                          saldoInsuficiente && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        Homologar Baixa
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Histórico Operacional de Chão de Fábrica */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <PackageCheck className="h-4.5 w-4.5 text-primary shrink-0" />
              Histórico Operacional (Lançamentos Homologados)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trilha inviolável de auditoria sobre o consumo físico de insumos no chão de fábrica do ERP.
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
            {historicoOperacional.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhum log operacional registrado.
              </div>
            ) : (
              historicoOperacional.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.01] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {log.id}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground font-semibold">
                      OP: {log.ordemProdutivaId}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground">Etapa Finalizada:</span>
                      <span className="font-bold bg-accent px-1.5 py-0.5 rounded text-foreground">
                        {log.etapaProducao}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground">Material Baixado:</span>
                      <span className="font-bold text-foreground truncate max-w-[120px]">{log.insumoNome}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground">Quantidade Consumida:</span>
                      <span className="font-bold text-destructive">-{log.quantidadeConsumida} un.</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/20 pt-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.dataHomologacao).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <User className="h-3 w-3" /> {log.usuario}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Iniciar Rastreamento */}
      {formAcompanhamentoOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Iniciar Acompanhamento Produtivo
              </h3>
              <button
                onClick={() => setFormAcompanhamentoOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIniciar} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Ordem de Produção Ativa
                </label>
                <select
                  required
                  value={ordemProdutivaId}
                  onChange={(e) => setOrdemProdutivaId(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  <option value="">Selecione uma ordem de produção...</option>
                  {ordens
                    .filter((o) => o.status === "planejado" || o.status === "em_producao")
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.id} - {o.produtoNome} ({o.quantidade} un. - {o.status})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Insumo Consumido (Matéria-Prima)
                </label>
                <select
                  required
                  value={insumoId}
                  onChange={(e) => setInsumoId(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  <option value="">Selecione o insumo...</option>
                  {estoque
                    .filter((e) => e.status === "ativo")
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nome} (Estoque: {e.quantidade} un.)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Etapa Inicial
                  </label>
                  <select
                    value={etapaProducao}
                    onChange={(e) => setEtapaProducao(e.target.value as ProducaoChao["etapaProducao"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {ETAPAS_PRODUCAO.map((et) => (
                      <option key={et} value={et}>
                        {et}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Quantidade Consumida
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={quantidadeConsumida}
                    onChange={(e) => setQuantidadeConsumida(parseInt(e.target.value, 10) || 1)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormAcompanhamentoOpen(false)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Iniciar Rastreio
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Progresso (Etapa/Quantidade) */}
      {registroParaEditar && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Atualizar Progresso do Lote
              </h3>
              <button
                onClick={() => setRegistroParaEditar(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-6 space-y-4">
              <div className="p-3 bg-accent/40 rounded-xl border border-border text-xs space-y-1 text-muted-foreground">
                <div>
                  <strong>ID Rastreio:</strong> {registroParaEditar.id}
                </div>
                <div>
                  <strong>Ordem Produtiva:</strong> {registroParaEditar.ordemProdutivaId} (Imutável)
                </div>
                <div>
                  <strong>Insumo Selecionado:</strong> {registroParaEditar.insumoNome} (Imutável)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Etapa da Produção
                  </label>
                  <select
                    value={editEtapa}
                    onChange={(e) => setEditEtapa(e.target.value as ProducaoChao["etapaProducao"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {ETAPAS_PRODUCAO.map((et) => (
                      <option key={et} value={et}>
                        {et}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Quantidade Consumida
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={editQuantidade}
                    onChange={(e) => setEditQuantidade(parseInt(e.target.value, 10) || 1)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRegistroParaEditar(null)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Salvar Progresso
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
