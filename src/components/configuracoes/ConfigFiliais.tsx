import React, { useState } from "react";
import { Building2, PlusCircle, Trash2 } from "lucide-react";
import { useFiliais } from "@/hooks/useFiliais";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfigFiliais() {
  const {
    filiais,
    adicionarFilial,
    atualizarStatusFilial,
    removerFilial,
    errorMessage,
  } = useFiliais();

  const [nome, setNome] = useState("");
  const [centroCusto, setCentroCusto] = useState("");
  const [vinculacao, setVinculacao] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adicionarFilial(nome, centroCusto, vinculacao);
    if (success) {
      setNome("");
      setCentroCusto("");
      setVinculacao("");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Filiais e Unidades de Negócio</h3>
            <p className="text-xs text-muted-foreground">Listagem e controle operacional</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {filiais.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhuma unidade cadastrada.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">ID</th>
                  <th className="p-3 text-left">Nome da Unidade</th>
                  <th className="p-3 text-center">Centro de Custo</th>
                  <th className="p-3 text-center">Vinculação (CNPJ)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filiais.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-3 font-mono font-semibold text-center">{item.id}</td>
                    <td className="p-3 font-medium text-foreground text-left">{item.nome}</td>
                    <td className="p-3 text-muted-foreground font-medium text-right">{item.centroCusto}</td>
                    <td className="p-3 text-muted-foreground font-mono text-center">{item.vinculacaoOrganizacional}</td>
                    <td className="p-3 text-center">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                          item.status === "ativo"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 space-x-2 text-center">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() =>
                          atualizarStatusFilial(item.id, item.status === "ativo" ? "inativo" : "ativo")
                        }
                        className={cn(
                          "h-7 px-2 text-[10px] font-semibold",
                          item.status === "ativo" ? "text-destructive hover:bg-destructive/10" : "text-emerald-600 hover:bg-emerald-500/10"
                        )}
                      >
                        {item.status === "ativo" ? "Inativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removerFilial(item.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Nova Unidade</h3>
            <p className="text-xs text-muted-foreground">Cadastrar filial ou centro operacional</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Nome da Unidade
            </label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Filial Sul"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Centro de Custo
            </label>
            <Input
              value={centroCusto}
              onChange={(e) => setCentroCusto(e.target.value)}
              placeholder="Ex: Administrativo Sul"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Vinculação Organizacional (CNPJ / Código)
            </label>
            <Input
              value={vinculacao}
              onChange={(e) => setVinculacao(e.target.value)}
              placeholder="Ex: 12.345.678/0003-03"
              className="h-9 text-xs"
              required
            />
          </div>

          <Button type="submit" className="w-full h-9 text-xs font-semibold shadow-md shadow-primary/20">
            Cadastrar Filial
          </Button>
        </form>
      </div>
    </div>
  );
}
