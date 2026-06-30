"use client";

import React, { useState } from "react";
import { useCentrosCusto, CentroCusto, DEPARTAMENTOS_CENTRO, CATEGORIAS_CENTRO } from "@/hooks/useCentrosCusto";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Plus,
  AlertTriangle,
  FolderOpen,
  Calendar,
  User,
  Sliders,
  DollarSign,
  History,
  Lock,
  Edit2,
  Trash2,
  TrendingDown,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy despesas operacionais vinculadas para exibição (Simulação R088)
const mockDespesasVinculadas = [
  { id: "DESP-01", centroId: "CC-902102", descricao: "Licenças de software contábil", valor: 1450.00, data: "2026-06-15" },
  { id: "DESP-02", centroId: "CC-902102", descricao: "Papéis para impressão e impressoras", valor: 350.00, data: "2026-06-12" },
  { id: "DESP-03", centroId: "CC-104920", descricao: "Mensalidade do Servidor Cloud AWS", valor: 5400.00, data: "2026-06-14" },
  { id: "DESP-04", centroId: "CC-104920", descricao: "Licenças GitHub Enterprise", valor: 1200.00, data: "2026-06-10" }
];

export function CentrosCusto() {
  const { user } = useAuth();
  const {
    centros,
    error,
    setError,
    cadastrarCentro,
    editarCentro,
    verificarAcessoContador
  } = useCentrosCusto();

  const [codigoCentro, setCodigoCentro] = useState("");
  const [nomeCentro, setNomeCentro] = useState("");
  const [departamentoVinculado, setDepartamentoVinculado] = useState<CentroCusto["departamentoVinculado"]>("Financeiro");
  const [responsavelFinanceiro, setResponsavelFinanceiro] = useState("");
  const [categoriaFinanceira, setCategoriaFinanceira] = useState<CentroCusto["categoriaFinanceira"]>("Operacional");
  const [formCadastroOpen, setFormCadastroOpen] = useState(false);

  // Edição Fields
  const [centroParaEditar, setCentroParaEditar] = useState<CentroCusto | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDepto, setEditDepto] = useState<CentroCusto["departamentoVinculado"]>("Financeiro");
  const [editCategoria, setEditCategoria] = useState<CentroCusto["categoriaFinanceira"]>("Operacional");
  const [editStatus, setEditStatus] = useState<CentroCusto["statusCentro"]>("ativo");

  // Visualização de despesas vinculadas
  const [selectedCentroId, setSelectedCentroId] = useState<string | null>("CC-902102");

  const temAcesso = verificarAcessoContador();

  if (!temAcesso) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Acesso Restrito</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Apenas contadores e administradores de faturamento possuem permissão para configurar e gerenciar centros de custo.
          </p>
        </div>
      </div>
    );
  }

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!codigoCentro.trim() || !nomeCentro.trim() || !responsavelFinanceiro.trim()) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const sucesso = cadastrarCentro(
      codigoCentro,
      nomeCentro,
      departamentoVinculado,
      responsavelFinanceiro,
      categoriaFinanceira
    );

    if (sucesso) {
      setCodigoCentro("");
      setNomeCentro("");
      setDepartamentoVinculado("Financeiro");
      setResponsavelFinanceiro("");
      setCategoriaFinanceira("Operacional");
      setFormCadastroOpen(false);
    }
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centroParaEditar) return;
    setError(null);

    const sucesso = editarCentro(centroParaEditar.id, {
      nomeCentro: editNome,
      departamentoVinculado: editDepto,
      categoriaFinanceira: editCategoria,
      statusCentro: editStatus
    });

    if (sucesso) {
      setCentroParaEditar(null);
    }
  };

  const abrirEdicao = (c: CentroCusto) => {
    setCentroParaEditar(c);
    setEditNome(c.nomeCentro);
    setEditDepto(c.departamentoVinculado);
    setEditCategoria(c.categoriaFinanceira);
    setEditStatus(c.statusCentro);
    setError(null);
  };

  // Filtrar despesas do centro selecionado
  const activeCentro = centros.find(c => c.id === selectedCentroId);
  const despesasDoCentro = mockDespesasVinculadas.filter(d => d.centroId === selectedCentroId || d.centroId === activeCentro?.codigoCentro);

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

      {/* Ações */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-sm text-muted-foreground">Configure os orçamentos e centros de custos corporativos</h3>
        </div>
        <Button
          onClick={() => {
            setFormCadastroOpen(true);
            setError(null);
          }}
          className="h-9 shadow-md font-semibold gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Centro de Custo
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel Central: Centros de Custo */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base tracking-tight flex items-center gap-2 border-b border-border pb-3">
            <FolderOpen className="h-5 w-5 text-primary animate-pulse" />
            Departamentos e Centros de Custo Financeiros
          </h3>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">Código</th>
                  <th className="p-3 text-left">Nome / Categoria</th>
                  <th className="p-3 text-left">Setor</th>
                  <th className="p-3 text-left">Responsável</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {centros.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      Nenhum centro de custo cadastrado.
                    </td>
                  </tr>
                ) : (
                  centros.map((c) => {
                    const isSelected = selectedCentroId === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCentroId(c.id)}
                        className={cn(
                          "hover:bg-accent/5 cursor-pointer transition-colors",
                          isSelected && "bg-primary/5 hover:bg-primary/5 border-l-2 border-l-primary"
                        )}
                      >
                        <td className="p-3 font-mono font-bold text-foreground text-center">
                          {c.codigoCentro}
                          <span className="block text-[8px] text-muted-foreground font-normal">ID: {c.id}</span>
                        </td>
                        <td className="p-3 font-medium text-foreground text-left">
                          {c.nomeCentro}
                          <span className="block text-[9px] text-muted-foreground font-mono">{c.categoriaFinanceira}</span>
                        </td>
                        <td className="p-3 text-foreground/80 font-semibold text-left">{c.departamentoVinculado}</td>
                        <td className="p-3 text-muted-foreground font-medium text-left">{c.responsavelFinanceiro}</td>
                        <td className="p-3 text-center">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border",
                              c.statusCentro === "ativo"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            )}
                          >
                            {c.statusCentro}
                          </span>
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => abrirEdicao(c)}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title="Editar Centro"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Despesas vinculadas ao Centro de Custo selecionado */}
          {activeCentro && (
            <div className="pt-4 border-t border-border/80 space-y-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Despesas Vinculadas: <span className="text-primary font-mono">{activeCentro.nomeCentro} ({activeCentro.codigoCentro})</span>
              </h4>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-accent/20 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                      <th className="p-2.5 text-center">Código</th>
                      <th className="p-2.5 text-left">Descrição da Despesa</th>
                      <th className="p-2.5 text-center">Data Lançamento</th>
                      <th className="p-2.5 text-center">Valor Operacional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-mono text-muted-foreground">
                    {despesasDoCentro.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground font-sans">
                          Nenhuma despesa operacional cadastrada para este centro.
                        </td>
                      </tr>
                    ) : (
                      despesasDoCentro.map((d) => (
                        <tr key={d.id} className="hover:bg-accent/5">
                          <td className="p-2.5 font-bold text-foreground text-center">{d.id}</td>
                          <td className="p-2.5 font-sans text-foreground/80 text-left">{d.descricao}</td>
                          <td className="p-2.5 text-center" suppressHydrationWarning>{new Date(d.data).toLocaleDateString("pt-BR")}</td>
                          <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400 text-right">
                            R$ {d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Painel Direito: Histórico de Auditoria */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-primary shrink-0" />
              Auditoria de Alterações (Centro de Custos)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trilha técnica blindada registrando a parametrização e alterações de departamentos financeiros.
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
            {centros.flatMap((c) => c.historicoMovimentacoes.map((log, index) => ({ ...log, cId: c.id, cCod: c.codigoCentro, index })))
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((log) => (
                <div
                  key={`${log.cId}-${log.index}`}
                  className="p-3 rounded-xl border border-border/80 bg-accent/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="font-bold text-primary">{log.cCod}</span>
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

      {/* Modal Cadastrar Centro de Custo */}
      {formCadastroOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Cadastrar Centro de Custo
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
                  Código do Centro de Custo (Único)
                </label>
                <Input
                  required
                  placeholder="Ex: CC-COD-FIN"
                  value={codigoCentro}
                  onChange={(e) => setCodigoCentro(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Nome do Centro de Custo
                </label>
                <Input
                  required
                  placeholder="Ex: Custos do Setor Contábil"
                  value={nomeCentro}
                  onChange={(e) => setNomeCentro(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Departamento Vinculado
                  </label>
                  <select
                    value={departamentoVinculado}
                    onChange={(e) => setDepartamentoVinculado(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {DEPARTAMENTOS_CENTRO.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Categoria Financeira
                  </label>
                  <select
                    value={categoriaFinanceira}
                    onChange={(e) => setCategoriaFinanceira(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {CATEGORIAS_CENTRO.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Responsável Financeiro (Imutável pós-cadastro)
                </label>
                <Input
                  required
                  placeholder="Ex: Maria Santos"
                  value={responsavelFinanceiro}
                  onChange={(e) => setResponsavelFinanceiro(e.target.value)}
                  className="h-9 text-xs"
                />
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
                  Mapear Centro
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Centro de Custo */}
      {centroParaEditar && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                Mapeamento de Parametrizações
              </h3>
              <button
                onClick={() => setCentroParaEditar(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    ID Centro
                  </label>
                  <Input
                    disabled
                    value={centroParaEditar.id}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Código Centro (Imutável)
                  </label>
                  <Input
                    disabled
                    value={centroParaEditar.codigoCentro}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Nome do Centro de Custo
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
                    Departamento Vinculado
                  </label>
                  <select
                    value={editDepto}
                    onChange={(e) => setEditDepto(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {DEPARTAMENTOS_CENTRO.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Categoria Financeira
                  </label>
                  <select
                    value={editCategoria}
                    onChange={(e) => setEditCategoria(e.target.value as any)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {CATEGORIAS_CENTRO.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Responsável (Imutável)
                  </label>
                  <Input
                    disabled
                    value={centroParaEditar.responsavelFinanceiro}
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
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCentroParaEditar(null)}
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
