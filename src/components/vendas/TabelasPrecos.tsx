"use client";

import React, { useState } from "react";
import { useTabelasPrecos, TabelaPreco, REGIOES_TABELA } from "@/hooks/useTabelasPrecos";
import { useClientes } from "@/hooks/useClientes";
import { useEstoque } from "@/hooks/useEstoque";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tag,
  Plus,
  AlertTriangle,
  History,
  Lock,
  User,
  Sliders,
  MapPin,
  Package,
  ShieldCheck,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TabelasPrecos() {
  const { user } = useAuth();
  const {
    tabelas,
    error,
    setError,
    cadastrarTabela,
    editarTabela,
    verificarAcessoComercial
  } = useTabelasPrecos();

  const { clientes } = useClientes();
  const { estoque } = useEstoque();

  // Cadastro Fields
  const [codigoTabela, setCodigoTabela] = useState("");
  const [nomeTabela, setNomeTabela] = useState("");
  const [regiaoAplicavel, setRegiaoAplicavel] = useState<TabelaPreco["regiaoAplicavel"]>("Sul");
  const [clienteVinculado, setClienteVinculado] = useState("");
  const [produtoAssociado, setProdutoAssociado] = useState("");
  const [formCadastroOpen, setFormCadastroOpen] = useState(false);

  // Edição Fields
  const [tabelaParaEditar, setTabelaParaEditar] = useState<TabelaPreco | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editRegiao, setEditRegiao] = useState<TabelaPreco["regiaoAplicavel"]>("Sul");
  const [editProduto, setEditProduto] = useState("");
  const [editStatus, setEditStatus] = useState<TabelaPreco["statusTabela"]>("ativa");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const temAcesso = verificarAcessoComercial();

  if (!temAcesso) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Acesso Restrito</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Apenas profissionais de vendas, gerentes comerciais e administradores possuem permissão para configurar tabelas de preços.
          </p>
        </div>
      </div>
    );
  }

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!codigoTabela.trim() || !nomeTabela.trim() || !clienteVinculado || !produtoAssociado) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const sucesso = cadastrarTabela(
      codigoTabela,
      nomeTabela,
      regiaoAplicavel,
      clienteVinculado,
      produtoAssociado
    );

    if (sucesso) {
      setCodigoTabela("");
      setNomeTabela("");
      setRegiaoAplicavel("Sul");
      setClienteVinculado("");
      setProdutoAssociado("");
      setFormCadastroOpen(false);
      setSuccessMsg("Tabela de preços cadastrada com sucesso!");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabelaParaEditar) return;
    setError(null);
    setSuccessMsg(null);

    const sucesso = editarTabela(tabelaParaEditar.id, {
      nomeTabela: editNome,
      regiaoAplicavel: editRegiao,
      produtoAssociado: editProduto,
      statusTabela: editStatus
    });

    if (sucesso) {
      setTabelaParaEditar(null);
      setSuccessMsg("Tabela de preços atualizada com sucesso!");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const abrirEdicao = (t: TabelaPreco) => {
    setTabelaParaEditar(t);
    setEditNome(t.nomeTabela);
    setEditRegiao(t.regiaoAplicavel);
    setEditProduto(t.produtoAssociado);
    setEditStatus(t.statusTabela);
    setError(null);
  };

  const getClienteNome = (id: string) => {
    return clientes.find(c => c.id === id)?.nome || id;
  };

  const getProdutoNome = (id: string) => {
    return estoque.find(p => p.id === id)?.nome || id;
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de Erro */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive animate-in fade-in duration-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:opacity-80 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mensagem de Sucesso */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-sm text-muted-foreground">Configure e parametrize as regras de precificação comercial flexível</h3>
        </div>
        <Button
          onClick={() => {
            setFormCadastroOpen(true);
            setError(null);
          }}
          className="h-9 shadow-md font-semibold gap-2"
        >
          <Plus className="h-4 w-4" /> Configurar Nova Tabela
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel Central: Tabelas Ativas */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base tracking-tight flex items-center gap-2 border-b border-border pb-3">
            <Tag className="h-5 w-5 text-primary animate-pulse" />
            Tabelas de Preços Comerciais
          </h3>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3">Código</th>
                  <th className="p-3">Nome da Tabela</th>
                  <th className="p-3">Cliente Alvo</th>
                  <th className="p-3">Produto Vinculado</th>
                  <th className="p-3">Região / Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tabelas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      Nenhuma tabela de preços configurada.
                    </td>
                  </tr>
                ) : (
                  tabelas.map((t) => (
                    <tr key={t.id} className="hover:bg-accent/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-foreground">
                        {t.codigoTabela}
                        <span className="block text-[8px] text-muted-foreground font-normal">ID: {t.id}</span>
                      </td>
                      <td className="p-3 font-medium text-foreground">{t.nomeTabela}</td>
                      <td className="p-3 font-semibold text-foreground/80 flex items-center gap-1.5 mt-1 border-none">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {getClienteNome(t.clienteVinculado)}
                      </td>
                      <td className="p-3 text-muted-foreground font-medium flex items-center gap-1.5 mt-1 border-none">
                        <Package className="h-3.5 w-3.5 text-primary" />
                        {getProdutoNome(t.produtoAssociado)}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-primary flex items-center gap-1 font-sans">
                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                            {t.regiaoAplicavel}
                          </span>
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase w-fit border",
                              t.statusTabela === "ativa"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            )}
                          >
                            {t.statusTabela}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => abrirEdicao(t)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="Editar Tabela"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painel Direito: Histórico de Alterações */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-primary shrink-0" />
              Auditoria de Alterações (Tabela Preços)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trilha técnica blindada registrando parametrizações comerciais e de regras de precificação.
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
            {tabelas.flatMap((t) => t.historicoAlteracoes.map((log, index) => ({ ...log, tId: t.id, tCod: t.codigoTabela, index })))
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((log) => (
                <div
                  key={`${log.tId}-${log.index}`}
                  className="p-3 rounded-xl border border-border/80 bg-accent/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="font-bold text-primary">{log.tCod}</span>
                    <span className="text-muted-foreground">Campo: {log.campoAlterado}</span>
                  </div>

                  <div className="space-y-1 font-sans">
                    <p className="font-semibold text-foreground/80 flex items-center gap-1">
                      <User className="h-3 w-3" /> Alterado por: {log.usuario}
                    </p>
                    <div className="p-2 rounded bg-card border border-border/30 text-[9px] font-mono leading-relaxed space-y-0.5">
                      {log.valorAntigo !== "-" && <div><strong>De:</strong> {log.valorAntigo}</div>}
                      <div><strong>Para:</strong> {log.valorNovo}</div>
                    </div>
                  </div>

                  <div className="text-[8px] text-muted-foreground font-mono text-right">
                    {new Date(log.timestamp).toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal Cadastrar Tabela */}
      {formCadastroOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Configurar Tabela de Preços
              </h3>
              <button
                onClick={() => setFormCadastroOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCadastrar} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Código da Tabela (Único)
                </label>
                <Input
                  required
                  placeholder="Ex: TP-SUL-TEC"
                  value={codigoTabela}
                  onChange={(e) => setCodigoTabela(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Nome da Tabela
                </label>
                <Input
                  required
                  placeholder="Ex: Tabela Especial Regional Sul"
                  value={nomeTabela}
                  onChange={(e) => setNomeTabela(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Região Aplicável
                  </label>
                  <select
                    value={regiaoAplicavel}
                    onChange={(e) => setRegiaoAplicavel(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {REGIOES_TABELA.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Produto Associado
                  </label>
                  <select
                    value={produtoAssociado}
                    onChange={(e) => setProdutoAssociado(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    <option value="">Selecione um Produto...</option>
                    {estoque.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Cliente Vinculado (Imutável pós-cadastro)
                </label>
                <select
                  value={clienteVinculado}
                  onChange={(e) => setClienteVinculado(e.target.value)}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  <option value="">Selecione um Cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.documento})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormCadastroOpen(false)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Mapear Tabela
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Tabela */}
      {tabelaParaEditar && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                Mapeamento Comercial
              </h3>
              <button
                onClick={() => setTabelaParaEditar(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    ID Tabela
                  </label>
                  <Input
                    disabled
                    value={tabelaParaEditar.id}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Código Tabela (Imutável)
                  </label>
                  <Input
                    disabled
                    value={tabelaParaEditar.codigoTabela}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Nome da Tabela
                </label>
                <Input
                  required
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Região Aplicável
                  </label>
                  <select
                    value={editRegiao}
                    onChange={(e) => setEditRegiao(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {REGIOES_TABELA.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Produto Associado
                  </label>
                  <select
                    value={editProduto}
                    onChange={(e) => setEditProduto(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {estoque.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Cliente (Imutável)
                  </label>
                  <Input
                    disabled
                    value={getClienteNome(tabelaParaEditar.clienteVinculado)}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    <option value="ativa">Ativa</option>
                    <option value="inativa">Inativa</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTabelaParaEditar(null)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Confirmar Edição
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
