"use client";

import React, { useState } from "react";
import { useFornecedores, Fornecedor } from "@/hooks/useFornecedores";
import { Search, PlusCircle, CheckCircle2, AlertTriangle, Trash2, ShieldCheck, Mail, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CadastroFornecedores() {
  const {
    fornecedores,
    errorMessage,
    limparErro,
    adicionarFornecedor,
    atualizarFornecedorStatus,
    removerFornecedor
  } = useFornecedores();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contato, setContato] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo">("ativo");

  const formatarCnpj = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 14) {
      return digits
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return val;
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatarCnpj(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();
    setSuccessMsg(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s()+-]{8,20}$/;

    if (!razaoSocial.trim()) {
      return;
    }

    if (!cnpj.trim()) {
      return;
    }

    if (!contato.trim()) {
      return;
    }

    const isValidContato = emailRegex.test(contato) || phoneRegex.test(contato);
    if (!isValidContato) {
      alert("Contato inválido. Por favor insira um e-mail válido ou telefone.");
      return;
    }

    const sucesso = adicionarFornecedor({
      razaoSocial: razaoSocial.trim(),
      cnpj: cnpj.trim(),
      contato: contato.trim(),
      status
    });

    if (sucesso) {
      setSuccessMsg("Fornecedor cadastrado com sucesso!");
      setRazaoSocial("");
      setCnpj("");
      setContato("");
      setStatus("ativo");
      setFormOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const fornecedoresFiltrados = fornecedores.filter((f) => {
    const matchesBusca =
      f.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
      f.cnpj.includes(busca);

    const matchesStatus =
      filtroStatus === "todos" || f.status === filtroStatus;

    return matchesBusca && matchesStatus;
  });

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border bg-accent/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Fornecedores Cadastrados</h3>
              <p className="text-xs text-muted-foreground">Gerenciamento de parceiros comerciais de insumos</p>
            </div>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <input
              type="text"
              placeholder="Buscar por razão ou CNPJ..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-2.5 py-1 text-xs text-foreground"
            />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-2 py-1 text-xs text-foreground cursor-pointer"
            >
              <option value="todos">Status: Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {successMsg && (
            <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {fornecedoresFiltrados.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhum fornecedor encontrado com os filtros aplicados.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">Razão Social</th>
                  <th className="p-3 text-center">CNPJ</th>
                  <th className="p-3 text-center">Contato</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Responsável</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {fornecedoresFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-3 font-bold text-foreground text-center">
                      <div className="flex flex-col">
                        <span>{item.razaoSocial}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">{item.id}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-center">{item.cnpj}</td>
                    <td className="p-3 text-center">
                      <span className="flex items-center gap-1">
                        {item.contato.includes("@") ? (
                          <Mail className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Phone className="h-3 w-3 text-muted-foreground" />
                        )}
                        {item.contato}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          atualizarFornecedorStatus(item.id, e.target.value as Fornecedor["status"])
                        }
                        className={cn(
                          "bg-accent/60 border border-border rounded px-2 py-0.5 text-[10px] font-bold uppercase cursor-pointer focus:outline-none",
                          item.status === "ativo"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-destructive"
                        )}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </td>
                    <td className="p-3 text-muted-foreground text-left">{item.usuarioResponsavel}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => removerFornecedor(item.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                        title="Remover Fornecedor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Novo Fornecedor</h3>
            <p className="text-xs text-muted-foreground">Cadastrar parceiro comercial no sistema</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Razão Social</label>
            <input
              type="text"
              required
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              placeholder="Ex: Inova Tecnologia S.A."
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">CNPJ</label>
            <input
              type="text"
              required
              maxLength={18}
              value={cnpj}
              onChange={handleCnpjChange}
              placeholder="00.000.000/0000-00"
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Contato Comercial</label>
            <input
              type="text"
              required
              value={contato}
              onChange={(e) => setContato(e.target.value)}
              placeholder="E-mail ou Telefone com DDD"
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border focus:border-primary rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Status Inicial</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-accent/30 hover:bg-accent/50 focus:bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <Button type="submit" className="w-full h-8 text-xs font-semibold">
            Salvar Fornecedor
          </Button>
        </form>
      </div>
    </div>
  );
}
