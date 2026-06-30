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
  ShieldCheck,
  UploadCloud,
  Trash2
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

  // Form Fields
  const [tipoContrato, setTipoContrato] = useState<"comercial" | "operacional" | "financeiro">("comercial");
  const [empresaVinculada, setEmpresaVinculada] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [documentoNome, setDocumentoNome] = useState("");

  // PDF Upload States (Requirement 4)
  const [pdfFile, setPdfFile] = useState<{ name: string; size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modals States
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

    const docName = pdfFile ? pdfFile.name : (documentoNome || `contrato_${tipoContrato}_${Math.floor(Math.random() * 1000)}.pdf`);

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
      setPdfFile(null);
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

  const handlePdfSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor, selecione apenas arquivos PDF.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress bar micro-animation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
          setPdfFile({ name: file.name, size: sizeMB });
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const removePdfFile = () => {
    setPdfFile(null);
    setDocumentoNome("");
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
      {/* List of Contracts */}
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
            <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {contratosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
              Nenhum contrato cadastrado ou encontrado.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">Código</th>
                  <th className="p-3 text-center">Tipo</th>
                  <th className="p-3 text-center">Empresa Vinculada</th>
                  <th className="p-3 text-center">Vencimento</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {contratosFiltrados.map((item) => {
                  const isSoon = isProximoDoVencimento(item.dataVencimento) && item.status !== "cancelado";
                  const isAssinado = item.status === "assinado";
                  const isPendente = item.status === "pendente";

                  return (
                    <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-3 font-mono font-semibold text-center">{item.id}</td>
                      <td className="p-3 font-bold text-foreground capitalize text-center">{item.tipoContrato}</td>
                      <td className="p-3 font-semibold text-center">{item.empresaVinculada}</td>
                      <td className="p-3 text-center">
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
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase cursor-pointer inline-flex items-center gap-1",
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
                      <td className="p-3 text-center">
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
                            onClick={() => alert(`Baixando documento anexo: ${item.documentoNome}`)}
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

      {/* Contract registration card (Requirement 4) */}
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

          {/* PDF File Upload Zone (Requirement 4) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Arquivo do Contrato (PDF)</label>
            
            {!pdfFile ? (
              <div className="border border-dashed border-border rounded-lg p-4 bg-accent/5 hover:bg-accent/15 transition-all text-center flex flex-col items-center justify-center relative">
                <UploadCloud className="h-7 w-7 text-muted-foreground/80 mb-1.5" />
                <p className="text-[10px] font-bold">Arraste ou selecione o PDF do contrato</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Apenas arquivos no formato .pdf</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfSelection}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {isUploading && (
                  <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-3 rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mb-1.5" />
                    <div className="w-full bg-accent rounded-full h-1.5 max-w-[120px] overflow-hidden">
                      <div className="bg-primary h-1.5 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1">Carregando arquivo...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.02] text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-7 w-7 text-red-500 shrink-0" />
                  <div className="min-w-0 leading-tight">
                    <p className="font-bold text-foreground truncate max-w-[150px]">{pdfFile.name}</p>
                    <p className="text-[9px] text-muted-foreground">{pdfFile.size} • PDF Carregado</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removePdfFile}
                  className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                  title="Excluir arquivo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-8 text-xs font-semibold cursor-pointer">
            Salvar Contrato
          </Button>
        </form>
      </div>

      {/* Signature Split-Screen Modal (Requirement 4) */}
      {signingContrato && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-accent/15">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PenTool className="h-4.5 w-4.5 text-primary" />
                Assinatura Digital Criptográfica (Simulação ICP-Brasil)
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

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Left Side: Styled Virtual PDF Viewer */}
              <div className="p-6 bg-slate-100 dark:bg-slate-950 flex flex-col justify-between max-h-[460px] overflow-y-auto min-h-[350px]">
                <div className="bg-white text-slate-800 p-6 rounded shadow-sm border border-slate-200 min-h-[450px] flex flex-col justify-between text-[10px] font-serif relative">
                  <div>
                    {/* Header */}
                    <div className="border-b border-slate-300 pb-2 mb-4 text-center">
                      <span className="font-extrabold text-[12px] text-slate-900 uppercase">CONTRATO DE ADESÃO COMERCIAL</span>
                      <p className="text-[8px] text-slate-500 font-sans tracking-wide">ERP Pro Ltda. • Cód: {signingContrato.id}</p>
                    </div>

                    {/* Content text */}
                    <div className="space-y-3 leading-normal">
                      <p>
                        Pelo presente instrumento particular, de um lado <strong>ERP PRO S.A.</strong>, e de outro lado <strong>{signingContrato.empresaVinculada}</strong>, resolvem firmar o presente acordo comercial de parceria operacional sob o tipo <strong>{signingContrato.tipoContrato.toUpperCase()}</strong>.
                      </p>
                      <p>
                        <strong>Cláusula 1ª (Objeto):</strong> O presente visa reger o fornecimento de licenças de software, integração e consultoria de negócios conforme os anexos fiscais.
                      </p>
                      <p>
                        <strong>Cláusula 2ª (Validade):</strong> Este contrato possui vencimento pactuado formalmente para a data de <strong suppressHydrationWarning>{new Date(signingContrato.dataVencimento).toLocaleDateString("pt-BR")}</strong>, devendo as obrigações ser concluídas e avaliadas previamente por ambas as partes.
                      </p>
                      <p className="text-[9px] italic text-slate-400">
                        * Documento eletrônico simulado anexado pelo módulo de upload: {signingContrato.documentoNome}.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Signature Area */}
                  <div className="border-t border-dashed border-slate-300 pt-4 mt-6 flex flex-col items-center">
                    <span className="text-[8px] text-slate-400 font-sans uppercase">Carimbo da Assinatura Digital</span>
                    <div className="mt-2 w-full max-w-[240px] border border-dashed border-red-400/40 bg-red-500/[0.01] rounded p-3 text-center flex flex-col items-center justify-center py-4">
                      <Clock className="h-5 w-5 text-amber-500 animate-pulse mb-1" />
                      <p className="text-[8px] text-amber-600 font-sans font-bold">AGUARDANDO CERTIFICAÇÃO DIGITAL</p>
                      <p className="text-[7px] text-slate-400 font-sans mt-0.5">Assinante: {user.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Form */}
              <form onSubmit={handleSigningSubmit} className="p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="bg-accent/40 rounded-xl p-3.5 border border-border/50 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-muted-foreground">ID do Contrato:</span>
                      <span className="font-mono font-bold text-foreground">{signingContrato.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-muted-foreground">Destinatário:</span>
                      <span className="font-semibold text-foreground">{signingContrato.empresaVinculada}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-muted-foreground">Nome do PDF:</span>
                      <span className="font-mono text-foreground truncate max-w-[170px]" title={signingContrato.documentoNome}>
                        {signingContrato.documentoNome}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-2 mt-1.5">
                      <span className="font-bold text-muted-foreground">Usuário Assinante:</span>
                      <span className="font-extrabold text-foreground">{user.name}</span>
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
                      Esta ação executa a assinatura criptográfica e-CPF ICP-Brasil. O documento receberá carimbo de data/hora oficial e hash SHA256 inviolável.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 animate-in shake duration-200">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSigningContrato(null);
                      setSenhaCertificado("");
                      limparErro();
                    }}
                    className="h-8 font-semibold text-xs cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoadingSignature}
                    className="h-8 font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white min-w-[100px] cursor-pointer"
                  >
                    {isLoadingSignature ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Assinando...
                      </>
                    ) : (
                      "Assinar PDF"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Validation View Modal (ICP-Brasil Signature Details) */}
      {viewingSignature && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-accent/10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
                Visualização do Documento & Selo de Assinatura Eletrônica
              </h3>
              <button
                onClick={() => setViewingSignature(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Left Side: Virtual PDF with stamp */}
              <div className="p-6 bg-slate-100 dark:bg-slate-950 flex flex-col justify-between max-h-[460px] overflow-y-auto min-h-[350px]">
                <div className="bg-white text-slate-800 p-6 rounded shadow-sm border border-slate-200 min-h-[450px] flex flex-col justify-between text-[10px] font-serif relative">
                  <div>
                    {/* Header */}
                    <div className="border-b border-slate-300 pb-2 mb-4 text-center">
                      <span className="font-extrabold text-[12px] text-slate-900 uppercase">CONTRATO DE ADESÃO COMERCIAL</span>
                      <p className="text-[8px] text-slate-500 font-sans tracking-wide">ERP Pro Ltda. • Cód: {viewingSignature.id}</p>
                    </div>

                    {/* Content text */}
                    <div className="space-y-3 leading-normal">
                      <p>
                        Pelo presente instrumento particular, de um lado <strong>ERP PRO S.A.</strong>, e de outro lado <strong>{viewingSignature.empresaVinculada}</strong>, resolvem firmar o presente acordo comercial de parceria operacional sob o tipo <strong>{viewingSignature.tipoContrato.toUpperCase()}</strong>.
                      </p>
                      <p>
                        <strong>Cláusula 1ª (Objeto):</strong> O presente visa reger o fornecimento de licenças de software, integração e consultoria de negócios conforme os anexos fiscais.
                      </p>
                      <p>
                        <strong>Cláusula 2ª (Validade):</strong> Este contrato possui vencimento pactuado formalmente para a data de <strong suppressHydrationWarning>{new Date(viewingSignature.dataVencimento).toLocaleDateString("pt-BR")}</strong>, devendo as obrigações ser concluídas e avaliadas previamente por ambas as partes.
                      </p>
                      <p className="text-[9px] italic text-slate-400">
                        * Documento eletrônico assinado digitalmente: {viewingSignature.documentoNome}.
                      </p>
                    </div>
                  </div>

                  {/* Active Signature Stamp */}
                  <div className="border-t border-dashed border-slate-300 pt-4 mt-6 flex flex-col items-center">
                    <span className="text-[8px] text-slate-400 font-sans uppercase">Carimbo da Assinatura Digital</span>
                    <div className="mt-2 w-full max-w-[240px] border border-emerald-500/35 bg-emerald-500/[0.02] rounded p-3 text-center flex flex-col items-center justify-center py-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-500 mb-1" />
                      <p className="text-[8px] text-emerald-600 font-sans font-extrabold">ASSINADO DIGITALMENTE</p>
                      <p className="text-[7px] text-slate-700 font-sans mt-0.5">Assinante: {viewingSignature.assinatura?.usuario}</p>
                      <p className="text-[6px] text-slate-400 font-mono mt-0.5 truncate w-[190px]">Hash: {viewingSignature.assinatura?.hash}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Validation details */}
              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.01] space-y-3 leading-normal">
                  <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm border-b border-emerald-500/10 pb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Selo Criptográfico Válido</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Assinante Autorizado</span>
                      <span className="font-bold text-foreground">{viewingSignature.assinatura?.usuario}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Data/Hora Oficial da Assinatura</span>
                      <span className="font-semibold text-foreground">
                        {viewingSignature.assinatura ? new Date(viewingSignature.assinatura.data).toLocaleString("pt-BR") : ""}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Certificado ICP-Brasil</span>
                      <span className="font-mono text-muted-foreground break-all">{viewingSignature.assinatura?.certificado}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Código de Integridade SHA-256</span>
                      <span className="font-mono text-[10px] text-muted-foreground break-all bg-accent/50 p-2.5 rounded border border-border/40 select-all">
                        {viewingSignature.assinatura?.hash}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border mt-4">
                  <Button
                    onClick={() => setViewingSignature(null)}
                    className="h-9 text-xs font-semibold bg-primary hover:bg-primary/95"
                  >
                    Fechar Detalhes da Validação
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
