"use client";

import React, { useState } from "react";
import { useAtivos, Ativo, SETORES_VALIDOS } from "@/hooks/useAtivos";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layers,
  Plus,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Search,
  Edit,
  MapPin,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GerenciadorAtivos() {
  const { user } = useAuth();
  const {
    ativos,
    historicoMovimentacoes,
    error,
    setError,
    cadastrarAtivo,
    editarAtivo,
  } = useAtivos();

  // Cadastro Fields
  const [codigoPatrimonial, setCodigoPatrimonial] = useState("");
  const [descricao, setDescricao] = useState("");
  const [setorResponsavel, setSetorResponsavel] = useState(SETORES_VALIDOS[0]);
  const [localizacaoAtual, setLocalizacaoAtual] = useState("");
  const [formCadastroOpen, setFormCadastroOpen] = useState(false);

  // Edição Fields
  const [ativoParaEditar, setAtivoParaEditar] = useState<Ativo | null>(null);
  const [editDescricao, setEditDescricao] = useState("");
  const [editSetor, setEditSetor] = useState("");
  const [editLocalizacao, setEditLocalizacao] = useState("");
  const [editStatus, setEditStatus] = useState<Ativo["status"]>("ativo");

  // Filtros/Busca
  const [busca, setBusca] = useState("");

  // Obter endereços já cadastrados para autocompletar
  const localizacoesExistentes = React.useMemo(() => {
    if (!ativos) return [];
    return Array.from(new Set(ativos.map((a) => a.localizacaoAtual).filter(Boolean)));
  }, [ativos]);

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoPatrimonial || !descricao || !localizacaoAtual) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const sucesso = cadastrarAtivo(
      codigoPatrimonial,
      descricao,
      setorResponsavel,
      localizacaoAtual
    );
    if (sucesso) {
      setCodigoPatrimonial("");
      setDescricao("");
      setSetorResponsavel(SETORES_VALIDOS[0]);
      setLocalizacaoAtual("");
      setFormCadastroOpen(false);
    }
  };

  const handleEditar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ativoParaEditar) return;
    if (!editDescricao || !editLocalizacao) {
      setError("Campos obrigatórios de descrição e localização vazios.");
      return;
    }
    const sucesso = editarAtivo(ativoParaEditar.id, {
      descricao: editDescricao,
      setorResponsavel: editSetor,
      localizacaoAtual: editLocalizacao,
      status: editStatus,
    });
    if (sucesso) {
      setAtivoParaEditar(null);
    }
  };

  const abrirEdicao = (ativo: Ativo) => {
    setAtivoParaEditar(ativo);
    setEditDescricao(ativo.descricao);
    setEditSetor(ativo.setorResponsavel);
    setEditLocalizacao(ativo.localizacaoAtual);
    setEditStatus(ativo.status);
    setError(null);
  };

  const ativosFiltrados = ativos.filter(
    (a) =>
      a.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      a.codigoPatrimonial.toLowerCase().includes(busca.toLowerCase()) ||
      a.localizacaoAtual.toLowerCase().includes(busca.toLowerCase()) ||
      a.setorResponsavel.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Exibição do Erro */}
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

      {/* Cabeçalho de Ações */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ativos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>

        <Button
          onClick={() => {
            setFormCadastroOpen(true);
            setError(null);
          }}
          className="h-9 w-full sm:w-auto shadow-md font-semibold gap-2"
        >
          <Plus className="h-4 w-4" /> Cadastrar Novo Ativo
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de Ativos Cadastrados */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base tracking-tight flex items-center gap-2 border-b border-border pb-3">
            <Layers className="h-5 w-5 text-primary" />
            Inventário Patrimonial de Ativos
          </h3>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3">ID do Ativo</th>
                  <th className="p-3">Cód. Patrimonial</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Setor Responsável</th>
                  <th className="p-3">Localização</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Atualização</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ativosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      Nenhum ativo encontrado para os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  ativosFiltrados.map((a) => (
                    <tr key={a.id} className="hover:bg-accent/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-muted-foreground">{a.id}</td>
                      <td className="p-3 font-mono font-bold text-foreground">{a.codigoPatrimonial}</td>
                      <td className="p-3 font-medium text-foreground max-w-[150px] truncate" title={a.descricao}>
                        {a.descricao}
                      </td>
                      <td className="p-3 font-medium text-muted-foreground">{a.setorResponsavel}</td>
                      <td className="p-3 text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /> {a.localizacaoAtual}
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                            a.status === "ativo"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : a.status === "em_manutencao"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {a.status === "em_manutencao" ? "Em Manutenção" : a.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <span className="block text-[10px]">
                          {new Date(a.dataAtualizacao).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="block text-[9px] text-muted-foreground/80">Por: {a.responsavel}</span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => abrirEdicao(a)}
                          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="Editar Ativo"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Histórico Imutável de Movimentações */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <FolderOpen className="h-4.5 w-4.5 text-primary" />
              Histórico de Movimentações (Auditável)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rastreabilidade total das transferências físicas e alterações situacionais dos ativos.
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
            {historicoMovimentacoes.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                Nenhum log de movimentação registrado.
              </div>
            ) : (
              historicoMovimentacoes.map((mov) => (
                <div
                  key={mov.id}
                  className="p-3.5 rounded-xl border border-border/80 bg-accent/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-primary">
                      {mov.codigoPatrimonial}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      Ref: {mov.ativoId}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-foreground">
                      Alteração em: <span className="text-primary">{mov.campoAlterado}</span>
                    </p>
                    <div className="p-2 rounded bg-card border border-border/40 text-[10px] space-y-1 text-muted-foreground">
                      <div>
                        <strong>De:</strong> {mov.valorAntigo}
                      </div>
                      <div className="border-t border-border/40 pt-1 mt-1 text-foreground">
                        <strong>Para:</strong> {mov.valorNovo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/20 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(mov.dataMovimentacao).toLocaleString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <User className="h-3 w-3" /> {mov.responsavel}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Cadastro de Ativo */}
      {formCadastroOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Cadastrar Ativo Patrimonial
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
                  Código Patrimonial (Único)
                </label>
                <Input
                  required
                  placeholder="Ex: PAT-CNC-105"
                  value={codigoPatrimonial}
                  onChange={(e) => setCodigoPatrimonial(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Descrição do Ativo
                </label>
                <Input
                  required
                  placeholder="Ex: Torno Mecânico Industrial"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Setor Responsável
                  </label>
                  <select
                    value={setorResponsavel}
                    onChange={(e) => setSetorResponsavel(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {SETORES_VALIDOS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Localização Atual
                  </label>
                  <Input
                    required
                    placeholder="Ex: Galpão A - Ala Norte"
                    value={localizacaoAtual}
                    onChange={(e) => setLocalizacaoAtual(e.target.value)}
                    list="ativos-localizacoes-list"
                    className="h-9 text-xs"
                  />
                  <datalist id="ativos-localizacoes-list">
                    {localizacoesExistentes.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>
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
                  Cadastrar Ativo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edição de Ativo */}
      {ativoParaEditar && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden flex flex-col transform scale-100 animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Editar Ativo Patrimonial
              </h3>
              <button
                onClick={() => setAtivoParaEditar(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    ID do Ativo (Protegido)
                  </label>
                  <Input
                    disabled
                    value={ativoParaEditar.id}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Código Patrimonial (Imutável)
                  </label>
                  <Input
                    disabled
                    value={ativoParaEditar.codigoPatrimonial}
                    className="h-9 text-xs bg-accent/20 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Descrição do Ativo
                </label>
                <Input
                  required
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Setor Responsável
                  </label>
                  <select
                    value={editSetor}
                    onChange={(e) => setEditSetor(e.target.value)}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {SETORES_VALIDOS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Localização Atual
                  </label>
                  <Input
                    required
                    value={editLocalizacao}
                    onChange={(e) => setEditLocalizacao(e.target.value)}
                    list="ativos-localizacoes-list-edit"
                    className="h-9 text-xs"
                  />
                  <datalist id="ativos-localizacoes-list-edit">
                    {localizacoesExistentes.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Status do Ativo
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Ativo["status"])}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  <option value="ativo">Ativo / Operacional</option>
                  <option value="em_manutencao">Em Manutenção</option>
                  <option value="baixado">Baixado / Desativado</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAtivoParaEditar(null)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-9 text-xs font-semibold">
                  Salvar Edição
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
