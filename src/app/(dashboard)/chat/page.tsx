"use client";

import React, { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { MessagesSquare, Send, User, CheckCheck, Trash2, ShieldCheck, Mail, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { user } = useAuth();
  const { mensagens, error, enviarMensagem, limparConversa } = useChat();
  const { funcionarios } = useFuncionarios();

  const activeEmployees = funcionarios.filter((f) => f.status === "ativo");
  const systemUsers = [
    { nome: "Administrador Geral", email: "admin@erppro.com", cargo: "Administrador", departamento: "TI" },
    ...activeEmployees.map((f) => ({ nome: f.nome, email: f.email, cargo: f.cargo, departamento: f.departamento })),
  ].filter((u) => u.email.toLowerCase() !== user?.email?.toLowerCase());

  const [selectedContactEmail, setSelectedContactEmail] = useState<string>(
    systemUsers.length > 0 ? systemUsers[0].email : ""
  );
  const [conteudo, setConteudo] = useState("");

  const activeContact = systemUsers.find((u) => u.email === selectedContactEmail);

  // Filter messages exchanged between current user and selected contact
  const conversationMessages = mensagens.filter(
    (m) =>
      (m.remetenteEmail.toLowerCase() === user?.email?.toLowerCase() &&
        m.destinatarioEmail.toLowerCase() === selectedContactEmail.toLowerCase()) ||
      (m.remetenteEmail.toLowerCase() === selectedContactEmail.toLowerCase() &&
        m.destinatarioEmail.toLowerCase() === user?.email?.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim()) return;

    const success = enviarMensagem(selectedContactEmail, conteudo);
    if (success) {
      setConteudo("");
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessagesSquare className="h-6 w-6 text-primary" /> Chat Corporativo Interno
        </h2>
        <p className="text-sm text-muted-foreground">
          Comunicação em tempo real integrada com todos os colaboradores autorizados do ERP.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3 flex-1 min-h-0">
        {/* Contact List */}
        <div className="md:col-span-1 border border-border bg-card rounded-2xl p-4 flex flex-col space-y-4 min-h-0">
          <div className="flex items-center gap-2 border-b border-border pb-2 shrink-0">
            <User className="h-4.5 w-4.5 text-primary" />
            <span className="font-bold text-xs">Colaboradores no ERP</span>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {systemUsers.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Nenhum outro usuário disponível para chat.
              </div>
            ) : (
              systemUsers.map((u) => {
                const isSelected = selectedContactEmail === u.email;
                return (
                  <button
                    key={u.email}
                    onClick={() => setSelectedContactEmail(u.email)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-accent/10 border-transparent hover:bg-accent/20 text-foreground"
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {u.nome.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="text-xs font-bold text-foreground truncate">{u.nome}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{u.cargo} • {u.departamento}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Thread */}
        <div className="md:col-span-2 border border-border bg-card rounded-2xl flex flex-col min-h-0 overflow-hidden">
          {activeContact ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-accent/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/20">
                    {activeContact.nome.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{activeContact.nome}</h4>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {activeContact.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => limparConversa(activeContact.email)}
                  className="p-1.5 hover:bg-accent hover:text-destructive rounded-lg transition-colors shrink-0 text-muted-foreground cursor-pointer"
                  title="Limpar conversa"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-accent/5">
                {conversationMessages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground font-semibold">
                    Inicie a conversa enviando uma mensagem. Todas as comunicações são seguras.
                  </div>
                ) : (
                  conversationMessages.map((m) => {
                    const isSelf = m.remetenteEmail.toLowerCase() === user?.email?.toLowerCase();
                    return (
                      <div
                        key={m.idMensagem}
                        className={cn(
                          "flex flex-col max-w-[75%] space-y-1 rounded-xl p-3 shadow-sm border",
                          isSelf
                            ? "self-end ml-auto bg-primary text-primary-foreground border-primary/20"
                            : "self-start bg-card text-foreground border-border"
                        )}
                      >
                        <span className="text-[11px] font-medium leading-relaxed break-words whitespace-pre-wrap">
                          {m.conteudo}
                        </span>
                        <div
                          className={cn(
                            "flex items-center justify-end gap-1.5 text-[9px] font-semibold",
                            isSelf ? "text-primary-foreground/75" : "text-muted-foreground"
                          )}
                        >
                          <span suppressHydrationWarning>{new Date(m.dataEnvio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          {isSelf && <CheckCheck className="h-3 w-3 shrink-0" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Input Form */}
              <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex gap-2 items-center shrink-0">
                <input
                  type="text"
                  placeholder="Escreva sua mensagem interna..."
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  className="flex-1 bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none transition-all text-foreground"
                />
                
                <Button type="submit" size="icon-sm" className="h-9 w-9 rounded-xl shrink-0 cursor-pointer">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-xs text-muted-foreground font-semibold">
              Selecione um contato na barra lateral para iniciar a conversa.
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div className="p-2.5 bg-destructive/10 border-t border-destructive/20 text-destructive text-xs flex items-center gap-1.5 shrink-0">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Secure Audit Info */}
          <div className="px-4 py-2 border-t border-border bg-accent/10 flex justify-between items-center text-[9px] text-muted-foreground font-bold font-mono shrink-0">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> HISTÓRICO ENCRIPTADO ERP</span>
            <span>Rastreabilidade Ativa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
