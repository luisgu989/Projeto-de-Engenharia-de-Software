"use client";

import React, { useState } from "react";
import { useFiscal, DocumentoFiscal } from "@/hooks/useFiscal";
import { useFiscalEntrada, NotaFiscalEntrada } from "@/hooks/useFiscalEntrada";
import { useClientes } from "@/hooks/useClientes";
import {
  FileText,
  Search,
  PlusCircle,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  ClipboardCheck,
  Ban,
  ArrowUpCircle,
  ArrowDownCircle,
  FileCode,
  UploadCloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

function isWithin24Hours(dateStr: string): boolean {
  const dateEmit = new Date(dateStr);
  const diffTime = new Date().getTime() - dateEmit.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);
  return diffHours <= 24;
}

export function FaturamentoFiscal() {
  const { documentos, errorMessage: saídasError, limparErro: limparSaidasErro, emitirDocumentoFiscal, cancelarDocumentoFiscal } = useFiscal();
  const { notas: notasEntrada, darEntradaNota, receberNotaPorXML } = useFiscalEntrada();
  const { clientes } = useClientes();

  // Navigation
  const [abaAtiva, setAbaAtiva] = useState<"saidas" | "entradas">("saidas");

  // Filter/Search states
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Issued Notes States (Saídas)
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [tipoDoc, setTipoDoc] = useState<"NF-e" | "NFS-e" | "NFC-e">("NF-e");
  const [valor, setValor] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelDoc, setCancelDoc] = useState<DocumentoFiscal | null>(null);
  const [motivoCancel, setMotivoCancel] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Incoming Notes States (Entradas)
  const [viewingXMLNota, setViewingXMLNota] = useState<NotaFiscalEntrada | null>(null);
  const [xmlUploadOpen, setXmlUploadOpen] = useState(false);
  const [rawXmlText, setRawXmlText] = useState("");
  const [xmlFileError, setXmlFileError] = useState<string | null>(null);
  const [xmlFileSuccess, setXmlFileSuccess] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [viewingDANFENota, setViewingDANFENota] = useState<DocumentoFiscal | null>(null);

  const activeClientes = clientes.filter((c) => c.status === "ativo");

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleEmitir = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clienteId) {
      setFormError("Selecione um cliente destinatário.");
      return;
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setFormError("Informe um valor válido maior que zero.");
      return;
    }

    const clienteSelecionado = clientes.find((c) => c.id === clienteId);
    if (!clienteSelecionado) {
      setFormError("Cliente inválido.");
      return;
    }

    const sucesso = emitirDocumentoFiscal({
      tipoDocumento: tipoDoc,
      destinatarioId: clienteSelecionado.id,
      destinatarioNome: clienteSelecionado.nome,
      destinatarioDocumento: clienteSelecionado.documento,
      valorTotal: valorNum
    });

    if (sucesso) {
      setClienteId("");
      setValor("");
      setTipoDoc("NF-e");
      setModalOpen(false);
    }
  };

  const handleCancelarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCancelError(null);

    if (!cancelDoc) return;

    if (!motivoCancel || motivoCancel.trim().length < 15) {
      setCancelError("O motivo do cancelamento deve conter pelo menos 15 caracteres.");
      return;
    }

    const sucesso = cancelarDocumentoFiscal(cancelDoc.id, motivoCancel);
    if (sucesso) {
      setCancelDoc(null);
      setMotivoCancel("");
      setCancelModalOpen(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  // Filter Saídas
  const filteredDocs = documentos.filter((doc) => {
    const matchesSearch =
      doc.id.toLowerCase().includes(busca.toLowerCase()) ||
      doc.destinatarioNome.toLowerCase().includes(busca.toLowerCase()) ||
      doc.destinatarioDocumento.includes(busca) ||
      doc.chaveFiscal.includes(busca);

    const matchesTipo = filtroTipo === "todos" || doc.tipoDocumento === filtroTipo;
    const matchesStatus = filtroStatus === "todos" || doc.statusEmissao === filtroStatus;

    return matchesSearch && matchesTipo && matchesStatus;
  });

  // Filter Entradas
  const filteredEntradas = notasEntrada.filter((nota) => {
    const matchesSearch =
      nota.id.toLowerCase().includes(busca.toLowerCase()) ||
      nota.emitente.toLowerCase().includes(busca.toLowerCase()) ||
      nota.documentoEmitente.includes(busca) ||
      nota.chaveAcesso.includes(busca);

    const matchesStatus = filtroStatus === "todos" || nota.status === filtroStatus;

    return matchesSearch && matchesStatus;
  });

  // High-fidelity syntax highlight XML formatting helper
  const highlightXML = (xml: string) => {
    if (!xml) return "";
    let escaped = xml
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Highlight elements
    escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9_:]+)(\s|&gt;)/g, '<span class="text-cyan-400">$1</span>$2');
    escaped = escaped.replace(/(\s[a-zA-Z0-9_:]+=)&quot;([^&]+)&quot;/g, '$1<span class="text-amber-400">&quot;$2&quot;</span>');
    escaped = escaped.replace(/(&lt;\?[a-zA-Z0-9_:]+\s?.*?\?&gt;)/g, '<span class="text-slate-500">$1</span>');
    
    return <code className="block whitespace-pre text-left leading-relaxed text-slate-300 font-mono text-[11px]" dangerouslySetInnerHTML={{ __html: escaped }} />;
  };

  // Handle manual/pasted XML receipt
  const handleXMLImport = (e: React.FormEvent) => {
    e.preventDefault();
    setXmlFileError(null);
    setXmlFileSuccess(null);

    if (!rawXmlText.trim()) {
      setXmlFileError("Insira o texto XML da nota fiscal.");
      return;
    }

    const res = receberNotaPorXML(rawXmlText);
    if (res.success) {
      setXmlFileSuccess(`Nota fiscal ${res.nota?.id} recebida com sucesso!`);
      setRawXmlText("");
      setTimeout(() => {
        setXmlUploadOpen(false);
        setXmlFileSuccess(null);
      }, 2000);
    } else {
      setXmlFileError(res.message || "Erro ao importar XML.");
    }
  };

  // Simulate file upload loading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRawXmlText(text);
    };
    reader.readAsText(file);
  };

  const handleDarEntrada = (id: string) => {
    const sucesso = darEntradaNota(id);
    if (sucesso) {
      setSuccessMsg(`Entrada da nota fiscal ${id} efetuada com sucesso! Itens integrados ao ERP.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Indicators Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Faturamento de Saída</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold">{documentos.length} Emitidas</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Faturamento de Entrada</span>
          <div className="flex items-baseline gap-2 mt-2 text-blue-600 dark:text-blue-400">
            <span className="text-2xl font-bold">{notasEntrada.length} Recebidas</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Entradas Pendentes</span>
          <div className="flex items-baseline gap-2 mt-2 text-amber-500">
            <span className="text-2xl font-bold">{notasEntrada.filter(n => n.status === "recebida").length} Pendentes</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Entradas Integradas</span>
          <div className="flex items-baseline gap-2 mt-2 text-emerald-600 dark:text-emerald-400">
            <span className="text-2xl font-bold">{notasEntrada.filter(n => n.status === "importada").length} Lançadas</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-border no-print overflow-x-auto custom-scrollbar pb-px gap-2">
        <button
          onClick={() => { setAbaAtiva("saidas"); setBusca(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === "saidas"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowUpCircle className="h-4.5 w-4.5 text-emerald-500" />
          Faturamento de Saída (Emitidas)
        </button>
        <button
          onClick={() => { setAbaAtiva("entradas"); setBusca(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            abaAtiva === "entradas"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowDownCircle className="h-4.5 w-4.5 text-blue-500" />
          Faturamento de Entrada (Recebidas)
        </button>
      </div>

      {/* Main Grid View */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Table Filters and Search Area */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 border-b border-border bg-accent/5">
          <div className="flex flex-wrap items-center gap-2">
            {abaAtiva === "saidas" && (
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none text-foreground cursor-pointer"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="NF-e">NF-e (Produto)</option>
                <option value="NFS-e">NFS-e (Serviço)</option>
                <option value="NFC-e">NFC-e (Consumidor)</option>
              </select>
            )}

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none text-foreground cursor-pointer"
            >
              {abaAtiva === "saidas" ? (
                <>
                  <option value="todos">Todos os Status</option>
                  <option value="processando">Processando</option>
                  <option value="emitida">Emitida</option>
                  <option value="cancelada">Cancelada</option>
                </>
              ) : (
                <>
                  <option value="todos">Todos os Status</option>
                  <option value="recebida">Recebida / Pendente</option>
                  <option value="importada">Importada / Lançada</option>
                </>
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 lg:flex-none">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={abaAtiva === "saidas" ? "Buscar nota ou destinatário..." : "Buscar nota ou emitente..."}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-9 text-xs bg-background"
              />
            </div>

            {abaAtiva === "saidas" ? (
              <Button size="sm" className="h-9 text-xs font-semibold gap-1.5 shrink-0" onClick={() => { setFormError(null); setModalOpen(true); }}>
                <PlusCircle className="h-4 w-4" />
                <span>Emitir Nota Fiscal</span>
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-9 text-xs font-semibold border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/10 gap-1.5 shrink-0" onClick={() => { setXmlFileError(null); setXmlFileSuccess(null); setXmlUploadOpen(true); }}>
                <UploadCloud className="h-4 w-4" />
                <span>Receber Nova Nota (XML)</span>
              </Button>
            )}
          </div>
        </div>

        {/* Saídas Tab Content */}
        {abaAtiva === "saidas" && (
          <div className="overflow-x-auto">
            {saídasError && (
              <div className="m-4 flex items-center justify-between gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {saídasError}
                </span>
                <button onClick={limparSaidasErro} className="text-destructive hover:opacity-80">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Identificador</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Tipo</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Destinatário</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase hidden md:table-cell text-center">Data Emissão</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-left">Chave de Acesso / Histórico</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Valor Total</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Status</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhum documento fiscal emitido encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-muted-foreground text-center">{doc.id}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground font-semibold">
                          {doc.tipoDocumento}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{doc.destinatarioNome}</span>
                          <span className="text-[10px] text-muted-foreground">{doc.destinatarioDocumento}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-center">
                        {formatDate(doc.dataEmissao)}
                      </td>
                      <td className="px-4 py-3 text-left">
                        {doc.statusEmissao === "processando" ? (
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            Gerando chave...
                          </span>
                        ) : doc.statusEmissao === "cancelada" && doc.motivoCancelamento ? (
                          <div className="flex flex-col max-w-[240px]">
                            <span className="font-bold text-destructive flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Nota Cancelada
                            </span>
                            <span className="text-muted-foreground text-[10px] truncate" title={doc.motivoCancelamento}>
                              Motivo: {doc.motivoCancelamento}
                            </span>
                          </div>
                        ) : doc.chaveFiscal ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-muted-foreground select-all">
                              {doc.chaveFiscal.slice(0, 4)}...{doc.chaveFiscal.slice(-4)}
                            </span>
                            <button
                              onClick={() => handleCopy(doc.chaveFiscal)}
                              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Copiar chave de acesso"
                            >
                              {copiedKey === doc.chaveFiscal ? (
                                <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground text-right">
                        {formatCurrency(doc.valorTotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {doc.statusEmissao === "processando" ? (
                          <Badge variant="outline" className="border-blue-500/40 text-blue-600 bg-blue-500/10 gap-1 animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processando
                          </Badge>
                        ) : doc.statusEmissao === "emitida" ? (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1 font-bold">
                            <CheckCircle className="h-3 w-3" />
                            Emitida
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10 gap-1 font-bold">
                            <XCircle className="h-3 w-3" />
                            Cancelada
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {doc.statusEmissao === "emitida" && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setViewingDANFENota(doc)}
                              className="h-7 text-[10px] font-bold border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                              title="Visualizar DANFE"
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              Ver DANFE
                            </Button>
                          )}
                          {doc.statusEmissao === "emitida" ? (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setCancelDoc(doc);
                                setMotivoCancel("");
                                setCancelError(null);
                                setCancelModalOpen(true);
                              }}
                              className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors cursor-pointer"
                              title="Cancelar nota fiscal"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Entradas Tab Content (Requirement 3) */}
        {abaAtiva === "entradas" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-left">Nº Documento</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Emitente (Indústria/Pessoa)</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase hidden md:table-cell text-center">Emissão</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase hidden lg:table-cell text-center">Chave de Acesso</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Valor Total</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Status ERP</th>
                  <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEntradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhuma nota de faturamento recebida encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredEntradas.map((nota) => {
                    const isPendente = nota.status === "recebida";
                    return (
                      <tr key={nota.id} className="hover:bg-accent/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-muted-foreground text-left">{nota.id}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{nota.emitente}</span>
                            <span className="text-[10px] text-muted-foreground">CNPJ/CPF: {nota.documentoEmitente}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-center">
                          {formatDate(nota.dataEmissao)}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-center">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-muted-foreground select-all tracking-tighter">
                              {nota.chaveAcesso.slice(0, 16)}...{nota.chaveAcesso.slice(-8)}
                            </span>
                            <button
                              onClick={() => handleCopy(nota.chaveAcesso)}
                              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Copiar chave de acesso"
                            >
                              {copiedKey === nota.chaveAcesso ? (
                                <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground text-right">
                          {formatCurrency(nota.valorTotal)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isPendente ? (
                            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/5 font-extrabold">
                              Pendente / Recebida
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1 font-extrabold">
                              <CheckCircle className="h-3 w-3" />
                              Entrada Dada
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Visualizar XML */}
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setViewingXMLNota(nota)}
                              className="h-7 text-[10px] font-bold border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/10"
                              title="Visualizar XML da Nota"
                            >
                              <FileCode className="h-3.5 w-3.5 mr-1" />
                              Ver XML
                            </Button>

                            {/* Dar entrada */}
                            {isPendente ? (
                              <Button
                                size="xs"
                                onClick={() => handleDarEntrada(nota.id)}
                                className="h-7 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                                title="Dar entrada fiscal no sistema ERP"
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Dar Entrada
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                disabled
                                className="h-7 text-[10px] font-bold bg-accent text-muted-foreground border border-border cursor-not-allowed"
                              >
                                Lançada
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* XML Viewer Modal (Requirement 3) */}
      {viewingXMLNota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-900/50">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <FileCode className="h-4.5 w-4.5 text-indigo-400" />
                  Visualizador XML (NF-e de Entrada)
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  ID: {viewingXMLNota.id} | Chave: {viewingXMLNota.chaveAcesso}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingXMLNota(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* XML content body */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950/80">
              <div className="border border-slate-900 rounded-xl bg-slate-900/30 p-4 overflow-x-auto shadow-inner">
                {highlightXML(viewingXMLNota.xmlContent)}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-900 bg-slate-900/30 flex items-center justify-between">
              <div className="text-[10px] text-slate-400">
                Emitente: <strong className="text-slate-300 font-bold">{viewingXMLNota.emitente}</strong> | Valor: <strong className="text-emerald-400 font-extrabold">{formatCurrency(viewingXMLNota.valorTotal)}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingXMLNota(null)}
                  className="h-9 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white font-semibold text-xs"
                >
                  Fechar Visualizador
                </Button>
                {viewingXMLNota.status === "recebida" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      handleDarEntrada(viewingXMLNota.id);
                      setViewingXMLNota(null);
                    }}
                    className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Confirmar Entrada ERP
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XML Import Modal (Requirement 3) */}
      {xmlUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-accent/10">
              <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-indigo-500" />
                Receber Nota Fiscal de Entrada por XML
              </h3>
              <button
                type="button"
                onClick={() => setXmlUploadOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleXMLImport} className="p-5 space-y-4">
              <div className="border-2 border-dashed border-border/80 rounded-xl p-6 text-center hover:border-primary/50 transition-all flex flex-col items-center justify-center bg-accent/5">
                <UploadCloud className="h-10 w-10 text-muted-foreground/60 mb-2.5" />
                <p className="text-xs font-bold text-foreground">Arraste e solte o XML da nota ou clique para selecionar</p>
                <p className="text-[10px] text-muted-foreground mt-1">Apenas arquivos no formato .xml</p>
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="xml-file-upload-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => document.getElementById("xml-file-upload-input")?.click()}
                  className="h-7 text-[10px] font-bold mt-3"
                >
                  Selecionar Arquivo XML
                </Button>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Ou cole o conteúdo XML abaixo</label>
                <textarea
                  value={rawXmlText}
                  onChange={(e) => setRawXmlText(e.target.value)}
                  rows={6}
                  placeholder='Ex: <nfeProc><NFe><infNFe Id="NFe35..."><emit><xNome>Nome Ltda</xNome>...</emit><total><ICMSTot><vNF>5000.00</vNF>...</total></infNFe></NFe></nfeProc>'
                  className="w-full bg-accent/25 hover:bg-accent/40 focus:bg-background border border-border focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none resize-none"
                />
              </div>

              {xmlFileError && (
                <div className="p-3 text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{xmlFileError}</span>
                </div>
              )}

              {xmlFileSuccess && (
                <div className="p-3 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{xmlFileSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setXmlUploadOpen(false)} className="h-9 font-semibold text-xs">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs">
                  Processar e Receber XML
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emissão (Saída) Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-accent/10">
              <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Emitir Documento Fiscal
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleEmitir} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Destinatário (Cliente Ativo)
                </label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">Selecione o cliente destinatário...</option>
                  {activeClientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.documento})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Tipo de Documento Fiscal
                </label>
                <div className="flex gap-2">
                  {(["NF-e", "NFS-e", "NFC-e"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipoDoc(t)}
                      className={`flex-1 text-xs font-bold px-3 py-2 rounded-lg border transition-all duration-150 cursor-pointer ${
                        tipoDoc === t
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : "border-border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Valor Total do Lote/Serviço (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>

              {/* Dynamic Tax Calculator Card */}
              {parseFloat(valor) > 0 && (
                <div className="bg-accent/40 rounded-xl p-3 border border-border/80 text-[10px] space-y-2 animate-in fade-in duration-200">
                  <span className="font-extrabold text-muted-foreground uppercase tracking-wider block border-b border-border/60 pb-1 text-left">
                    Demonstrativo Tributário Estimado
                  </span>
                  
                  {tipoDoc === "NF-e" && (
                    <div className="space-y-1 font-mono font-medium text-left">
                      <div className="flex justify-between">
                        <span>Base de Cálculo (70%):</span>
                        <span>{formatCurrency(parseFloat(valor) * 0.7)}</span>
                      </div>
                      <div className="flex justify-between text-indigo-500 font-bold">
                        <span>ICMS (18%):</span>
                        <span>{formatCurrency((parseFloat(valor) * 0.7) * 0.18)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PIS (1,65%):</span>
                        <span>{formatCurrency(parseFloat(valor) * 0.0165)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>COFINS (7,6%):</span>
                        <span>{formatCurrency(parseFloat(valor) * 0.076)}</span>
                      </div>
                      <div className="flex justify-between border-t border-dashed border-border/60 pt-1 text-xs font-black mt-1">
                        <span>Total de Impostos:</span>
                        <span>{formatCurrency(((parseFloat(valor) * 0.7) * 0.18) + (parseFloat(valor) * 0.0165) + (parseFloat(valor) * 0.076))}</span>
                      </div>
                    </div>
                  )}

                  {tipoDoc === "NFS-e" && (
                    <div className="space-y-1 font-mono font-medium text-left">
                      <div className="flex justify-between text-indigo-500 font-bold">
                        <span>ISS Municipal (5%):</span>
                        <span>{formatCurrency(parseFloat(valor) * 0.05)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PIS (0,65%):</span>
                        <span>{formatCurrency(parseFloat(valor) * 0.0065)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>COFINS (3,00%):</span>
                        <span>{formatCurrency(parseFloat(valor) * 0.03)}</span>
                      </div>
                      <div className="flex justify-between border-t border-dashed border-border/60 pt-1 text-xs font-black mt-1">
                        <span>Total Retenções + ISS:</span>
                        <span>{formatCurrency((parseFloat(valor) * 0.05) + (parseFloat(valor) * 0.0065) + (parseFloat(valor) * 0.03))}</span>
                      </div>
                    </div>
                  )}

                  {tipoDoc === "NFC-e" && (
                    <div className="space-y-1 font-mono font-medium text-left">
                      <div className="flex justify-between">
                        <span>Alíquota Média Estimada:</span>
                        <span>31,00% (IBPT)</span>
                      </div>
                      <div className="flex justify-between text-indigo-500 font-bold border-t border-dashed border-border/60 pt-1 text-xs font-black mt-1">
                        <span>Tributos Totais Aprox.:</span>
                        <span>{formatCurrency(parseFloat(valor) * 0.31)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formError && (
                <div className="p-3 text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="h-9 font-semibold text-xs">
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 font-semibold text-xs gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Emitir NF e Transmitir
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancelamento Modal */}
      {cancelModalOpen && cancelDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-destructive/5">
              <h3 className="text-sm font-extrabold text-destructive tracking-tight flex items-center gap-2">
                <Ban className="h-4.5 w-4.5" />
                Cancelar Nota Fiscal
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCancelDoc(null);
                  setCancelModalOpen(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCancelarSubmit} className="p-5 space-y-4">
              <div className="bg-accent/40 rounded-xl p-3 border border-border/50 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Documento ID:</span>
                  <span className="font-mono font-bold">{cancelDoc.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destinatário:</span>
                  <span className="font-semibold">{cancelDoc.destinatarioNome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold">{formatCurrency(cancelDoc.valorTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emissão:</span>
                  <span className="font-semibold" suppressHydrationWarning>{formatDate(cancelDoc.dataEmissao)}</span>
                </div>
              </div>

              {!isWithin24Hours(cancelDoc.dataEmissao) && (
                <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>
                    <strong>Atenção:</strong> Este documento foi emitido há mais de 24 horas. O cancelamento extemporâneo está sujeito a sanções e penalidades pela SEFAZ.
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Motivo do Cancelamento (Mínimo de 15 caracteres)
                </label>
                <textarea
                  value={motivoCancel}
                  onChange={(e) => setMotivoCancel(e.target.value)}
                  required
                  rows={3}
                  placeholder="Justifique o cancelamento para fins de auditoria fiscal..."
                  className="w-full bg-accent/25 hover:bg-accent/40 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none resize-none"
                />
                {motivoCancel.trim().length > 0 && motivoCancel.trim().length < 15 && (
                  <span className="text-[10px] text-destructive mt-1 block font-semibold">
                    Faltam {15 - motivoCancel.trim().length} caracteres.
                  </span>
                )}
              </div>

              {cancelError && (
                <div className="p-3 text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{cancelError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCancelDoc(null);
                    setCancelModalOpen(false);
                  }}
                  className="h-9 font-semibold text-xs"
                >
                  Voltar
                </Button>
                <Button type="submit" variant="destructive" size="sm" className="h-9 font-semibold text-xs gap-1.5">
                  <Ban className="h-4 w-4" />
                  Confirmar Cancelamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visualizador de DANFE / Espelho Fiscal Modal */}
      {viewingDANFENota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white text-black border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-emerald-600" />
                  Espelho Fiscal - {viewingDANFENota.tipoDocumento === "NF-e" ? "DANFE (NF-e de Produto)" : viewingDANFENota.tipoDocumento === "NFS-e" ? "Nota Fiscal de Serviço (NFS-e)" : "Cupom Fiscal (NFC-e)"}
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  ID: {viewingDANFENota.id} | Chave: {viewingDANFENota.chaveFiscal}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  size="xs"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold h-7 text-[10px] cursor-pointer"
                >
                  Imprimir Documento
                </Button>
                <button
                  type="button"
                  onClick={() => setViewingDANFENota(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Document Mirror Content */}
            <div className="flex-1 p-8 overflow-y-auto bg-slate-100/50 print:bg-white print:p-0">
              
              {/* NF-e / DANFE Layout */}
              {viewingDANFENota.tipoDocumento === "NF-e" && (
                <div className="bg-white border-2 border-black p-4 space-y-4 max-w-[800px] mx-auto text-[10px] font-sans">
                  
                  {/* Receipts and Top Bar */}
                  <div className="grid grid-cols-12 gap-2 border-b-2 border-black pb-2">
                    <div className="col-span-8 border border-black p-2 flex flex-col justify-between h-14 text-left">
                      <span className="font-bold">RECEBEMOS DE ERP Pro S.A. OS PRODUTOS/SERVIÇOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO</span>
                      <div className="flex justify-between text-[8px] mt-1">
                        <span>DATA DE RECEBIMENTO</span>
                        <span>IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span>
                      </div>
                    </div>
                    <div className="col-span-4 border border-black p-2 flex flex-col items-center justify-center h-14">
                      <span className="font-extrabold text-sm">NF-e</span>
                      <span className="font-bold text-[9px]">Nº {viewingDANFENota.id.replace("NF-2026-", "")}</span>
                      <span className="font-semibold text-[8px]">SÉRIE: 001</span>
                    </div>
                  </div>

                  {/* DANFE Identifier and Barcode */}
                  <div className="grid grid-cols-12 gap-2 border-b-2 border-black pb-2">
                    {/* Logo/Emitente Info */}
                    <div className="col-span-4 border border-black p-2 flex flex-col items-center justify-center text-center">
                      <div className="font-black text-lg tracking-tight bg-slate-900 text-white px-2 py-0.5 rounded">ERP Pro</div>
                      <span className="font-bold mt-1">ERP Pro S.A.</span>
                      <span className="text-[8px] text-slate-500">Av. Das Nações, 1500 - Lagarto/SE</span>
                      <span className="text-[8px] text-slate-500">CNPJ: 12.345.678/0001-90</span>
                    </div>
                    {/* DANFE Type box */}
                    <div className="col-span-3 border border-black p-2 flex flex-col items-center justify-center text-center">
                      <span className="font-black text-sm">DANFE</span>
                      <span className="text-[7.5px] leading-tight mt-1 text-slate-600">Documento Auxiliar da<br/>Nota Fiscal Eletrônica</span>
                      <div className="border border-black px-2.5 py-0.5 mt-1 font-bold text-[9px] flex gap-2">
                        <span>0 - Entrada</span>
                        <span className="font-black">1 - Saída</span>
                        <span className="border-l border-black pl-1 font-black">1</span>
                      </div>
                      <span className="font-bold mt-1 text-[8px]">Nº {viewingDANFENota.id.replace("NF-2026-", "")} • SÉRIE: 001</span>
                    </div>
                    {/* Barcode and Access Key */}
                    <div className="col-span-5 border border-black p-2 flex flex-col justify-between text-left">
                      <div className="flex flex-col items-center">
                        {/* Barcode SVG representation */}
                        <svg viewBox="0 0 100 12" className="w-full h-8 max-w-[150px] mb-1">
                          <rect x="0" y="0" width="1" height="12" fill="black" />
                          <rect x="2" y="0" width="2" height="12" fill="black" />
                          <rect x="5" y="0" width="1" height="12" fill="black" />
                          <rect x="7" y="0" width="3" height="12" fill="black" />
                          <rect x="11" y="0" width="1" height="12" fill="black" />
                          <rect x="13" y="0" width="2" height="12" fill="black" />
                          <rect x="16" y="0" width="1" height="12" fill="black" />
                          <rect x="18" y="0" width="2" height="12" fill="black" />
                          <rect x="22" y="0" width="4" height="12" fill="black" />
                          <rect x="27" y="0" width="1" height="12" fill="black" />
                          <rect x="29" y="0" width="2" height="12" fill="black" />
                          <rect x="33" y="0" width="1" height="12" fill="black" />
                          <rect x="35" y="0" width="3" height="12" fill="black" />
                          <rect x="39" y="0" width="1" height="12" fill="black" />
                          <rect x="41" y="0" width="2" height="12" fill="black" />
                          <rect x="44" y="0" width="2" height="12" fill="black" />
                          <rect x="47" y="0" width="1" height="12" fill="black" />
                          <rect x="49" y="0" width="3" height="12" fill="black" />
                          <rect x="53" y="0" width="1" height="12" fill="black" />
                          <rect x="55" y="0" width="2" height="12" fill="black" />
                          <rect x="58" y="0" width="4" height="12" fill="black" />
                          <rect x="63" y="0" width="1" height="12" fill="black" />
                          <rect x="65" y="0" width="2" height="12" fill="black" />
                          <rect x="68" y="0" width="1" height="12" fill="black" />
                          <rect x="70" y="0" width="3" height="12" fill="black" />
                          <rect x="74" y="0" width="2" height="12" fill="black" />
                          <rect x="77" y="0" width="1" height="12" fill="black" />
                          <rect x="79" y="0" width="2" height="12" fill="black" />
                          <rect x="82" y="0" width="3" height="12" fill="black" />
                          <rect x="86" y="0" width="1" height="12" fill="black" />
                          <rect x="88" y="0" width="2" height="12" fill="black" />
                          <rect x="91" y="0" width="1" height="12" fill="black" />
                          <rect x="93" y="0" width="3" height="12" fill="black" />
                          <rect x="97" y="0" width="1" height="12" fill="black" />
                          <rect x="99" y="0" width="1" height="12" fill="black" />
                        </svg>
                        <span className="text-[7.5px] font-bold text-slate-500 uppercase">CHAVE DE ACESSO</span>
                        <span className="font-mono font-bold text-[8px] select-all tracking-wider text-center">
                          {viewingDANFENota.chaveFiscal.replace(/(.{4})/g, "$1 ")}
                        </span>
                      </div>
                      <div className="border-t border-black pt-1 mt-1 text-[7.5px] flex justify-between text-slate-600">
                        <span>PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
                        <span className="font-bold text-black">{135260001029123 + (viewingDANFENota.id.charCodeAt(8) || 0)} - {formatDate(viewingDANFENota.dataEmissao)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Natureza da Operação */}
                  <div className="border border-black p-1.5 flex justify-between uppercase font-bold text-[8px] text-slate-600 text-left">
                    <span>NATUREZA DA OPERAÇÃO: <strong className="text-black">Venda de produção do estabelecimento</strong></span>
                    <span>INSCRIÇÃO ESTADUAL: <strong className="text-black">110.220.330.110</strong></span>
                  </div>

                  {/* Destinatário / Remetente */}
                  <div className="border border-black p-2 space-y-1.5 text-left">
                    <span className="font-black border-b border-black pb-0.5 block">DESTINATÁRIO / REMETENTE</span>
                    <div className="grid grid-cols-12 gap-2 text-[8px]">
                      <div className="col-span-7">
                        <span className="text-slate-500 block">NOME / RAZÃO SOCIAL</span>
                        <strong className="text-black text-[9px]">{viewingDANFENota.destinatarioNome}</strong>
                      </div>
                      <div className="col-span-3">
                        <span className="text-slate-500 block">CNPJ / CPF</span>
                        <strong className="text-black text-[9px]">{viewingDANFENota.destinatarioDocumento}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">DATA EMISSÃO</span>
                        <strong className="text-black" suppressHydrationWarning>{new Date(viewingDANFENota.dataEmissao).toLocaleDateString("pt-BR")}</strong>
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 text-[8px] border-t border-slate-200 pt-1">
                      <div className="col-span-6">
                        <span className="text-slate-500 block">ENDEREÇO</span>
                        <strong className="text-black">Av. Central, 1200 - Centro</strong>
                      </div>
                      <div className="col-span-3">
                        <span className="text-slate-500 block">MUNICÍPIO / UF</span>
                        <strong className="text-black">Aracaju / SE</strong>
                      </div>
                      <div className="col-span-3">
                        <span className="text-slate-500 block">INSCRIÇÃO ESTADUAL</span>
                        <strong className="text-black">Isento</strong>
                      </div>
                    </div>
                  </div>

                  {/* Impostos Calculados (Calculadora Fiscal) */}
                  {(() => {
                    const bcIcms = viewingDANFENota.valorTotal * 0.7;
                    const vIcms = bcIcms * 0.18;
                    const vPis = viewingDANFENota.valorTotal * 0.0165;
                    const vCofins = viewingDANFENota.valorTotal * 0.076;

                    return (
                      <div className="border border-black p-2 space-y-1.5 text-left">
                        <span className="font-black border-b border-black pb-0.5 block">CÁLCULO DO IMPOSTO (DEMONSTRATIVO LEI DA TRANSPARÊNCIA)</span>
                        <div className="grid grid-cols-5 gap-2 text-[8.5px] text-center font-bold">
                          <div className="border-r border-slate-200">
                            <span className="text-slate-500 block text-[7px]">BASE CÁLCULO ICMS</span>
                            <span className="text-slate-700">{formatCurrency(bcIcms)}</span>
                          </div>
                          <div className="border-r border-slate-200">
                            <span className="text-slate-500 block text-[7px]">VALOR DO ICMS (18%)</span>
                            <span className="text-slate-700">{formatCurrency(vIcms)}</span>
                          </div>
                          <div className="border-r border-slate-200">
                            <span className="text-slate-500 block text-[7px]">PIS (1,65%)</span>
                            <span className="text-slate-700">{formatCurrency(vPis)}</span>
                          </div>
                          <div className="border-r border-slate-200">
                            <span className="text-slate-500 block text-[7px]">COFINS (7,6%)</span>
                            <span className="text-slate-700">{formatCurrency(vCofins)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[7px] text-emerald-600">TOTAL DA NOTA</span>
                            <span className="text-emerald-700 font-extrabold">{formatCurrency(viewingDANFENota.valorTotal)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Itens Grid */}
                  <div className="border border-black text-left">
                    <div className="bg-slate-100 border-b border-black px-2 py-1 font-black">DADOS DOS PRODUTOS / SERVIÇOS</div>
                    <table className="w-full text-left border-collapse text-[8px]">
                      <thead>
                        <tr className="border-b border-black bg-slate-50 font-bold text-slate-700">
                          <th className="p-1.5">CÓD. PROD</th>
                          <th className="p-1.5">DESCRIÇÃO DO PRODUTO/SERVIÇO</th>
                          <th className="p-1.5 text-center">NCM</th>
                          <th className="p-1.5 text-center">CFOP</th>
                          <th className="p-1.5 text-center">UN</th>
                          <th className="p-1.5 text-center">QTD</th>
                          <th className="p-1.5 text-right">VALOR UNIT</th>
                          <th className="p-1.5 text-right">VALOR TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-1.5 font-mono">PROD-GEN-01</td>
                          <td className="p-1.5 font-semibold">LOTE DE MERCADORIAS GERAIS E INSUMOS INTEGRADOS</td>
                          <td className="p-1.5 text-center">8542.31.90</td>
                          <td className="p-1.5 text-center">5.101</td>
                          <td className="p-1.5 text-center">UN</td>
                          <td className="p-1.5 text-center">1</td>
                          <td className="p-1.5 text-right">{formatCurrency(viewingDANFENota.valorTotal)}</td>
                          <td className="p-1.5 text-right font-bold">{formatCurrency(viewingDANFENota.valorTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Observações adicionais */}
                  <div className="border border-black p-2 min-h-12 flex flex-col justify-between text-left">
                    <span className="font-bold block text-[7.5px] text-slate-500">INFORMAÇÕES COMPLEMENTARES</span>
                    <span className="text-[7.5px] leading-relaxed text-slate-700">
                      Documento emitido por ERP Pro S.A. Regime tributário: Simples Nacional. Lei da Transparência Fiscal: Carga tributária estimada de 27,25% (Fonte: IBPT). Autorizado sob o protocolo de mensageria Sefaz virtual.
                    </span>
                  </div>

                </div>
              )}

              {/* NFS-e Layout (Nota Fiscal de Serviços) */}
              {viewingDANFENota.tipoDocumento === "NFS-e" && (
                <div className="bg-white border-2 border-slate-400 p-6 space-y-4 max-w-[800px] mx-auto text-[10px] font-sans text-slate-800 text-left">
                  
                  {/* Header Municipal */}
                  <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-3">
                    <div className="h-12 w-12 bg-slate-100 border border-slate-300 rounded flex items-center justify-center font-black text-slate-600 text-xs shrink-0">
                      BRASÃO
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-sm text-slate-900 leading-none">PREFEITURA MUNICIPAL DE LAGARTO</h4>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">Secretaria Municipal de Finanças e Tributos</span>
                      <h5 className="font-black text-[11px] text-slate-700 mt-1 uppercase">Nota Fiscal de Serviços Eletrônica - NFS-e</h5>
                    </div>
                    <div className="border border-slate-300 rounded p-2 text-center shrink-0 bg-slate-50/50">
                      <div className="text-[7px] font-bold text-slate-500">NÚMERO DA NOTA</div>
                      <div className="text-xs font-black text-slate-950">NFS-{viewingDANFENota.id.replace("NF-2026-", "")}</div>
                      <div className="text-[7px] text-slate-500 font-bold mt-1">EMISSÃO: {new Date(viewingDANFENota.dataEmissao).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>

                  {/* Prestador / Tomador */}
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-3">
                    <div className="border border-slate-200 rounded-lg p-2.5 space-y-1">
                      <strong className="text-[8.5px] text-indigo-600 uppercase font-black block">Prestador dos Serviços</strong>
                      <div className="font-black text-slate-900 text-[10.5px]">ERP Pro S.A.</div>
                      <div>CNPJ: 12.345.678/0001-90 | Insc. Municipal: 99182</div>
                      <div className="text-slate-500">Av. Das Nações, 1500 - Distrito Industrial - Lagarto/SE</div>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-2.5 space-y-1">
                      <strong className="text-[8.5px] text-slate-500 uppercase font-black block">Tomador dos Serviços</strong>
                      <div className="font-black text-slate-900 text-[10.5px]">{viewingDANFENota.destinatarioNome}</div>
                      <div>CPF/CNPJ: {viewingDANFENota.destinatarioDocumento}</div>
                      <div className="text-slate-500">Endereço comercial informado no cadastro do ERP.</div>
                    </div>
                  </div>

                  {/* Discriminação do Serviço */}
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2 min-h-24 flex flex-col justify-between">
                    <strong className="text-[8.5px] text-slate-500 uppercase font-black border-b border-slate-100 pb-1 block">Discriminação dos Serviços Prestados</strong>
                    <p className="text-[10px] leading-relaxed text-slate-950 font-semibold italic flex-1 mt-1.5">
                      "Cessão de direito de uso de sistema de software integrado de ERP Pro, licenciamento de módulos gerenciais de vendas, controle financeiro, faturamento fiscal e suporte técnico operacional associado."
                    </p>
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider block">Código de Serviço: 1.05 - Licenciamento ou Cessão de Direito de Uso de Softwares</span>
                  </div>

                  {/* Retenções Federais and ISS Calculator */}
                  {(() => {
                    const iss = viewingDANFENota.valorTotal * 0.05;
                    const pis = viewingDANFENota.valorTotal * 0.0065;
                    const cofins = viewingDANFENota.valorTotal * 0.03;
                    const csll = viewingDANFENota.valorTotal * 0.01;
                    const vLiquido = viewingDANFENota.valorTotal - (pis + cofins + csll);

                    return (
                      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-3">
                        <strong className="text-[8.5px] text-slate-500 uppercase font-black border-b border-slate-100 pb-1 block">Valores de Retenções e ISSQN</strong>
                        
                        <div className="grid grid-cols-4 gap-3 text-center text-[9px] font-bold">
                          <div className="border-r border-slate-200">
                            <span className="text-[7px] text-slate-500 block">PIS (0,65%)</span>
                            <span className="text-slate-700">{formatCurrency(pis)}</span>
                          </div>
                          <div className="border-r border-slate-200">
                            <span className="text-[7px] text-slate-500 block">COFINS (3,00%)</span>
                            <span className="text-slate-700">{formatCurrency(cofins)}</span>
                          </div>
                          <div className="border-r border-slate-200">
                            <span className="text-[7px] text-slate-500 block">CSLL (1,00%)</span>
                            <span className="text-slate-700">{formatCurrency(csll)}</span>
                          </div>
                          <div>
                            <span className="text-[7px] text-slate-500 block text-indigo-600">ISSQN RETIDO (5%)</span>
                            <span className="text-indigo-600 font-extrabold">{formatCurrency(iss)}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-200 pt-2.5 text-xs font-black">
                          <span className="text-slate-500 uppercase text-[9px]">Valor Líquido da Nota Fiscal:</span>
                          <span className="text-slate-900 text-sm font-extrabold">{formatCurrency(vLiquido)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="text-[7.5px] text-slate-400 italic text-center font-medium mt-2">
                    NFS-e gerada eletronicamente de acordo com as especificações da ABRASF. O ISSQN será recolhido nos prazos de vencimento municipais.
                  </div>

                </div>
              )}

              {/* NFC-e Layout (Cupom Fiscal) */}
              {viewingDANFENota.tipoDocumento === "NFC-e" && (
                <div className="bg-[#fffdf6] text-black border border-amber-800/25 p-5 max-w-[340px] mx-auto text-[8.5px] font-mono space-y-4 shadow-sm border-t-4 border-t-amber-500 leading-normal text-left">
                  <div className="text-center space-y-1">
                    <strong className="text-[11px] font-black block text-center">ERP Pro S.A.</strong>
                    <span className="block text-center">CNPJ: 12.345.678/0001-90</span>
                    <span className="block text-center">Av. Das Nações, 1500 - Lagarto/SE</span>
                    <span className="block uppercase border-y border-dashed border-slate-400 py-1.5 font-bold my-1 text-center">
                      Cupom Fiscal Eletrônico - NFC-e
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>QTD | CÓD | DESCRIÇÃO</span>
                      <span>VLR TOTAL</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                      <span>1 UN x {formatCurrency(viewingDANFENota.valorTotal)} (GEN-01) Lote Consumidor</span>
                      <span className="font-bold">{formatCurrency(viewingDANFENota.valorTotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-right font-bold text-[10px]">
                    <div className="flex justify-between">
                      <span>QTD. TOTAL DE ITENS:</span>
                      <span>1</span>
                    </div>
                    <div className="flex justify-between text-slate-800 text-[11px]">
                      <span>VALOR TOTAL:</span>
                      <span>{formatCurrency(viewingDANFENota.valorTotal)}</span>
                    </div>
                  </div>

                  {/* QRCode simulation */}
                  <div className="flex flex-col items-center justify-center py-2.5 border-y border-dashed border-slate-400 gap-1.5 text-center">
                    <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block">Consulta via Leitor QR Code</span>
                    <svg viewBox="0 0 40 40" className="h-20 w-20 fill-black bg-white p-1 border border-slate-300">
                      {/* Simulated QR Code blocks */}
                      <rect x="2" y="2" width="8" height="8" />
                      <rect x="4" y="4" width="4" height="4" fill="white" />
                      <rect x="30" y="2" width="8" height="8" />
                      <rect x="32" y="4" width="4" height="4" fill="white" />
                      <rect x="2" y="30" width="8" height="8" />
                      <rect x="4" y="32" width="4" height="4" fill="white" />
                      
                      {/* Random dot pattern */}
                      <rect x="14" y="4" width="2" height="4" />
                      <rect x="18" y="2" width="4" height="2" />
                      <rect x="24" y="6" width="2" height="6" />
                      <rect x="14" y="14" width="4" height="2" />
                      <rect x="14" y="20" width="2" height="4" />
                      <rect x="22" y="16" width="6" height="2" />
                      <rect x="30" y="14" width="4" height="4" />
                      <rect x="34" y="22" width="2" height="6" />
                      <rect x="20" y="24" width="4" height="4" />
                      <rect x="16" y="32" width="6" height="2" />
                      <rect x="26" y="30" width="2" height="6" />
                    </svg>
                    <span className="text-[7px] text-slate-500 tracking-tighter uppercase block">Chave: {viewingDANFENota.chaveFiscal.slice(0, 20)}...</span>
                  </div>

                  <div className="text-center text-[7.5px] text-slate-500 space-y-0.5 font-bold leading-tight">
                    <div>CONSUMIDOR NÃO IDENTIFICADO</div>
                    <div>Tributação aproximada (Lei 12.741): {formatCurrency(viewingDANFENota.valorTotal * 0.31)} (31,00%)</div>
                    <div>Protocolo: 135260002938491 - {formatDate(viewingDANFENota.dataEmissao)}</div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print shrink-0 border-l border-r border-b rounded-b-2xl">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                ERP PRO • Módulo de Faturamento Fiscal Autorizado
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingDANFENota(null)}
                  className="h-9 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                >
                  Fechar Espelho Fiscal
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
