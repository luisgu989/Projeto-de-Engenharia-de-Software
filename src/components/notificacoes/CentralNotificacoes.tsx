"use client";

import React, { useState } from "react";
import { useNotifications, Notification } from "@/contexts/notifications-context";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CentralNotificacoes() {
  const {
    filteredNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification
  } = useNotifications();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroLido, setFiltroLido] = useState<string>("todos");

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr);
    return `${data.toLocaleDateString("pt-BR")} às ${data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  };

  const notificacoesFiltradas = filteredNotifications.filter((notif) => {
    const correspondeBusca =
      notif.title.toLowerCase().includes(busca.toLowerCase()) ||
      notif.message.toLowerCase().includes(busca.toLowerCase());

    const correspondeTipo = filtroTipo === "todos" || notif.tipo === filtroTipo;

    let correspondeLido = true;
    if (filtroLido === "lidas") correspondeLido = notif.lida;
    if (filtroLido === "nao_lidas") correspondeLido = !notif.lida;

    return correspondeBusca && correspondeTipo && correspondeLido;
  });

  const obterIcone = (tipo: Notification["tipo"]) => {
    switch (tipo) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Central de Notificações</h3>
            <p className="text-xs text-muted-foreground">
              Acompanhe e gerencie alertas, atualizações de estoque e anomalias de sensores.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={notificacoesFiltradas.length === 0}
            className="text-xs gap-1.5 font-semibold"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas como lidas
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearAll}
            disabled={filteredNotifications.length === 0}
            className="text-xs gap-1.5 font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpar tudo
          </Button>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filtros e Pesquisa
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar notificações..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none transition-all"
            />
          </div>

          <div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos os tipos</option>
              <option value="info">Informação</option>
              <option value="success">Sucesso</option>
              <option value="warning">Aviso</option>
              <option value="error">Erro</option>
            </select>
          </div>

          <div>
            <select
              value={filtroLido}
              onChange={(e) => setFiltroLido(e.target.value)}
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
            >
              <option value="todos">Status: Todas</option>
              <option value="nao_lidas">Status: Não Lidas</option>
              <option value="lidas">Status: Lidas</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {notificacoesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-muted-foreground">Nenhuma notificação encontrada</p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Tente alterar os filtros ou pesquisar por outro termo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notificacoesFiltradas.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-4 p-4 transition-all duration-200 hover:bg-accent/15",
                  !notif.lida && "bg-primary/5 dark:bg-primary/10"
                )}
              >
                <div className="p-2 rounded-lg bg-accent/60 shrink-0 mt-0.5">
                  {obterIcone(notif.tipo)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-sm font-bold text-foreground", !notif.lida && "font-extrabold")}>
                      {notif.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-accent/80 text-muted-foreground">
                      {notif.scope}
                    </span>
                    {!notif.lida && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed leading-snug break-words">
                    {notif.message}
                  </p>
                  <span className="block text-[10px] text-muted-foreground/80">
                    {formatarData(notif.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  {!notif.lida && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => markAsRead(notif.id)}
                      title="Marcar como lida"
                      className="text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteNotification(notif.id)}
                    title="Excluir notificação"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
