"use client";

import React, { useState } from "react";
import { useCriptografia, RegistroProtegido } from "@/hooks/useCriptografia";
import { Database, Shield, Lock, Eye, KeyRound, Calendar, User, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigCriptografia() {
  const { dadosProtegidos, historicoOperacoes, atualizarPermissaoAcesso } = useCriptografia();
  const [showToast, setShowToast] = useState(false);

  const opcoesPermissao = [
    "Administrador / Equipe TI",
    "Gerente Geral",
    "Diretor Financeiro",
    "Diretor de RH",
    "Apenas Colaborador Dono do Dado",
  ];

  const handlePermissaoChange = (registroId: string, novaPermissao: string) => {
    atualizarPermissaoAcesso(registroId, novaPermissao);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
          <span className="text-sm font-semibold">Permissão de acesso atualizada e chave reconfigurada no log!</span>
        </div>
      )}

      {/* Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10 flex-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" /> Criptografia de Dados Sensíveis
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Controle de proteção a dados sensíveis no tráfego e banco de dados. Os algoritmos de criptografia são selecionados automaticamente pelo ERP. Apenas o campo de permissão de acesso é alterável.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-widest text-primary font-bold bg-primary/10 px-2 py-1 rounded border border-primary/20 shrink-0">
          AES-256 / RSA-4096 / ChaCha20
        </div>
      </div>

      {/* Main Cryptographic Protection Layers table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Camadas de Proteção Ativas</h3>
            <p className="text-xs text-muted-foreground">Tabelas do ERP com criptografia de ponta a ponta ativa</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">ID do Registro</th>
                <th className="p-4">Tipo de Informação Protegida</th>
                <th className="p-4">Algoritmo / Método do ERP</th>
                <th className="p-4">Data da Criptografia (Última Chave)</th>
                <th className="p-4 text-center">Status da Proteção</th>
                <th className="p-4 text-right min-w-[200px]">Permissão de Acesso (Editável)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {dadosProtegidos.map((dados) => (
                <tr key={dados.id} className="hover:bg-accent/10 transition-colors">
                  <td className="p-4 font-mono font-bold text-foreground">
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-primary" />
                      {dados.id}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-foreground leading-normal">{dados.tipoInformacao}</td>
                  <td className="p-4 font-mono text-muted-foreground">{dados.metodoCriptografia}</td>
                  <td className="p-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                      {formatDate(dados.dataCriptografia)}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border",
                      dados.statusProtecao === "Ativa"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {dados.statusProtecao}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={dados.permissaoAcesso}
                      onChange={(e) => handlePermissaoChange(dados.id, e.target.value)}
                      className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded px-3 py-1.5 text-xs font-semibold transition-all text-foreground text-left"
                    >
                      {opcoesPermissao.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Operations Log Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Histórico de Operações de Chaves e Acessos</h3>
            <p className="text-xs text-muted-foreground">Rastro de auditoria para reconfigurações de permissões de criptografia</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Carimbo de Hora</th>
                <th className="p-4">Operador da Chave</th>
                <th className="p-4">Registro ID</th>
                <th className="p-4">Tipo de Informação</th>
                <th className="p-4">Operação Efetuada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {historicoOperacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Nenhum histórico de alteração de chaves disponível.
                  </td>
                </tr>
              ) : (
                historicoOperacoes.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-4 font-mono text-muted-foreground">{formatDate(log.timestamp)}</td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{log.usuario}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{log.email}</div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-foreground">{log.registroId}</td>
                    <td className="p-4 text-muted-foreground">{log.tipoInformacao}</td>
                    <td className="p-4 font-bold text-primary">{log.acao}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
