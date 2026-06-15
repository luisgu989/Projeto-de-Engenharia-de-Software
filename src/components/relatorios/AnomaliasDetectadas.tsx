import React, { useState } from "react";
import { useAnomalias, OcorrenciaAnomalia } from "@/hooks/useAnomalias";
import { AlertOctagon, Clock, CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnomaliasDetectadas() {
  const { anomalias, atualizarStatusAnomalia } = useAnomalias();

  const [filtroArea, setFiltroArea] = useState<string>("todas");
  const [filtroCriticidade, setFiltroCriticidade] = useState<string>("todas");
  const [selectedAnomalia, setSelectedAnomalia] = useState<OcorrenciaAnomalia | null>(null);

  const anomaliasFiltradas = anomalias.filter((item) => {
    const matchesArea = filtroArea === "todas" || item.areaOperacional === filtroArea;
    const matchesCriticidade =
      filtroCriticidade === "todas" || item.nivelCriticidade === filtroCriticidade;
    return matchesArea && matchesCriticidade;
  });

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Detecção de Anomalias Operacionais</h3>
              <p className="text-xs text-muted-foreground">Monitoramento inteligente de desvios e ocorrências</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-2.5 py-1 text-xs text-foreground cursor-pointer"
            >
              <option value="todas">Área: Todas</option>
              <option value="Produção">Produção</option>
              <option value="Estoque">Estoque</option>
              <option value="Vendas">Vendas</option>
              <option value="Financeiro">Financeiro</option>
            </select>

            <select
              value={filtroCriticidade}
              onChange={(e) => setFiltroCriticidade(e.target.value)}
              className="bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-2.5 py-1 text-xs text-foreground cursor-pointer"
            >
              <option value="todas">Criticidade: Todas</option>
              <option value="baixo">Baixo</option>
              <option value="media">Média</option>
              <option value="alto">Alto</option>
              <option value="critico">Crítico</option>
            </select>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {anomaliasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhuma anomalia operacional detectada para os filtros selecionados.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3">ID</th>
                  <th className="p-3">Anomalia</th>
                  <th className="p-3">Área</th>
                  <th className="p-3">Criticidade</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Data/Hora</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {anomaliasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-3 font-mono font-semibold">{item.id}</td>
                    <td className="p-3 font-bold text-foreground">{item.tipoAnomalia}</td>
                    <td className="p-3 font-medium text-muted-foreground">{item.areaOperacional}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
                          item.nivelCriticidade === "critico"
                            ? "bg-destructive/15 text-destructive animate-pulse"
                            : item.nivelCriticidade === "alto"
                            ? "bg-destructive/10 text-destructive"
                            : item.nivelCriticidade === "media"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {item.nivelCriticidade}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          atualizarStatusAnomalia(item.id, e.target.value as OcorrenciaAnomalia["status"])
                        }
                        className={cn(
                          "bg-accent/60 border border-border rounded px-2 py-0.5 text-[10px] font-bold uppercase cursor-pointer focus:outline-none",
                          item.status === "resolvida"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : item.status === "sob_analise"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-amber-600 dark:text-amber-500"
                        )}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="sob_analise">Em Análise</option>
                        <option value="resolvida">Resolvida</option>
                      </select>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(item.dataDetecao).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedAnomalia(item)}
                        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye className="h-3.5 w-3.5" />
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
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Detalhes da Ocorrência</h3>
            <p className="text-xs text-muted-foreground">Diagnóstico técnico do desvio operacional</p>
          </div>
        </div>

        <div className="p-6">
          {selectedAnomalia ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h4 className="text-xs font-bold font-mono text-muted-foreground uppercase">
                    {selectedAnomalia.id}
                  </h4>
                  <h3 className="text-sm font-bold text-foreground">
                    {selectedAnomalia.tipoAnomalia}
                  </h3>
                </div>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase",
                    selectedAnomalia.status === "resolvida"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : selectedAnomalia.status === "sob_analise"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                  )}
                >
                  {selectedAnomalia.status === "sob_analise" ? "em análise" : selectedAnomalia.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Área Operacional
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedAnomalia.areaOperacional}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Criticidade
                  </span>
                  <span className="font-bold text-destructive capitalize">
                    {selectedAnomalia.nivelCriticidade}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Detectado em
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedAnomalia.dataDetecao).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="space-y-1 bg-accent/40 rounded-xl p-3.5 border border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Descrição do Diagnóstico
                </span>
                <p className="text-xs text-foreground leading-relaxed leading-snug break-words">
                  {selectedAnomalia.descricao}
                </p>
              </div>

              {selectedAnomalia.status !== "resolvida" && (
                <button
                  onClick={() => {
                    atualizarStatusAnomalia(selectedAnomalia.id, "resolvida");
                    setSelectedAnomalia({ ...selectedAnomalia, status: "resolvida" });
                  }}
                  className="w-full flex items-center justify-center gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-emerald-500/10 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar como Resolvida
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground text-xs gap-2">
              <AlertTriangle className="h-8 w-8 opacity-30" />
              <span>Selecione uma ocorrência na tabela ao lado para visualizar os detalhes técnicos.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
