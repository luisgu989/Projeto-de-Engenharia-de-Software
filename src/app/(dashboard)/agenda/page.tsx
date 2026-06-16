"use client";

import React, { useState } from "react";
import { useAgenda } from "@/hooks/useAgenda";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Users, Plus, AlertCircle, Trash2, Check, ShieldCheck, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgendaPage() {
  const { eventos, error, adicionarEvento, alterarStatusEvento, removerEvento } = useAgenda();
  const { funcionarios } = useFuncionarios();

  const [isAdding, setIsAdding] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [duracao, setDuracao] = useState(60);
  const [descricao, setDescricao] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const activeEmployees = funcionarios.filter((f) => f.status === "ativo");

  const handleParticipantToggle = (email: string) => {
    if (selectedParticipants.includes(email)) {
      setSelectedParticipants(selectedParticipants.filter((e) => e !== email));
    } else {
      setSelectedParticipants([...selectedParticipants, email]);
    }
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adicionarEvento(titulo, dataHora, duracao, descricao, selectedParticipants);
    if (success) {
      setTitulo("");
      setDataHora("");
      setDuracao(60);
      setDescricao("");
      setSelectedParticipants([]);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Agenda Corporativa
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie reuniões, compromissos de equipe e acompanhe participações organizacionais.
          </p>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 font-semibold gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Novo Compromisso
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSalvar} className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm">Criar Compromisso Corporativo</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Título do Evento *</label>
              <input
                type="text"
                placeholder="Ex: Reunião Comercial"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-3 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
              />
            </div>

            <div className="grid gap-2 grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Data e Horário *</label>
                <input
                  type="datetime-local"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-3 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Duração (minutos) *</label>
                <input
                  type="number"
                  min="5"
                  value={duracao}
                  onChange={(e) => setDuracao(parseInt(e.target.value) || 0)}
                  className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-3 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Descrição</label>
              <textarea
                rows={4}
                placeholder="Detalhes ou pauta do evento..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-3 py-1.5 focus:outline-none text-xs text-foreground font-semibold resize-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Participantes Vinculados *</label>
              <div className="border border-border bg-accent/10 rounded-lg p-3 max-h-[105px] overflow-y-auto space-y-1.5">
                {activeEmployees.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground">Nenhum funcionário ativo cadastrado no ERP.</span>
                ) : (
                  activeEmployees.map((emp) => {
                    const isChecked = selectedParticipants.includes(emp.email);
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleParticipantToggle(emp.email)}
                        className={cn(
                          "w-full text-left p-1.5 rounded border text-[11px] font-semibold flex justify-between items-center transition-colors cursor-pointer",
                          isChecked ? "bg-primary/10 border-primary text-primary" : "bg-card border-transparent text-muted-foreground hover:bg-accent/30"
                        )}
                      >
                        <span>{emp.nome} ({emp.email})</span>
                        {isChecked && <Check className="h-3 w-3 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground font-semibold text-xs rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <Button type="submit" className="px-4 py-2 text-xs font-semibold cursor-pointer">
              Confirmar Agendamento
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      )}

      {/* Events List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eventos.length === 0 ? (
          <div className="md:col-span-3 p-12 text-center border border-dashed border-border bg-card rounded-2xl text-xs text-muted-foreground font-semibold">
            Nenhum compromisso corporativo agendado.
          </div>
        ) : (
          eventos.map((e) => (
            <div
              key={e.idEvento}
              className={cn(
                "p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 border-l-4",
                e.status === "Cancelado" && "opacity-60"
              )}
              style={{
                borderLeftColor:
                  e.status === "Confirmado"
                    ? "rgb(16, 185, 129)"
                    : e.status === "Agendado"
                    ? "rgb(59, 130, 246)"
                    : e.status === "Concluido"
                    ? "rgb(139, 92, 246)"
                    : "rgb(239, 68, 68)",
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] bg-accent/60 text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                      {e.idEvento}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-0.5">
                      <User className="h-3.5 w-3.5 text-primary" /> {e.usuarioResponsavel}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{e.titulo}</h4>
                </div>

                <button
                  onClick={() => removerEvento(e.idEvento)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                  title="Remover evento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Event details */}
              <div className="space-y-2.5 text-xs text-muted-foreground font-semibold">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {new Date(e.dataHora).toLocaleDateString("pt-BR")} | {new Date(e.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ({e.duracaoMinutos} min)
                  </span>
                </div>

                {e.descricao && (
                  <div className="flex items-start gap-1.5 bg-accent/10 p-2.5 rounded-lg border border-border/40">
                    <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{e.descricao}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <span>Participantes ({e.participantesVinculados.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {e.participantesVinculados.map((email) => (
                      <span key={email} className="px-2 py-0.5 bg-accent/40 rounded text-[10px] text-foreground font-semibold">
                        {email.split("@")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status control */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase font-mono">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Histórico de Alterações
                </div>
                <select
                  value={e.status}
                  onChange={(evt) => alterarStatusEvento(e.idEvento, evt.target.value as any)}
                  className="bg-accent/40 border border-border rounded px-2 py-1 text-[10px] font-bold uppercase focus:outline-none"
                >
                  <option value="Agendado">Agendado</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Concluido">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
