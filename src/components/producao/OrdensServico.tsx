import React, { useState } from "react";
import { useOrdensServico, OrdemServico } from "@/hooks/useOrdensServico";
import { useFuncionarios } from "@/hooks/useFuncionarios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wrench, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrdensServico() {
  const {
    ordensServico,
    adicionarOrdemServico,
    atualizarStatusOrdemServico,
    removerOrdemServico,
    errorMessage,
  } = useOrdensServico();

  const { funcionarios } = useFuncionarios();
  const colaboradoresAtivos = funcionarios.filter((colab) => colab.status === "ativo");

  const [tipoServico, setTipoServico] = useState("");
  const [selectedResponsavel, setSelectedResponsavel] = useState<string | null>(null);
  const responsavel = selectedResponsavel || (colaboradoresAtivos.length > 0 ? colaboradoresAtivos[0].nome : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adicionarOrdemServico(tipoServico, responsavel);
    if (success) {
      setTipoServico("");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Ordens de Serviço e Manutenção</h3>
            <p className="text-xs text-muted-foreground">Acompanhamento e controle de atividades operacionais</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {ordensServico.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhuma ordem de serviço cadastrada.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3">ID</th>
                  <th className="p-3">Tipo de Serviço</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Abertura</th>
                  <th className="p-3">Conclusão</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ordensServico.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-3 font-mono font-semibold">{item.id}</td>
                    <td className="p-3 font-medium text-foreground">{item.tipoServico}</td>
                    <td className="p-3 text-muted-foreground font-semibold">{item.responsavelOperacional}</td>
                    <td className="p-3">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          atualizarStatusOrdemServico(item.id, e.target.value as OrdemServico["status"])
                        }
                        className={cn(
                          "bg-accent/60 border border-border rounded px-2.5 py-1 text-xs cursor-pointer focus:outline-none uppercase font-bold",
                          item.status === "concluida"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : item.status === "em_progresso"
                            ? "text-blue-600 dark:text-blue-400"
                            : item.status === "cancelada"
                            ? "text-destructive"
                            : "text-amber-600 dark:text-amber-500"
                        )}
                      >
                        <option value="aberta">Aberta</option>
                        <option value="em_progresso">Em Progresso</option>
                        <option value="concluida">Concluída</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(item.dataAbertura).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3 text-muted-foreground font-medium">
                      {item.dataConclusao ? new Date(item.dataConclusao).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removerOrdemServico(item.id)}
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
            <h3 className="font-semibold text-sm">Abrir Ordem de Serviço</h3>
            <p className="text-xs text-muted-foreground">Registrar atividade operacional</p>
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
              Tipo de Serviço
            </label>
            <Input
              value={tipoServico}
              onChange={(e) => setTipoServico(e.target.value)}
              placeholder="Ex: Manutenção Preventiva"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Responsável Operacional
            </label>
            {colaboradoresAtivos.length === 0 ? (
              <div className="text-xs text-muted-foreground">Nenhum funcionário ativo cadastrado.</div>
            ) : (
              <select
                value={responsavel}
                onChange={(e) => setSelectedResponsavel(e.target.value)}
                className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                {colaboradoresAtivos.map((colab) => (
                  <option key={colab.id} value={colab.nome}>
                    {colab.nome} ({colab.cargo})
                  </option>
                ))}
              </select>
            )}
          </div>

          <Button type="submit" className="w-full h-9 text-xs font-semibold shadow-md shadow-primary/20">
            Criar Ordem de Serviço
          </Button>
        </form>
      </div>
    </div>
  );
}
