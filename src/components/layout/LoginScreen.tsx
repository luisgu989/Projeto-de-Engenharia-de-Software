"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { KeyRound, Mail, ShieldAlert, ArrowRight, Loader2, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Premium dynamic SVG Avatars based on profiles
function ProfileAvatar({ email, name }: { email: string; name: string }) {
  const normalizedEmail = email.toLowerCase().trim();
  const initials = name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "?";

  if (normalizedEmail === "admin@erppro.com") {
    // Admin Avatar (Glowing Cyan/Teal Gradient)
    return (
      <div className="relative group animate-in zoom-in-50 duration-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-emerald-400 rounded-full blur opacity-40 group-hover:opacity-75 transition-all duration-300" />
        <div className="relative w-24 h-24 rounded-full border-2 border-cyan-400 bg-slate-900 flex items-center justify-center overflow-hidden shadow-2xl">
          <svg className="w-16 h-16 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
      </div>
    );
  }

  if (normalizedEmail === "joao.silva@erppro.com") {
    // João (Orange/Red Gradient)
    return (
      <div className="relative group animate-in zoom-in-50 duration-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-full blur opacity-40 group-hover:opacity-75 transition-all duration-300" />
        <div className="relative w-24 h-24 rounded-full border-2 border-amber-500 bg-slate-900 flex items-center justify-center overflow-hidden shadow-2xl">
          <svg className="w-16 h-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      </div>
    );
  }

  if (normalizedEmail === "maria.santos@erppro.com") {
    // Maria (Purple/Pink Gradient)
    return (
      <div className="relative group animate-in zoom-in-50 duration-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-75 transition-all duration-300" />
        <div className="relative w-24 h-24 rounded-full border-2 border-purple-500 bg-slate-900 flex items-center justify-center overflow-hidden shadow-2xl">
          <svg className="w-16 h-16 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
    );
  }

  if (normalizedEmail === "pedro.oliveira@erppro.com") {
    // Pedro (Blue/Indigo Gradient)
    return (
      <div className="relative group animate-in zoom-in-50 duration-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-75 transition-all duration-300" />
        <div className="relative w-24 h-24 rounded-full border-2 border-blue-400 bg-slate-900 flex items-center justify-center overflow-hidden shadow-2xl">
          <span className="text-3xl font-extrabold text-blue-400">{initials}</span>
        </div>
      </div>
    );
  }

  // Generic Default Profile (Glassmorphic Neutral Gray)
  return (
    <div className="relative group animate-in zoom-in-50 duration-300">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-400 to-slate-600 rounded-full blur opacity-25" />
      <div className="relative w-24 h-24 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
        {name ? (
          <span className="text-3xl font-extrabold text-slate-400">{initials}</span>
        ) : (
          <svg className="w-14 h-14 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        )}
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { login, availableProfiles } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Recovery Password State
  const [viewState, setViewState] = useState<"login" | "recover" | "recover-success">("login");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

  // Look up profile dynamically
  const [matchedProfile, setMatchedProfile] = useState<{ name: string; email: string; cargo: string } | null>(null);

  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length > 3) {
      const match = availableProfiles.find(p => p.email.toLowerCase() === trimmed);
      if (match) {
        setMatchedProfile(match);
        return;
      }
    }
    setMatchedProfile(null);
  }, [email, availableProfiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    // Simulate database latency
    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || "Erro ao efetuar login.");
      }
    }, 1200);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecovering(true);

    setTimeout(() => {
      setIsRecovering(false);
      setViewState("recover-success");
    }, 1500);
  };

  // Helper to click-fill test credentials
  const fillCredentials = (pEmail: string, pPass: string) => {
    setEmail(pEmail);
    setPassword(pPass);
    setErrorMsg(null);
  };

  return (
    <div className="dark min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden font-sans">
      {/* Premium Backdrop Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md p-2">
        <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
          {/* Logo Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-2">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">ERP PRO</h2>
            <p className="text-xs text-muted-foreground font-medium">Plataforma Avançada de Gestão Operacional</p>
          </div>

          {viewState === "login" && (
            <>
              {/* Dynamic Photo Container */}
              <div className="flex flex-col items-center justify-center space-y-3 py-1">
                <ProfileAvatar email={email} name={matchedProfile?.name || ""} />
                
                {matchedProfile ? (
                  <div className="text-center animate-in fade-in duration-300">
                    <p className="text-sm font-extrabold text-foreground">{matchedProfile.name}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{matchedProfile.cargo}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Identificação do Colaborador</p>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-in shake duration-300">
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      placeholder="seu.nome@erppro.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg(null);
                      }}
                      className="pl-10 h-11 bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Senha de Acesso</label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setViewState("recover");
                      }}
                      className="text-[10px] text-primary hover:text-primary/80 font-bold transition-all focus:outline-none"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg(null);
                      }}
                      className="pl-10 h-11 bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    <>
                      Entrar na Plataforma
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Accounts Panel */}
              <div className="border-t border-border pt-4 mt-2">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-2.5">
                  Atalhos Rápidos de Acesso (Desenvolvimento)
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <button
                    onClick={() => fillCredentials("admin@erppro.com", "admin123")}
                    className="p-2 border border-border hover:border-muted-foreground/30 bg-accent/20 rounded-lg text-muted-foreground text-left transition-all hover:bg-accent/40"
                  >
                    <p className="font-extrabold text-foreground">Suporte Admin</p>
                    <p className="text-[9px] text-muted-foreground/70">Pass: admin123</p>
                  </button>
                  <button
                    onClick={() => fillCredentials("maria.santos@erppro.com", "senha123")}
                    className="p-2 border border-border hover:border-muted-foreground/30 bg-accent/20 rounded-lg text-muted-foreground text-left transition-all hover:bg-accent/40"
                  >
                    <p className="font-extrabold text-foreground">Maria Santos</p>
                    <p className="text-[9px] text-muted-foreground/70">Pass: senha123</p>
                  </button>
                </div>
              </div>
            </>
          )}

          {viewState === "recover" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1 text-center">
                <h3 className="font-extrabold text-foreground text-base">Recuperação de Acesso</h3>
                <p className="text-xs text-muted-foreground">
                  Informe o seu e-mail cadastrado. Nós enviaremos um link criptográfico para redefinição da sua senha.
                </p>
              </div>

              <form onSubmit={handleRecoverySubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      placeholder="seu.nome@erppro.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="pl-10 h-11 bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isRecovering ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Enviando Solicitação...
                    </>
                  ) : (
                    <>
                      Enviar Link de Recuperação
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setViewState("login")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-semibold transition-all pt-2 block"
                >
                  Voltar ao Login
                </button>
              </form>
            </div>
          )}

          {viewState === "recover-success" && (
            <div className="space-y-5 text-center py-4 animate-in zoom-in-95 duration-300">
              <div className="flex justify-center">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  <CheckCircle className="h-10 w-10 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-foreground text-base">E-mail Enviado!</h3>
                <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                  Enviamos instruções detalhadas e o link de recuperação para o e-mail: <strong className="text-foreground">{recoveryEmail || "colaborador@erppro.com"}</strong>
                </p>
              </div>

              <Button
                type="button"
                onClick={() => {
                  setViewState("login");
                  setRecoveryEmail("");
                }}
                className="w-full h-10 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs rounded-xl transition-all"
              >
                Voltar à Tela Principal
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
