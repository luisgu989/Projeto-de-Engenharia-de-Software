"use client";

import React, { useState } from "react";
import { useValidacaoImportacao, Importacao } from "@/hooks/useValidacaoImportacao";
import { useAuth } from "@/contexts/auth-context";
import {
  Upload,
  AlertOctagon,
  CheckCircle2,
  FileText,
  Search,
  History,
  Terminal,
  Play,
  FileCode,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ValidacaoImportacao() {
  const { user } = useAuth();
  const {
    importacoes,
    historicoValida,
    error,
    setError,
    importarEValidar
  } = useValidacaoImportacao();

  const [arquivoNome, setArquivoNome] = useState("");
  const [cenario, setCenario] = useState<"ok" | "formato_invalido" | "duplicado" | "inconsistencias">("ok");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const handleSimular = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const nameTrimmed = arquivoNome.trim();
    if (!nameTrimmed) {
      setError("Insira o nome do arquivo para simulação.");
      return;
    }

    setValidating(true);

    setTimeout(() => {
      const aprovado = importarEValidar(nameTrimmed, cenario);
      setValidating(false);
      if (aprovado) {
        setSuccessMsg(`Arquivo "${nameTrimmed}" importado e persistido no ERP com sucesso!`);
        setArquivoNome("");
      } else {
        setError(`Validação rejeitada para "${nameTrimmed}". Veja o log detalhado no painel.`);
      }
    }, 1200);
  };

  const filteredLogs = historicoValida.filter(log =>
    log.arquivoImportado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Coluna 1 e 2: Listagem de Importações Recentes */}
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Rastreabilidade de Importações</h3>
              <p className="text-xs text-muted-foreground">Varreduras automáticas de integridade de dados (R083)</p>
            </div>
          </div>
          
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filtrar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground w-48 transition-all"
            />
          </div>
        </div>

        <div className="p-6 flex-1 space-y-4">
          {successMsg && (
            <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/5 border border-destructive/10 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Nenhuma importação encontrada para os filtros aplicados.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                    <th className="p-3">ID / Arquivo</th>
                    <th className="p-3">Data / Hora</th>
                    <th className="p-3">Responsável</th>
                    <th className="p-3 text-center">Formato</th>
                    <th className="p-3 text-center">Inconsistências</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLogs.map((item) => {
                    const isSuccess = item.statusValida === "Aprovado";
                    return (
                      <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                        <td className="p-3">
                          <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-foreground leading-snug">
                              {item.arquivoImportado}
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground">
                              ID: {item.id}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(item.dataValida).toLocaleString("pt-BR")}
                        </td>
                        <td className="p-3 text-foreground/80">
                          {item.responsavel}
                        </td>
                        <td className="p-3 text-center">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border",
                            item.formatoValido
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          )}>
                            {item.formatoValido ? "Válido" : "Inválido"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={cn(
                            "font-bold font-mono",
                            item.quantidadeInconsistencias > 0 ? "text-destructive" : "text-emerald-500"
                          )}>
                            {item.quantidadeInconsistencias}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col space-y-1">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase w-fit",
                              isSuccess
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border border-destructive/20 animate-pulse"
                            )}>
                              {item.statusValida}
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-relaxed line-clamp-1 max-w-[200px]" title={item.mensagem}>
                              {item.mensagem}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Coluna 3: Simulador de Upload e Varredura */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Simulador de Upload</h3>
            <p className="text-xs text-muted-foreground">Dispare uma varredura automática de formato e conteúdo</p>
          </div>
        </div>

        <form onSubmit={handleSimular} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Nome do Arquivo
            </label>
            <input
              type="text"
              required
              placeholder="Ex: clientes_leads_maio.csv"
              value={arquivoNome}
              onChange={(e) => setArquivoNome(e.target.value)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground"
            />
            <span className="text-[10px] text-muted-foreground block">
              Formatos aceitos pelo ERP: <b>.csv, .xlsx, .json</b>
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Cenário de Simulação (Integridade)
            </label>
            <select
              value={cenario}
              onChange={(e) => setCenario(e.target.value as any)}
              className="w-full bg-accent/20 hover:bg-accent/40 focus:bg-background border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
            >
              <option value="ok">100% Íntegro (Aprovado)</option>
              <option value="formato_invalido">Formato Inválido (Ex: .pdf)</option>
              <option value="duplicado">Registros de Chave Duplicados (Reprovado)</option>
              <option value="inconsistencias">Células Corrompidas / Vazias (Reprovado)</option>
            </select>
          </div>

          <div className="p-4 rounded-lg bg-accent/50 border border-border/80 text-[11px] leading-relaxed text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 text-foreground font-semibold">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span>Regras de Negócio R083</span>
            </div>
            <p>
              Arquivos reprovados na varredura técnica <b>não são persistidos</b> nos bancos de dados do ERP. O sistema gera alertas imediatos de inconsistência.
            </p>
          </div>

          <button
            type="submit"
            disabled={validating}
            className="w-full h-9 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {validating ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Varrendo Integridade...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                Validar e Importar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
