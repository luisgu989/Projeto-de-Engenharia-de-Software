"use client";

import React, { useState } from "react";
import { useFiscal } from "@/hooks/useFiscal";
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
  Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function FaturamentoFiscal() {
  const { documentos, errorMessage, limparErro, emitirDocumentoFiscal, cancelarDocumentoFiscal } = useFiscal();
  const { clientes } = useClientes();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [tipoDoc, setTipoDoc] = useState<"NF-e" | "NFS-e" | "NFC-e">("NF-e");
  const [valor, setValor] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR");
  };

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total de Documentos</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold">{documentos.length}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Emitidas com Sucesso</span>
          <div className="flex items-baseline gap-2 mt-2 text-emerald-600 dark:text-emerald-400">
            <span className="text-2xl font-bold">{documentos.filter((d) => d.statusEmissao === "emitida").length}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Em Processamento</span>
          <div className="flex items-baseline gap-2 mt-2 text-blue-600 dark:text-blue-400">
            <span className="text-2xl font-bold">{documentos.filter((d) => d.statusEmissao === "processando").length}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Canceladas</span>
          <div className="flex items-baseline gap-2 mt-2 text-destructive">
            <span className="text-2xl font-bold">{documentos.filter((d) => d.statusEmissao === "cancelada").length}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-accent/40 border border-border rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="NF-e">NF-e (Produto)</option>
              <option value="NFS-e">NFS-e (Serviço)</option>
              <option value="NFC-e">NFC-e (Consumidor)</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-accent/40 border border-border rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="processando">Processando</option>
              <option value="emitida">Emitida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 lg:flex-none">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar nota ou destinatário..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button size="sm" className="h-9 gap-1.5 shrink-0" onClick={() => { setFormError(null); setModalOpen(true); }}>
              <PlusCircle className="h-4 w-4" />
              <span>Emitir Nota Fiscal</span>
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="m-4 flex items-center justify-between gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {errorMessage}
            </span>
            <button onClick={limparErro} className="text-destructive hover:opacity-80">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identificador</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destinatário</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Data Emissão</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chave de Acesso</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Nenhum documento fiscal encontrado.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-accent/30 transition-colors duration-100">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{doc.id}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-accent text-accent-foreground font-medium">
                        {doc.tipoDocumento}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{doc.destinatarioNome}</span>
                        <span className="text-[10px] text-muted-foreground">{doc.destinatarioDocumento}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(doc.dataEmissao)}
                    </td>
                    <td className="px-4 py-3">
                      {doc.statusEmissao === "processando" ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          Gerando chave...
                        </span>
                      ) : doc.chaveFiscal ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground tracking-tight select-all">
                            {doc.chaveFiscal.slice(0, 4)}...{doc.chaveFiscal.slice(-4)}
                          </span>
                          <button
                            onClick={() => handleCopy(doc.chaveFiscal)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
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
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tracking-tight">
                      {formatCurrency(doc.valorTotal)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {doc.statusEmissao === "processando" ? (
                        <Badge variant="outline" className="border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 gap-1 animate-pulse">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processando
                        </Badge>
                      ) : doc.statusEmissao === "emitida" ? (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Emitida
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10 gap-1">
                          <XCircle className="h-3 w-3" />
                          Cancelada
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {doc.statusEmissao === "emitida" ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => cancelarDocumentoFiscal(doc.id)}
                          className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                          title="Cancelar documento fiscal"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Emitir Documento Fiscal
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEmitir} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Destinatário (Cliente Ativo)
                </label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
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
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Tipo de Documento Fiscal
                </label>
                <div className="flex gap-2">
                  {(["NF-e", "NFS-e", "NFC-e"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipoDoc(t)}
                      className={`flex-1 text-xs font-semibold px-3 py-2 rounded-md border transition-all duration-150 ${
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
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Valor Total do Lote/Serviço (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Emitir NF e Transmitir
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
