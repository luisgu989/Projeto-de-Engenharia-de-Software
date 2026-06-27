"use client";

import React, { useState } from "react";
import { useDocumentos, DocumentoCorporativo, VersaoDocumento } from "@/hooks/useDocumentos";
import { useAuth } from "@/contexts/auth-context";
import {
  FileText,
  Search,
  Plus,
  History,
  FolderOpen,
  User,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Upload,
  RefreshCw,
  GitCommit,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DocumentosPage() {
  const { user } = useAuth();
  const {
    documentos,
    versoes,
    errorMsg,
    setErrorMsg,
    cadastrarDocumento,
    atualizarDocumento,
    enviarNovaVersao,
    restaurarVersaoAnterior,
  } = useDocumentos();

  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [setorFiltro, setSetorFiltro] = useState("todos");

  // State for Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"cadastrar" | "editar">("cadastrar");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docNome, setDocNome] = useState("");
  const [docCategoria, setDocCategoria] = useState("Manual Técnico");
  const [docSetor, setDocSetor] = useState("TI / Tecnologia");
  const [docStatus, setDocStatus] = useState<"Em Rascunho" | "Em Revisão" | "Aprovado">("Em Rascunho");

  // State for Version Modal
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionDesc, setVersionDesc] = useState("");

  // Selected document for Detail Panel
  const [activeDoc, setActiveDoc] = useState<DocumentoCorporativo | null>(null);

  const categoriasValidadas = ["Manual Técnico", "Relatório Financeiro", "Normas Internas", "Contrato Comercial", "Documentação RH"];
  const setoresValidados = ["TI / Tecnologia", "Jurídico", "Financeiro", "Logística", "Recursos Humanos"];

  const handleOpenCadastrar = () => {
    setErrorMsg(null);
    setDocNome("");
    setDocCategoria(categoriasValidadas[0]);
    setDocSetor(setoresValidados[0]);
    setDocStatus("Em Rascunho");
    setModalMode("cadastrar");
    setIsModalOpen(true);
  };

  const handleOpenEditar = (doc: DocumentoCorporativo) => {
    setErrorMsg(null);
    setSelectedDocId(doc.id);
    setDocNome(doc.nome);
    setDocCategoria(doc.categoria);
    setDocSetor(doc.setor);
    setDocStatus(doc.status);
    setModalMode("editar");
    setIsModalOpen(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!docNome.trim()) {
      setErrorMsg("Erro: O nome do documento não pode estar em branco.");
      return;
    }

    if (modalMode === "cadastrar") {
      const sucesso = cadastrarDocumento(docNome, docCategoria, docSetor, docStatus);
      if (sucesso) {
        setIsModalOpen(false);
      }
    } else if (modalMode === "editar" && selectedDocId) {
      const sucesso = atualizarDocumento(selectedDocId, docNome, docCategoria, docSetor, docStatus);
      if (sucesso) {
        setIsModalOpen(false);
        // Atualizar também o painel ativo se for o mesmo documento
        if (activeDoc?.id === selectedDocId) {
          const updated = documentos.find(d => d.id === selectedDocId);
          if (updated) setActiveDoc(updated);
        }
      }
    }
  };

  const handleCriarNovaVersao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc || !versionDesc.trim()) return;

    const sucesso = enviarNovaVersao(activeDoc.id, versionDesc);
    if (sucesso) {
      setIsVersionModalOpen(false);
      setVersionDesc("");
      // Refresh active document view
      const updated = documentos.find(d => d.id === activeDoc.id);
      if (updated) setActiveDoc(updated);
    }
  };

  const handleRestaurar = (versaoId: string, versaoNumero: number) => {
    if (!activeDoc) return;
    setErrorMsg(null);

    if (
      confirm(
        `AVISO DE SEGURANÇA:\nVocê está prestes a restaurar o documento para a versão ${versaoNumero}.0.\n\nEssa ação criará uma nova versão na timeline com o conteúdo restaurado. Deseja prosseguir?`
      )
    ) {
      const sucesso = restaurarVersaoAnterior(activeDoc.id, versaoId);
      if (sucesso) {
        // Refresh active document view
        const updated = documentos.find(d => d.id === activeDoc.id);
        if (updated) setActiveDoc(updated);
      }
    }
  };

  // Filter Documents list
  const filteredDocumentos = documentos.filter((d) => {
    const text = busca.toLowerCase();
    if (
      text &&
      !d.nome.toLowerCase().includes(text) &&
      !d.id.toLowerCase().includes(text) &&
      !d.usuarioResponsavel.toLowerCase().includes(text)
    ) {
      return false;
    }

    if (categoriaFiltro !== "todas" && d.categoria !== categoriaFiltro) {
      return false;
    }

    if (setorFiltro !== "todos" && d.setor !== setorFiltro) {
      return false;
    }

    return true;
  });

  const getDocVersions = (docId: string) => {
    return versoes.filter((v) => v.documentoId === docId).sort((a, b) => b.numeroVersao - a.numeroVersao);
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
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10 flex-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Gerenciamento de Documentos Corporativos
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Armazene e organize relatórios, manuais e contratos. Controle versões anteriores com segurança e rastreabilidade total (Conformidade técnica R069 e R070).
          </p>
        </div>
        <Button onClick={handleOpenCadastrar} size="sm" className="h-9 gap-1.5 cursor-pointer relative z-10">
          <Plus className="h-4 w-4" /> Cadastrar Documento
        </Button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Documents List */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Biblioteca Digital</h3>
              <p className="text-xs text-muted-foreground">Consulte, pesquise e filtre arquivos salvos no sistema</p>
            </div>
          </div>

          {/* Filtering toolbar */}
          <div className="p-4 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome ou ID..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background rounded-md pl-9 pr-4 py-2 text-xs border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded px-3 py-2 text-xs font-semibold transition-all text-foreground"
              >
                <option value="todas">Todas Categorias</option>
                {categoriasValidadas.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={setorFiltro}
                onChange={(e) => setSetorFiltro(e.target.value)}
                className="bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded px-3 py-2 text-xs font-semibold transition-all text-foreground"
              >
                <option value="todos">Todos Setores</option>
                {setoresValidados.map((set) => (
                  <option key={set} value={set}>
                    {set}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-accent/10 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Código</th>
                  <th className="p-4">Nome do Documento</th>
                  <th className="p-4">Categoria / Setor</th>
                  <th className="p-4 text-center">Versão Ativa</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredDocumentos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-semibold">
                      Nenhum documento encontrado na biblioteca.
                    </td>
                  </tr>
                ) : (
                  filteredDocumentos.map((doc) => {
                    const isSelected = activeDoc?.id === doc.id;
                    const isAprovado = doc.status === "Aprovado";
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setActiveDoc(doc)}
                        className={cn(
                          "hover:bg-accent/10 transition-colors cursor-pointer",
                          isSelected && "bg-primary/5 border-l-2 border-l-primary"
                        )}
                      >
                        <td className="p-4 font-mono font-bold text-foreground">{doc.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-foreground hover:underline">{doc.nome}</div>
                          <div className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3" /> {doc.usuarioResponsavel}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground font-semibold">
                          <div>{doc.categoria}</div>
                          <div className="text-[10px] font-medium leading-none text-muted-foreground/85">{doc.setor}</div>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-foreground">
                          v{doc.versao}
                        </td>
                        <td className="p-4 text-center">
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                            doc.status === "Aprovado"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : doc.status === "Em Revisão"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditar(doc)}
                            disabled={isAprovado}
                            className={cn(
                              "px-2 py-1 border rounded text-[10px] font-bold uppercase transition-all cursor-pointer",
                              isAprovado
                                ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                                : "bg-accent hover:bg-accent/80 border-border text-foreground"
                            )}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Details, History & Version Timeline */}
        <div className="lg:col-span-1 space-y-6">
          {activeDoc ? (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-muted text-muted-foreground border rounded">
                    {activeDoc.id}
                  </span>
                  <h3 className="font-bold text-base text-foreground pt-1 leading-snug">{activeDoc.nome}</h3>
                  <div className="text-[10px] text-muted-foreground">
                    Enviado em: {formatDate(activeDoc.dataUpload)}
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0",
                  activeDoc.status === "Aprovado"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : activeDoc.status === "Em Revisão"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-muted text-muted-foreground border-border"
                )}>
                  {activeDoc.status}
                </span>
              </div>

              {/* Version update triggers */}
              <div className="flex justify-between gap-3 pt-2">
                <Button
                  onClick={() => setIsVersionModalOpen(true)}
                  className="flex-1 text-[11px] font-bold h-9 gap-1 cursor-pointer"
                >
                  <Upload className="h-4 w-4" /> Enviar Nova Versão
                </Button>
              </div>

              {/* Errors Display in Detail view */}
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-shake">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Version History Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <History className="h-4 w-4 text-primary" /> Histórico de Versões
                </h4>

                <div className="relative border-l-2 border-border/80 pl-4 space-y-4 max-h-[300px] overflow-y-auto pt-1">
                  {getDocVersions(activeDoc.id).map((v) => {
                    return (
                      <div key={v.id} className="relative space-y-1">
                        {/* Dot indicator */}
                        <div className={cn(
                          "absolute h-3.5 w-3.5 rounded-full border-2 bg-card -left-[23px] top-1 flex items-center justify-center font-bold text-[7px] text-white",
                          v.ativa ? "border-emerald-500 bg-emerald-500" : "border-border bg-muted text-muted-foreground"
                        )}>
                          {v.numeroVersao}
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-foreground">Versão {v.numeroVersao}.0</span>
                          <span className={cn(
                            "px-1.5 py-0.2 rounded text-[8px] font-bold uppercase border",
                            v.statusVersao === "Ativa"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : v.statusVersao === "Restaurada"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}>
                            {v.statusVersao}
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-normal font-medium">{v.descricaoAlteracao}</p>
                        
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground font-mono">
                          <span>{v.usuarioResponsavel}</span>
                          <span>{formatDate(v.dataAlteracao)}</span>
                        </div>

                        {/* Restore actions for previous versions */}
                        {!v.ativa && (
                          <button
                            onClick={() => handleRestaurar(v.id, v.numeroVersao)}
                            className="text-[9px] text-primary font-bold hover:underline flex items-center gap-0.5 pt-1 cursor-pointer"
                          >
                            <RefreshCw className="h-3 w-3" /> Restaurar esta versão
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Document Modifications Logs */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <GitCommit className="h-4 w-4 text-primary" /> Logs de Auditoria
                </h4>
                <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-2 max-h-[150px] overflow-y-auto text-[10px] font-mono leading-normal text-muted-foreground">
                  {activeDoc.historicoAlteracoes.map((log, idx) => (
                    <div key={idx} className="pb-1.5 border-b border-border/40 last:border-0 last:pb-0 font-medium">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card shadow-sm p-8 text-center flex flex-col items-center justify-center space-y-3">
              <FileText className="h-10 w-10 text-muted-foreground/30" />
              <div className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                Nenhum documento selecionado. Escolha um arquivo na lista biblioteca lateral para gerenciar suas versões e histórico.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Create/Edit Document */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4 bg-accent/5">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {modalMode === "cadastrar" ? "Cadastrar Novo Documento" : "Editar Detalhes do Documento"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name (Editable) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Nome do Documento</label>
                <input
                  type="text"
                  value={docNome}
                  onChange={(e) => setDocNome(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all text-foreground"
                  placeholder="Ex: Política de Segurança de TI"
                />
              </div>

              {/* Category (Editable) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Categoria</label>
                <select
                  value={docCategoria}
                  onChange={(e) => setDocCategoria(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-semibold transition-all text-foreground"
                >
                  {categoriasValidadas.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector (Editable) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Setor Destinado</label>
                <select
                  value={docSetor}
                  onChange={(e) => setDocSetor(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-semibold transition-all text-foreground"
                >
                  {setoresValidados.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status (Editable, recommended to lock editing after approval) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
                <select
                  value={docStatus}
                  onChange={(e) => setDocStatus(e.target.value as any)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-semibold transition-all text-foreground"
                >
                  <option value="Em Rascunho">Em Rascunho</option>
                  <option value="Em Revisão">Em Revisão</option>
                  <option value="Aprovado">Aprovado</option>
                </select>
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Fechar
                </button>
                <Button type="submit" className="text-xs font-semibold cursor-pointer">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload New Version */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4 bg-accent/5">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload de Nova Versão
              </h3>
              <button
                onClick={() => setIsVersionModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCriarNovaVersao} className="p-6 space-y-4">
              <div className="bg-accent/10 border rounded-lg p-3 text-xs space-y-1">
                <div>Documento: <strong>{activeDoc?.nome}</strong></div>
                <div>Versão Atual: <strong>v{activeDoc?.versao}</strong></div>
                <div>Próxima Versão: <strong>v{(parseFloat(activeDoc?.versao || "1.0") + 1.0).toFixed(1)}</strong></div>
              </div>

              {/* Description of change (Editable, validates format) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Descrição da Alteração (Motivo)</label>
                <textarea
                  value={versionDesc}
                  onChange={(e) => setVersionDesc(e.target.value)}
                  className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-xs font-medium transition-all text-foreground min-h-[80px]"
                  placeholder="Descreva as modificações efetuadas nesta nova versão do arquivo..."
                  required
                />
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVersionModalOpen(false)}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <Button type="submit" className="text-xs font-semibold cursor-pointer">
                  Enviar Nova Versão
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
