"use client";

import React, { useState } from "react";
import { useChamados, ChamadoTecnico } from "@/hooks/useChamados";
import { Button } from "@/components/ui/button";
import { LifeBuoy, AlertCircle, PlusCircle, User, Calendar, Trash2, CheckCircle2, Hammer, ShieldAlert, History } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChamadosPage() {
  const { chamados, error, abrirChamado, atualizarStatusChamado, removerChamado } = useChamados();

  const [isAdding, setIsAdding] = useState(false);
  const [categoria, setCategoria] = useState("Software");
  const [descricao, setDescricao] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // States to modify ticket status
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<ChamadoTecnico["status"]>("Aberto");
  const [statusDescricao, setStatusDescricao] = useState("");

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const success = abrirChamado(categoria, descricao);
    if (success) {
      setDescricao("");
      setIsAdding(false);
    }
  };

  const handleStatusUpdateSubmit = (id: string) => {
    if (!statusDescricao.trim()) return;
    const success = atualizarStatusChamado(id, tempStatus, statusDescricao);
    if (success) {
      setEditingId(null);
      setStatusDescricao("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" /> Chamados Técnicos & TI
          </h2>
          <p className="text-sm text-muted-foreground">
            Abra chamados de suporte técnico, consulte o andamento de solicitações e registre manutenções.
          </p>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 font-semibold gap-1.5 cursor-pointer shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Registrar Chamado
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSalvar} className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <LifeBuoy className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm">Abrir Solicitação de Suporte</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Categoria do Chamado *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-2.5 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
              >
                <option value="Software">Software & Bugs</option>
                <option value="Hardware">Hardware & Equipamento</option>
                <option value="Redes">Conectividade & Redes</option>
                <option value="Acessos">Acesso & Senhas</option>
                <option value="Outros">Outros Suportes</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Descrição do Problema *</label>
              <input
                type="text"
                placeholder="Descreva o problema com detalhes..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 border border-border focus:border-ring rounded-lg px-3 py-1.5 focus:outline-none text-xs text-foreground font-semibold"
              />
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
              Registrar no Banco
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

      {/* Tickets List */}
      <div className="grid gap-6">
        {chamados.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border bg-card rounded-2xl text-xs text-muted-foreground font-semibold">
            Nenhum chamado de suporte aberto.
          </div>
        ) : (
          chamados.map((c) => {
            const isExpanded = expandedId === c.idChamado;
            const isEditing = editingId === c.idChamado;
            return (
              <div key={c.idChamado} className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4 hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] bg-accent/60 text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                        {c.idChamado}
                      </span>
                      <span className="inline-flex text-[9px] font-bold uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {c.categoria}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-extrabold uppercase",
                          c.status === "Aberto"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : c.status === "Em Atendimento"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : c.status === "Resolvido"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        )}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground leading-relaxed">{c.descricao}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c.idChamado)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Ver Histórico"
                    >
                      <History className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => removerChamado(c.idChamado)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      title="Excluir chamado"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="flex flex-wrap justify-between items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {c.usuarioSolicitante} ({c.solicitanteEmail})</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(c.dataAbertura).toLocaleString("pt-BR")}</span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingId(isEditing ? null : c.idChamado);
                      setTempStatus(c.status);
                    }}
                    className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Hammer className="h-3.5 w-3.5" /> Atualizar Status
                  </button>
                </div>

                {/* Edit Form */}
                {isEditing && (
                  <div className="p-4 rounded-xl border border-border/60 bg-accent/10 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 border-b border-border pb-1.5">
                      <Hammer className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-bold uppercase">Atualização Operacional</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-muted-foreground block">Novo Status</label>
                        <select
                          value={tempStatus}
                          onChange={(e) => setTempStatus(e.target.value as any)}
                          className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-semibold text-foreground focus:outline-none"
                        >
                          <option value="Aberto">Aberto</option>
                          <option value="Em Atendimento">Em Atendimento</option>
                          <option value="Resolvido">Resolvido</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>

                      <div className="space-y-1 sm:col-span-2 flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground block">Ação Realizada *</label>
                          <input
                            type="text"
                            placeholder="Descreva a ação técnica..."
                            value={statusDescricao}
                            onChange={(e) => setStatusDescricao(e.target.value)}
                            className="w-full bg-background border border-border rounded px-3 py-1 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                        <Button
                          onClick={() => handleStatusUpdateSubmit(c.idChamado)}
                          className="h-8 text-[11px] font-semibold cursor-pointer"
                        >
                          Salvar Status
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Logs Timeline */}
                {isExpanded && (
                  <div className="p-4 rounded-xl border border-border bg-accent/5 space-y-3 animate-in fade-in duration-200">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <History className="h-4 w-4 text-primary" /> Histórico de Atendimento (Trilha de Auditoria)
                    </span>

                    <div className="relative border-l-2 border-border/80 pl-4 space-y-4">
                      {c.historicoAtendimento.map((log, index) => (
                        <div key={index} className="relative space-y-1 text-xs">
                          {/* Dot indicator */}
                          <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                          
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                            <span className="flex items-center gap-1">{log.usuario} | Status: <strong className="text-foreground">{log.status}</strong></span>
                            <span>{new Date(log.data).toLocaleString("pt-BR")}</span>
                          </div>
                          <p className="text-foreground font-medium">{log.descricaoAcao}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secure Audit Info */}
                <div className="pt-2 flex justify-between items-center border-t border-border/40 text-[9px] font-bold font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 text-[8px] uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                    <ShieldAlert className="h-3 w-3" /> Imutável
                  </span>
                  <span>Data de Abertura: {new Date(c.dataAbertura).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
