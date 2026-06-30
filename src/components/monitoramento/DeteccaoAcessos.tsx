"use client";

import React, { useState } from "react";
import { useDeteccaoAcessos, OcorrenciaAcesso } from "@/hooks/useDeteccaoAcessos";
import { useAuth } from "@/contexts/auth-context";
import {
  ShieldAlert,
  AlertOctagon,
  Unlock,
  Play,
  History,
  Terminal,
  Globe,
  UserX,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DeteccaoAcessos() {
  const { user } = useAuth();
  const {
    ocorrencias,
    historicoEventos,
    error,
    setError,
    registrarTentativa,
    desbloquearIP
  } = useDeteccaoAcessos();

  const [usuarioIdentificado, setUsuarioIdentificado] = useState("");
  const [enderecoAcesso, setEnderecoAcesso] = useState("");
  const [tipoOcorrencia, setTipoOcorrencia] = useState<OcorrenciaAcesso["tipoOcorrencia"]>("Falha de Autenticação");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimular = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const userTrimmed = usuarioIdentificado.trim();
    const ipTrimmed = enderecoAcesso.trim();

    if (!userTrimmed || !ipTrimmed) {
      setError("Preencha todos os campos para simulação de acesso.");
      return;
    }

    // IP validation (simple check)
    const isIpValid = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(ipTrimmed);
    if (!isIpValid) {
      setError("Insira um endereço de IP válido para a simulação (Ex: 192.168.1.10).");
      return;
    }

    setSimulating(true);

    setTimeout(() => {
      const ok = registrarTentativa(userTrimmed, ipTrimmed, tipoOcorrencia);
      setSimulating(false);
      if (ok) {
        setSuccessMsg(`Simulação registrada para o IP ${ipTrimmed}. Verifique as atualizações de bloqueio.`);
        // Don't clear fields to allow quick consecutive clicks to test threshold blocks (3 times -> temp, 5 times -> perm)
      }
    }, 800);
  };

  const handleDesbloquear = (id: string, ip: string) => {
    setError(null);
    setSuccessMsg(null);

    if (user.role !== "admin") {
      setError("Apenas administradores de segurança de TI podem desbloquear IPs.");
      return;
    }

    const ok = desbloquearIP(id);
    if (ok) {
      setSuccessMsg(`O endereço de IP ${ip} foi liberado com sucesso.`);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Coluna 1 e 2: Listas de Bloqueios e Logs */}
      <div className="md:col-span-2 space-y-6">
        {/* Painel de Bloqueios Ativos */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <AlertOctagon className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Controle de IP e Endereços Bloqueados</h3>
                <p className="text-xs text-muted-foreground">Terminais em quarentena ou bloqueio definitivo por força bruta</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {successMsg && (
              <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 text-xs font-semibold text-destructive bg-destructive/5 border border-destructive/10 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              {ocorrencias.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  Nenhum registro de acesso suspeito ou IP bloqueado.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                      <th className="p-3 text-left">IP / Usuário</th>
                      <th className="p-3 text-center">Ocorrência</th>
                      <th className="p-3 text-center">Tentativas</th>
                      <th className="p-3 text-center">Data / Hora</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-mono">
                    {ocorrencias.map((item) => {
                      const isBloqueado = item.statusBloqueio !== "Liberado";
                      const isPermanente = item.statusBloqueio === "Bloqueado Permanente";

                      return (
                        <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                          <td className="p-3 text-left">
                            <div className="flex flex-col space-y-1">
                              <span className="font-semibold text-foreground flex items-center gap-1.5 font-mono">
                                <Globe className="h-3 w-3 text-primary" />
                                {item.enderecoAcesso}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-sans max-w-[150px] truncate" title={item.usuarioIdentificado}>
                                {item.usuarioIdentificado}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-foreground/80 font-sans text-center">
                            {item.tipoOcorrencia}
                          </td>
                          <td className="p-3 font-bold text-center">
                            {item.quantidadeTentativas}
                          </td>
                          <td className="p-3 text-muted-foreground text-[11px] whitespace-nowrap text-center">
                            {new Date(item.dataTentativa).toLocaleString("pt-BR")}
                          </td>
                          <td className="p-3 font-sans text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border whitespace-nowrap",
                              item.statusBloqueio === "Liberado"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : isPermanente
                                ? "bg-destructive/10 text-destructive border-destructive/20 animate-bounce"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            )}>
                              {item.statusBloqueio}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {isBloqueado ? (
                              <button
                                onClick={() => handleDesbloquear(item.id, item.enderecoAcesso)}
                                className="p-1 border border-border rounded bg-background hover:bg-emerald-500/10 text-emerald-600 cursor-pointer transition-colors"
                                title={user.role === "admin" ? "Revogar Bloqueio" : "Apenas Admin"}
                              >
                                <Unlock className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <span className="text-muted-foreground text-[10px] font-sans">Ok</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Histórico Imutável de Ocorrências */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Histórico Operacional de Incidentes (TI)</h3>
              <p className="text-xs text-muted-foreground">Rastro histórico completo de falhas de autenticação e incidentes de login</p>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              {historicoEventos.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  Nenhum incidente no histórico operacional.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-accent/20 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                      <th className="p-3 text-center">IP Origem</th>
                      <th className="p-3 text-left">Usuário Relacionado</th>
                      <th className="p-3 text-center">Tipo de Falha</th>
                      <th className="p-3 text-center">Código</th>
                      <th className="p-3 text-center">Tentativa Nº</th>
                      <th className="p-3 text-center">Registrado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-mono text-muted-foreground">
                    {historicoEventos.map((log) => (
                      <tr key={log.id + "-" + log.quantidadeTentativas} className="hover:bg-accent/5 transition-colors">
                        <td className="p-3 font-semibold text-foreground text-center">
                          {log.enderecoAcesso}
                        </td>
                        <td className="p-3 font-sans text-foreground/80 text-left">
                          {log.usuarioIdentificado}
                        </td>
                        <td className="p-3 font-sans text-center">
                          {log.tipoOcorrencia}
                        </td>
                        <td className="p-3 font-semibold text-primary/80 text-center">
                          {log.codigoSeguranca}
                        </td>
                        <td className="p-3 font-bold text-foreground/70 text-center">
                          {log.quantidadeTentativas}
                        </td>
                        <td className="p-3 text-[11px] whitespace-nowrap text-center">
                          {new Date(log.dataTentativa).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulador de Força Bruta */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <UserX className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Simulador de Acesso</h3>
            <p className="text-xs text-muted-foreground">Simule falhas de login sucessivas para auditar o bloqueio</p>
          </div>
        </div>

        <form onSubmit={handleSimular} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              E-mail ou Usuário
            </label>
            <input
              type="text"
              required
              placeholder="Ex: joao.silva@erppro.com"
              value={usuarioIdentificado}
              onChange={(e) => setUsuarioIdentificado(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Endereço de IP Origem
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 198.51.100.42"
              value={enderecoAcesso}
              onChange={(e) => setEnderecoAcesso(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground font-mono"
            />
            <span className="text-[9px] text-muted-foreground">
              Insira um IP fixo para testar os múltiplos de falhas cumulativas.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tipo de Ocorrência
            </label>
            <select
              value={tipoOcorrencia}
              onChange={(e) => setTipoOcorrencia(e.target.value as any)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
            >
              <option value="Falha de Autenticação">Falha de Autenticação</option>
              <option value="Tentativa de Força Bruta">Tentativa de Força Bruta</option>
              <option value="Acesso Fora de Horário">Acesso Fora de Horário</option>
            </select>
          </div>

          <div className="p-4 rounded-lg bg-accent/50 border border-border/80 text-[11px] leading-relaxed text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 text-foreground font-semibold">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span>Regras de Negócio R086</span>
            </div>
            <p>
              • <b>3 tentativas falhas</b>: Bloqueio Temporário do IP.<br />
              • <b>5 tentativas falhas</b>: Bloqueio Permanente do IP.<br />
              IPs bloqueados em definitivo exigem intervenção de um administrador para liberação.
            </p>
          </div>

          <button
            type="submit"
            disabled={simulating}
            className="w-full h-9 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {simulating ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Registrando incidente...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                Simular Tentativa de Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
