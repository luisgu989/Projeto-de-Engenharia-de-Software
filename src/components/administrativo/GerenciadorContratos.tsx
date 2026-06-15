"use client";

import React, { useState, useMemo } from "react";
import { useContratos, Contrato } from "@/hooks/useContratos";
import { useAuth } from "@/contexts/auth-context";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  PenTool,
  Search,
  Filter,
  ArrowDownToLine,
  UserCheck,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GerenciadorContratos() {
  const { user } = useAuth();
  const {
    contratos,
    errorMessage,
    limparErro,
    adicionarContrato,
    assinarContrato,
    cancelarContrato
  } = useContratos();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [tipoContrato, setTipoContrato] = useState<"comercial" | "operacional" | "financeiro">("comercial");
  const [empresaVinculada, setEmpresaVinculada] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [documentoNome, setDocumentoNome] = useState("");

  const [signingContrato, setSigningContrato] = useState<Contrato | null>(null);
  const [senhaCertificado, setSenhaCertificado] = useState("");
  const [isLoadingSignature, setIsLoadingSignature] = useState(false);
  const [viewingSignature, setViewingSignature] = useState<Contrato | null>(null);

  const isProximoDoVencimento = (dataStr: string) => {
    const dataVenc = new Date(dataStr);
    const diffTime = dataVenc.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 15;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();
    setSuccessMsg(null);

    const docName = documentoNome || `contrato_${tipoContrato}_${Math.floor(Math.random() * 1000)}.pdf`;

    const sucesso = adicionarContrato({
      tipoContrato,
      empresaVinculada: empresaVinculada.trim(),
      dataVencimento: new Date(dataVencimento).toISOString(),
      documentoNome: docName
    });

    if (sucesso) {
      setSuccessMsg("Contrato cadastrado com sucesso!");
      setEmpresaVinculada("");
      setDataVencimento("");
      setDocumentoNome("");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleSigningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingContrato) return;

    setIsLoadingSignature(true);
    limparErro();

    setTimeout(() => {
      const sucesso = assinarContrato(signingContrato.id, senhaCertificado);
      setIsLoadingSignature(false);
      if (sucesso) {
        setSenhaCertificado("");
        setSigningContrato(null);
        setSuccessMsg("Documento assinado digitalmente com sucesso!");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    }, 1500);
  };

  const contratosFiltrados = contratos.filter((c) => {
    const matchesBusca =
      c.empresaVinculada.toLowerCase().includes(busca.toLowerCase()) ||
      c.id.toLowerCase().includes(busca.toLowerCase());

    const matchesTipo = filtroTipo === "todos" || c.tipoContrato === filtroTipo;
    const matchesStatus = filtroStatus === "todos" || c.status === filtroStatus;

    return matchesBusca && matchesTipo && matchesStatus;
  });

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border bg-accent/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Contratos Cadastrados</h3>
              <p className="text-xs text-muted-foreground">Gerenciamento e conformidade de assinaturas corporativas</p>
            </div>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <input
              type="text"
              placeholder="Buscar contrato..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-2.5 py-1 text-xs text-foreground"
            />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-2 py-1 text-xs text-foreground cursor-pointer"
            >
              <option value="todos">Tipo: Todos</option>
              <option value="comercial">Comercial</option>
              <option value="operacional">Operacional</option>
              <option value="financeiro">Financeiro</option>
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-2 py-1 text-xs text-foreground cursor-pointer"
            >
              <option value="todos">Status: Todos</option>
              <option value="pendente">Pendente</option>
              <option value="assinado">Assinado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {successMsg && (
            <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {contratosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhum contrato cadastrado ou encontrado.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3">Código</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Empresa Vinculada</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {contratosFiltrados.map((item) => {
                  const isSoon = isProximoDoVencimento(item.dataVencimento) && item.status !== "cancelado";
                  const isAssinado = item.status === "assinado";
                  const isPendente = item.status === "pendente";

                  return (
                    <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-3 font-mono font-semibold">{item.id}</td>
                      <td className="p-3 font-bold text-foreground capitalize">{item.tipoContrato}</td>
                      <td className="p-3 font-semibold">{item.empresaVinculada}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(isSoon ? "text-amber-500 font-bold" : "text-muted-foreground")}>
                            {new Date(item.dataVencimento).toLocaleDateString("pt-BR")}
                          </span>
                          {isSoon && (
                            <span title="Vence nos próximos 15 dias!">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase cursor-pointer inline-flex items-center gap-1",
                            isAssinado
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : item.status === "cancelado"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                          )}
                          onClick={() => {
                            if (isAssinado) setViewingSignature(item);
                          }}
                          title={isAssinado ? "Clique para ver selo de assinatura digital" : undefined}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {isPendente && (
                            <>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setSigningContrato(item)}
                                className="h-7 text-[10px] font-bold border-primary/20 text-primary hover:bg-primary/10"
                              >
                                <PenTool className="h-3 w-3 mr-1" />
                                Assinar
                              </Button>
                              <Button
                                size="xs"
                                variant="destructive"
                                onClick={() => cancelarContrato(item.id)}
                                className="h-7 text-[10px] font-bold"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => alert(`Baixando documento fictício: ${item.documentoNome}`)}
                            title="Download de Documento"
                          >
                            <ArrowDownToLine className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Registrar Contrato</h3>
            <p className="text-xs text-muted-foreground">Cadastrar novo acordo no sistema</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo de Contrato</label>
            <select
              value={tipoContrato}
              onChange={(e) => setTipoContrato(e.target.value as any)}
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="comercial">Comercial</option>
              <option value="operacional">Operacional</option>
              <option value="financeiro">Financeiro</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Empresa Vinculada</label>
            <input
              type="text"
              required
              value={empresaVinculada}
              onChange={(e) => setEmpresaVinculada(e.target.value)}
              placeholder="Ex: TechDistrib LTDA ou Banco do Brasil"
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Data de Vencimento</label>
            <input
              type="date"
              required
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Nome do Documento (Anexo)</label>
            <input
              type="text"
              value={documentoNome}
              onChange={(e) => setDocumentoNome(e.target.value)}
              placeholder="Ex: contrato_suprimento.pdf"
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <Button type="submit" className="w-full h-8 text-xs font-semibold">
            Salvar Contrato
          </Button>
        </form>
      </div>

      {signingContrato && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PenTool className="h-4.5 w-4.5 text-primary" />
                Assinatura Digital Criptográfica (R044)
              </h3>
              <button
                onClick={() => {
                  setSigningContrato(null);
                  setSenhaCertificado("");
                  limparErro();
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSigningSubmit} className="p-6 space-y-4">
              <div className="bg-accent/40 rounded-xl p-3.5 border border-border/50 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Contrato ID:</span>
                  <span className="font-mono font-bold">{signingContrato.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Destino:</span>
                  <span className="font-semibold">{signingContrato.empresaVinculada}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Documento:</span>
                  <span className="font-mono truncate max-w-[200px]">{signingContrato.documentoNome}</span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-2 mt-1.5">
                  <span className="font-bold text-muted-foreground">Usuário Assinante:</span>
                  <span className="font-extrabold text-foreground">{user.name || "Avaliador"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> Senha do Certificado Digital
                </label>
                <input
                  type="password"
                  required
                  value={senhaCertificado}
                  onChange={(e) => setSenhaCertificado(e.target.value)}
                  placeholder="Insira a senha de testes '123456'"
                  className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="text-[10px] text-muted-foreground flex gap-1.5 bg-accent/25 rounded-lg p-3 border border-border/30">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  Esta ação simula a assinatura com certificado de segurançaICP-Brasil. O documento receberá carimbo de data/hora oficial e hash SHA256 inviolável.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSigningContrato(null);
                    setSenhaCertificado("");
                    limparErro();
                  }}
                  className="h-8 font-semibold text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoadingSignature}
                  className="h-8 font-semibold text-xs shadow-md shadow-primary/15 min-w-[90px]"
                >
                  {isLoadingSignature ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Assinando...
                    </>
                  ) : (
                    "Confirmar"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingSignature && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-accent/10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
                Selo de Assinatura Eletrônica (Validação)
              </h3>
              <button
                onClick={() => setViewingSignature(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm border-b border-emerald-500/10 pb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Documento Assinado Digitalmente</span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Assinante</span>
                    <span className="font-bold text-foreground">{viewingSignature.assinatura?.usuario}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Data/Hora</span>
                    <span className="font-semibold text-foreground">
                      {viewingSignature.assinatura ? new Date(viewingSignature.assinatura.data).toLocaleString("pt-BR") : ""}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Certificado</span>
                    <span className="font-mono text-muted-foreground break-all">{viewingSignature.assinatura?.certificado}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Assinatura SHA-256</span>
                    <span className="font-mono text-muted-foreground break-all bg-accent/50 p-2 rounded border border-border/40 select-all">
                      {viewingSignature.assinatura?.hash}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setViewingSignature(null)}
                  className="h-8 text-xs font-semibold"
                >
                  Fechar Validação
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
