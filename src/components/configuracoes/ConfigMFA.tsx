"use client";

import React, { useState } from "react";
import { useMFA } from "@/hooks/useMFA";
import { useAuth } from "@/contexts/auth-context";
import { ShieldCheck, User, KeyRound, Smartphone, Mail, Key, Laptop, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfigMFA() {
  const { user } = useAuth();
  const {
    mfaMethod,
    alterarMetodoMFA,
    loginSimuladoAtivo,
    codigoSecreto,
    iniciarLoginSimulado,
    cancelarLoginSimulado,
    validarCodigoMFA,
  } = useMFA();

  const [codigoDigitado, setCodigoDigitado] = useState("");
  const [erroMFA, setErroMFA] = useState<string | null>(null);
  const [sucessoMFA, setSucessoMFA] = useState(false);
  const [mostrarCodigoSimulador, setMostrarCodigoSimulador] = useState(false);

  const metodosMFA = [
    { id: "email", label: "E-mail (Código por e-mail)", icon: Mail, desc: "Envia um código temporário de 6 dígitos para o e-mail cadastrado." },
    { id: "sms", label: "SMS (Mensagem de Celular)", icon: Smartphone, desc: "Envia o token via SMS para o telefone celular cadastrado." },
    { id: "google_authenticator", label: "Google Authenticator / Autenticador", icon: ShieldCheck, desc: "Valida com código dinâmico gerado em aplicativo de autenticação (TOTP)." },
    { id: "security_key", label: "Chave de Segurança Física (WebAuthn)", icon: Key, desc: "Usa chaves USB físicas ou dados biométricos integrados ao dispositivo." },
  ];

  const handleVerificar = (e: React.FormEvent) => {
    e.preventDefault();
    setErroMFA(null);

    if (codigoDigitado.length !== 6) {
      setErroMFA("O código de autenticação deve ter 6 dígitos.");
      return;
    }

    const sucesso = validarCodigoMFA(codigoDigitado);
    if (sucesso) {
      setSucessoMFA(true);
      setTimeout(() => {
        setSucessoMFA(false);
        setCodigoDigitado("");
      }, 2000);
    } else {
      setErroMFA("Código de autenticação incorreto. Acesso bloqueado. Tenda registrada no histórico.");
    }
  };

  const getMethodLabel = (id: string) => {
    const met = metodosMFA.find((m) => m.id === id);
    return met ? met.label : id;
  };

  return (
    <div className="space-y-6">
      {/* MFA Lock Simulator Screen Blocker */}
      {loginSimuladoAtivo && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8 space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="text-center space-y-2 relative z-10">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Segundo Fator de Autenticação</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Por motivos de segurança, sua conta requer verificação multifator para acessar o sistema ERP.
              </p>
            </div>

            {/* Simulated environment badge */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Usuário Vinculado:</span>
                <span className="font-bold text-foreground">{user.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Método Ativo:</span>
                <span className="font-mono bg-accent/80 text-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                  {mfaMethod}
                </span>
              </div>

              {/* Simulation developer tools to copy code */}
              <div className="pt-2 border-t border-border/50 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setMostrarCodigoSimulador(!mostrarCodigoSimulador)}
                  className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 self-start"
                >
                  {mostrarCodigoSimulador ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {mostrarCodigoSimulador ? "Ocultar Código do Simulador" : "Revelar Código Gerado Ocultamente"}
                </button>
                {mostrarCodigoSimulador && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded select-all border border-border">
                      {codigoSecreto}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      (Copie este código para validar com sucesso, ou digite qualquer outro para testar falha).
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Code Verification Form */}
            {sucessoMFA ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 animate-in zoom-in-95">
                <div className="mx-auto h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-emerald-600 text-sm">Acesso Autorizado!</h4>
                <p className="text-xs text-muted-foreground">Segundo fator validado com sucesso. Redirecionando...</p>
              </div>
            ) : (
              <form onSubmit={handleVerificar} className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <label htmlFor="mfa-token" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Código de Verificação (6 dígitos)
                  </label>
                  <input
                    id="mfa-token"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={codigoDigitado}
                    onChange={(e) => setCodigoDigitado(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-2xl tracking-[0.75em] font-mono bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-xl py-3 transition-all text-foreground"
                    autoFocus
                  />
                </div>

                {erroMFA && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-xs font-semibold flex items-center gap-2 animate-shake">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{erroMFA}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelarLoginSimulado}
                    className="flex-1 text-xs cursor-pointer h-10 font-semibold"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 text-xs cursor-pointer h-10 font-semibold">
                    Verificar Token
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Configuração de Autenticação Multifator</h3>
            <p className="text-xs text-muted-foreground">
              Aumente a segurança da sua conta exigindo uma validação adicional além da senha tradicional
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Read-only User Link Section */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Usuário Vinculado (ERP)</p>
                <h4 className="text-sm font-bold text-foreground">{user.name}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {user.email}
              </span>
            </div>
          </div>

          {/* Editable MFA Method selection only */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">
              Método de Verificação Desejado (Editável)
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {metodosMFA.map((metodo) => {
                const Icon = metodo.icon;
                const isSelected = mfaMethod === metodo.id;
                return (
                  <button
                    key={metodo.id}
                    onClick={() => alterarMetodoMFA(metodo.id)}
                    className={`text-left p-4 rounded-xl border text-xs flex gap-3 transition-all cursor-pointer hover:border-primary/50 hover:shadow-sm ${
                      isSelected
                        ? "bg-primary/5 border-primary text-foreground shadow-sm shadow-primary/5"
                        : "bg-card border-border text-foreground hover:bg-accent/10"
                    }`}
                  >
                    <div className="pt-0.5">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        {metodo.label}
                        {isSelected && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">{metodo.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Simulated login trigger block */}
          <div className="p-4 rounded-xl border border-dashed border-border/80 bg-accent/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 flex-1 text-center sm:text-left">
              <h4 className="text-xs font-bold text-foreground flex items-center justify-center sm:justify-start gap-1.5">
                <Laptop className="h-4 w-4 text-primary" /> Testar Fluxo de Acesso
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Inicie uma simulação de login de segundo fator com o método <strong>{getMethodLabel(mfaMethod)}</strong>.
                Isso bloqueará a tela para validação e registrará as tentativas no Histórico de Acessos para auditoria de segurança.
              </p>
            </div>
            <Button onClick={iniciarLoginSimulado} className="text-xs font-semibold cursor-pointer shrink-0">
              Simular Login com MFA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
