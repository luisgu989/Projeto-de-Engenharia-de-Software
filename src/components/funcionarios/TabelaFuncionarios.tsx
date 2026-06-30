"use client";

import React, { useState } from "react";
import { Funcionario } from "@/hooks/useFuncionarios";
import { Search, Plus, Edit, Trash2, Info, Calendar, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TabelaFuncionariosProps {
  funcionarios: Funcionario[];
  busca: string;
  setBusca: (busca: string) => void;
  onAdicionarFuncionario: (func: Omit<Funcionario, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">) => boolean;
  onAtualizarFuncionario: (id: string, func: Omit<Funcionario, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">) => boolean;
  onRemoverFuncionario: (id: string) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

const DEPARTAMENTOS = [
  "Administrativo",
  "Vendas",
  "Tecnologia",
  "Financeiro",
  "Logística",
  "Recursos Humanos",
];

const CARGOS = [
  "Gerente",
  "Analista",
  "Assistente",
  "Diretor",
  "Vendedor",
  "Suporte",
];

export function TabelaFuncionarios({
  funcionarios,
  busca,
  setBusca,
  onAdicionarFuncionario,
  onAtualizarFuncionario,
  onRemoverFuncionario,
  error,
  setError,
}: TabelaFuncionariosProps) {
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [edicaoOpen, setEdicaoOpen] = useState(false);
  const [auditoriaOpen, setAuditoriaOpen] = useState<Funcionario | null>(null);
  const [selectedFunc, setSelectedFunc] = useState<Funcionario | null>(null);

  // Form states (Cadastro)
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("Analista");
  const [departamento, setDepartamento] = useState("Administrativo");
  const [status, setStatus] = useState<"ativo" | "inativo">("ativo");
  const [dataAdmissao, setDataAdmissao] = useState("");

  // Form states (Edição)
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCargo, setEditCargo] = useState("");
  const [editDepartamento, setEditDepartamento] = useState("");
  const [editStatus, setEditStatus] = useState<"ativo" | "inativo">("ativo");
  const [editDataAdmissao, setEditDataAdmissao] = useState("");

  const resetForm = () => {
    setNome("");
    setEmail("");
    setCargo("Analista");
    setDepartamento("Administrativo");
    setStatus("ativo");
    setDataAdmissao("");
    setError(null);
  };

  const handleCadastroSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (nome.trim().length < 3) {
      setError("O nome do funcionário deve ter pelo menos 3 caracteres.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    if (!dataAdmissao) {
      setError("Por favor, insira a data de admissão.");
      return;
    }

    const success = onAdicionarFuncionario({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      cargo,
      departamento,
      status,
      dataAdmissao,
    });

    if (success) {
      resetForm();
      setCadastroOpen(false);
    }
  };

  const handleEdicaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFunc) return;

    // Validations
    if (editNome.trim().length < 3) {
      setError("O nome do funcionário deve ter pelo menos 3 caracteres.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail.trim())) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    if (!editDataAdmissao) {
      setError("Por favor, insira a data de admissão.");
      return;
    }

    const success = onAtualizarFuncionario(selectedFunc.id, {
      nome: editNome.trim(),
      email: editEmail.trim().toLowerCase(),
      cargo: editCargo,
      departamento: editDepartamento,
      status: editStatus,
      dataAdmissao: editDataAdmissao,
    });

    if (success) {
      setError(null);
      setEdicaoOpen(false);
      setSelectedFunc(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  const formatTimestamp = (tsStr: string) => {
    if (!tsStr) return "";
    return new Date(tsStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por funcionário, e-mail ou departamento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-card hover:bg-accent/30 focus:bg-background rounded-md pl-9 pr-4 py-2 text-sm border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none transition-all"
          />
        </div>

        <Button
          onClick={() => {
            resetForm();
            setCadastroOpen(true);
          }}
          className="flex items-center gap-2 shadow-md shadow-primary/10 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Funcionário
        </Button>
      </div>

      {/* Main Table Grid */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-center">ID</th>
                <th className="p-4 text-left">NOME / E-MAIL</th>
                <th className="p-4 text-left">CARGO / DEPARTAMENTO</th>
                <th className="p-4 text-center">ADMISSÃO</th>
                <th className="p-4 text-center">STATUS</th>
                <th className="p-4 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {funcionarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum funcionário cadastrado ou correspondente à busca.
                  </td>
                </tr>
              ) : (
                funcionarios.map((func) => (
                  <tr key={func.id} className="hover:bg-accent/20 transition-colors">
                    <td className="p-4 font-mono font-semibold text-foreground/80 text-center">{func.id}</td>
                    <td className="p-4 text-left">
                      <div className="font-medium text-foreground">{func.nome}</div>
                      <div className="text-xs text-muted-foreground font-mono">{func.email}</div>
                    </td>
                    <td className="p-4 text-left">
                      <div className="font-medium text-foreground">{func.cargo}</div>
                      <div className="text-xs text-muted-foreground">{func.departamento}</div>
                    </td>
                    <td className="p-4 text-muted-foreground text-center">
                      {formatDate(func.dataAdmissao)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full",
                          func.status === "ativo"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {func.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Auditoria Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAuditoriaOpen(func)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                          title="Histórico de Auditoria"
                        >
                          <Info className="h-4 w-4" />
                        </Button>

                        {/* Editar Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedFunc(func);
                            setEditNome(func.nome);
                            setEditEmail(func.email);
                            setEditCargo(func.cargo);
                            setEditDepartamento(func.departamento);
                            setEditStatus(func.status);
                            setEditDataAdmissao(func.dataAdmissao);
                            setError(null);
                            setEdicaoOpen(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent"
                          title="Editar Cadastro"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Remover Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Deseja remover o funcionário ${func.nome}?`)) {
                              onRemoverFuncionario(func.id);
                            }
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-accent"
                          title="Excluir Colaborador"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Cadastro */}
      {cadastroOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold">Cadastrar Novo Funcionário</h3>
              <button
                onClick={() => {
                  setError(null);
                  setCadastroOpen(false);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCadastroSubmit} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="joao.silva@erppro.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Cargo</label>
                  <select
                    value={cargo}
                    onChange={(e) => {
                      setCargo(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    {CARGOS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Departamento</label>
                  <select
                    value={departamento}
                    onChange={(e) => {
                      setDepartamento(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    {DEPARTAMENTOS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Data de Admissão</label>
                  <input
                    type="date"
                    required
                    value={dataAdmissao}
                    onChange={(e) => {
                      setDataAdmissao(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Status Inicial</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as "ativo" | "inativo");
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setCadastroOpen(false);
                  }}
                  className="text-xs"
                >
                  Fechar
                </Button>
                <Button type="submit" className="text-xs">
                  Cadastrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Edição */}
      {edicaoOpen && selectedFunc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold">Editar Dados do Funcionário</h3>
              <button
                onClick={() => {
                  setError(null);
                  setEdicaoOpen(false);
                  setSelectedFunc(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEdicaoSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">ID (Imutável)</label>
                  <input
                    type="text"
                    disabled
                    value={selectedFunc.id}
                    className="w-full bg-accent/20 border border-border text-muted-foreground rounded-md px-3 py-2 text-sm cursor-not-allowed font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => {
                      setEditStatus(e.target.value as "ativo" | "inativo");
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editNome}
                  onChange={(e) => {
                    setEditNome(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Cargo</label>
                  <select
                    value={editCargo}
                    onChange={(e) => {
                      setEditCargo(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    {CARGOS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Departamento</label>
                  <select
                    value={editDepartamento}
                    onChange={(e) => {
                      setEditDepartamento(e.target.value);
                      setError(null);
                    }}
                    className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm"
                  >
                    {DEPARTAMENTOS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Data de Admissão</label>
                <input
                  type="date"
                  required
                  value={editDataAdmissao}
                  onChange={(e) => {
                    setEditDataAdmissao(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setEdicaoOpen(false);
                    setSelectedFunc(null);
                  }}
                  className="text-xs"
                >
                  Fechar
                </Button>
                <Button type="submit" className="text-xs">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Histórico de Auditoria */}
      {auditoriaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Histórico de Auditoria
              </h3>
              <button
                onClick={() => setAuditoriaOpen(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                Fechar
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div className="text-xs space-y-1">
                <div className="text-muted-foreground">Funcionário selecionado:</div>
                <div className="font-semibold text-sm">{auditoriaOpen.nome}</div>
                <div className="text-[10px] font-mono text-muted-foreground font-semibold">ID: {auditoriaOpen.id}</div>
                <div className="text-[10px] font-mono text-muted-foreground font-semibold">E-mail: {auditoriaOpen.email}</div>
              </div>

              <div className="space-y-4 border-l border-border pl-4 ml-2 relative">
                {/* Evento de Criação */}
                <div className="relative space-y-1">
                  <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-card" />
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Criado por {auditoriaOpen.criadoPor || "Admin User"}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {auditoriaOpen.criadoEm ? formatTimestamp(auditoriaOpen.criadoEm) : "N/A"}
                  </div>
                </div>

                {/* Evento de Atualização */}
                {auditoriaOpen.atualizadoEm && (
                  <div className="relative space-y-1">
                    <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-card" />
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      Última atualização por {auditoriaOpen.atualizadoPor || "Admin User"}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatTimestamp(auditoriaOpen.atualizadoEm)}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={() => setAuditoriaOpen(null)} className="w-full sm:w-auto text-xs">
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
