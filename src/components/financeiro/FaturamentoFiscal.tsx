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
      <div className="flex border-b border-border no-print overflow-x-auto scrollbar-none gap-2">
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
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase">Identificador</th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase">Destinatário</th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase hidden md:table-cell">Data Emissão</th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase">Chave de Acesso / Histórico</th>
                  <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase">Valor Total</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground uppercase">Ações</th>
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
                      <td className="px-4 py-3 font-mono font-bold text-muted-foreground">{doc.id}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground font-semibold">
                          {doc.tipoDocumento}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{doc.destinatarioNome}</span>
                          <span className="text-[10px] text-muted-foreground">{doc.destinatarioDocumento}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {formatDate(doc.dataEmissao)}
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-right font-bold text-foreground">
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
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase">Nº Documento</th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase">Emitente (Indústria/Pessoa)</th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase hidden md:table-cell">Emissão</th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground uppercase hidden lg:table-cell">Chave de Acesso</th>
                  <th className="px-4 py-3 text-right font-bold text-muted-foreground uppercase">Valor Total</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground uppercase">Status ERP</th>
                  <th className="px-4 py-3 text-center font-bold text-muted-foreground uppercase">Ações</th>
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
                        <td className="px-4 py-3 font-mono font-bold text-muted-foreground">{nota.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{nota.emitente}</span>
                            <span className="text-[10px] text-muted-foreground">CNPJ/CPF: {nota.documentoEmitente}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {formatDate(nota.dataEmissao)}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
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
                        <td className="px-4 py-3 text-right font-bold text-foreground">
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
                  <span className="font-semibold">{formatDate(cancelDoc.dataEmissao)}</span>
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
    </div>
  );
}
