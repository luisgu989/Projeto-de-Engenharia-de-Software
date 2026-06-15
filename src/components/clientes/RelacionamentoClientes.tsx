"use client";

import React, { useState } from "react";
import { useRelacionamento, AtendimentoCRM } from "@/hooks/useRelacionamento";
import { useClientes } from "@/hooks/useClientes";
import {
  MessageSquare,
  Phone,
  Mail,
  Users,
  HelpCircle,
  Search,
  PlusCircle,
  Calendar,
  User,
  Trash2,
  X,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RelacionamentoClientes() {
  const {
    atendimentos,
    errorCRM,
    limparErroCRM,
    adicionarAtendimento,
    atualizarStatusAtendimento,
    removerAtendimento
  } = useRelacionamento();

  const { clientes } = useClientes();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [tipoInteracao, setTipoInteracao] = useState<AtendimentoCRM["tipoInteracao"]>("WhatsApp");
  const [descricao, setDescricao] = useState("");
  const [statusAtendimento, setStatusAtendimento] = useState<AtendimentoCRM["statusAtendimento"]>("aberto");
  const [formError, setFormError] = useState<string | null>(null);

  const activeClientes = clientes.filter((c) => c.status === "ativo");

  const handleCreateCRM = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clienteId) {
      setFormError("Selecione um cliente.");
      return;
    }

    if (!descricao || descricao.trim().length < 10) {
      setFormError("A descrição do atendimento deve conter pelo menos 10 caracteres.");
      return;
    }

    const clienteSelecionado = clientes.find((c) => c.id === clienteId);
    if (!clienteSelecionado) {
      setFormError("Cliente inválido.");
      return;
    }

    const sucesso = adicionarAtendimento({
      clienteId: clienteSelecionado.id,
      clienteNome: clienteSelecionado.nome,
      tipoInteracao,
      descricao: descricao.trim(),
      statusAtendimento
    });

    if (sucesso) {
      setClienteId("");
      setDescricao("");
      setTipoInteracao("WhatsApp");
      setStatusAtendimento("aberto");
      setModalOpen(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  const getTipoIcon = (tipo: AtendimentoCRM["tipoInteracao"]) => {
    switch (tipo) {
      case "WhatsApp":
        return <MessageSquare className="h-4 w-4 text-emerald-500" />;
      case "Telefone":
        return <Phone className="h-4 w-4 text-blue-500" />;
      case "E-mail":
        return <Mail className="h-4 w-4 text-purple-500" />;
      case "Reunião":
        return <Users className="h-4 w-4 text-amber-500" />;
      case "Suporte":
        return <HelpCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredCRM = atendimentos.filter((item) => {
    const matchesSearch =
      item.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      item.id.toLowerCase().includes(busca.toLowerCase()) ||
      item.usuarioResponsavel.toLowerCase().includes(busca.toLowerCase());

    const matchesTipo = filtroTipo === "todos" || item.tipoInteracao === filtroTipo;
    const matchesStatus = filtroStatus === "todos" || item.statusAtendimento === filtroStatus;

    return matchesSearch && matchesTipo && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total de Interações</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold">{atendimentos.length}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Resolvidos com Sucesso</span>
          <div className="flex items-baseline gap-2 mt-2 text-emerald-600 dark:text-emerald-400">
            <span className="text-2xl font-bold">{atendimentos.filter((a) => a.statusAtendimento === "resolvido").length}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Em Andamento</span>
          <div className="flex items-baseline gap-2 mt-2 text-amber-600 dark:text-amber-400">
            <span className="text-2xl font-bold">{atendimentos.filter((a) => a.statusAtendimento === "em_andamento").length}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Tickets Abertos</span>
          <div className="flex items-baseline gap-2 mt-2 text-blue-600 dark:text-blue-400">
            <span className="text-2xl font-bold">{atendimentos.filter((a) => a.statusAtendimento === "aberto").length}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-accent/40 border border-border rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="todos">Todos os Canais</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Telefone">Telefone</option>
              <option value="E-mail">E-mail</option>
              <option value="Reunião">Reunião</option>
              <option value="Suporte">Suporte/Chamado</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-accent/40 border border-border rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvido">Resolvido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 lg:flex-none">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar ticket ou histórico..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button size="sm" className="h-9 gap-1.5 shrink-0" onClick={() => { setFormError(null); setModalOpen(true); }}>
              <PlusCircle className="h-4 w-4" />
              <span>Novo Registro CRM</span>
            </Button>
          </div>
        </div>

        {errorCRM && (
          <div className="m-4 flex items-center justify-between gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {errorCRM}
            </span>
            <button onClick={limparErroCRM} className="text-destructive hover:opacity-80">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                <th className="px-4 py-3 text-left">ID Ticket</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Canal</th>
                <th className="px-4 py-3 text-left">Descrição da Interação</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Registrado por</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Data/Hora</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCRM.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Nenhum registro de relacionamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredCRM.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/30 transition-colors duration-100">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.id}</td>
                    <td className="px-4 py-3 font-bold">{item.clienteNome}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        {getTipoIcon(item.tipoInteracao)}
                        <span>{item.tipoInteracao}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[280px] break-words">
                      {item.descricao}
                    </td>
                    <td className="px-4 py-3 text-xs hidden md:table-cell font-medium">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {item.usuarioResponsavel}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(item.dataRegistro)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={item.statusAtendimento}
                        onChange={(e) => atualizarStatusAtendimento(item.id, e.target.value as AtendimentoCRM["statusAtendimento"])}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase focus:outline-none border cursor-pointer ${
                          item.statusAtendimento === "resolvido"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : item.statusAtendimento === "em_andamento"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/30"
                            : item.statusAtendimento === "cancelado"
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                        }`}
                      >
                        <option value="aberto">Aberto</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="resolvido">Resolvido</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => removerAtendimento(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Excluir Registro"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-accent/5">
              <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Registrar Atendimento CRM
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCRM} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Selecione o Cliente
                </label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Escolher destinatário comercial...</option>
                  {activeClientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.documento})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Canal / Tipo de Interação
                  </label>
                  <select
                    value={tipoInteracao}
                    onChange={(e) => setTipoInteracao(e.target.value as AtendimentoCRM["tipoInteracao"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm cursor-pointer"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telefone">Telefone</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Reunião">Reunião Presencial</option>
                    <option value="Suporte">Suporte Chamado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Status Inicial
                  </label>
                  <select
                    value={statusAtendimento}
                    onChange={(e) => setStatusAtendimento(e.target.value as AtendimentoCRM["statusAtendimento"])}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm cursor-pointer"
                  >
                    <option value="aberto">Aberto</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="resolvido">Resolvido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Descrição Detalhada do Registro (Mínimo de 10 caracteres)
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  rows={4}
                  placeholder="Relate os detalhes da conversa, propostas acordadas ou incidentes operacionais reportados pelo cliente..."
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm resize-none"
                />
                {descricao.trim().length > 0 && descricao.trim().length < 10 && (
                  <span className="text-[10px] text-destructive mt-1 block font-semibold">
                    Faltam {10 - descricao.trim().length} caracteres.
                  </span>
                )}
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Registrar Histórico
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
