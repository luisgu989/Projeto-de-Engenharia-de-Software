import React, { useState } from "react";
import { useBackup, RegistroBackup } from "@/hooks/useBackup";
import { Database, Play, CheckCircle2, AlertTriangle, Loader2, ShieldCheck, Settings, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigBackup() {
  const {
    backups,
    config,
    criarBackup,
    restaurarBackup,
    atualizarConfiguracaoBackup,
    error,
    setError
  } = useBackup();

  const [tipoBackup, setTipoBackup] = useState<"completo" | "incremental">("completo");
  const [successRestoration, setSuccessRestoration] = useState<string | null>(null);

  const [tipoConfig, setTipoConfig] = useState(config.tipo);
  const [frequenciaConfig, setFrequenciaConfig] = useState(config.frequencia);
  const [localConfig, setLocalConfig] = useState(config.localArmazenamento);
  const [successConfig, setSuccessConfig] = useState<string | null>(null);

  React.useEffect(() => {
    setTipoConfig(config.tipo);
    setFrequenciaConfig(config.frequencia);
    setLocalConfig(config.localArmazenamento);
  }, [config]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    criarBackup(tipoBackup);
  };

  const handleRestore = (item: RegistroBackup) => {
    const success = restaurarBackup(item.id);
    if (success) {
      setSuccessRestoration(`O sistema foi restaurado com sucesso para o estado de ${new Date(item.dataExecucao).toLocaleString("pt-BR")}!`);
      setTimeout(() => {
        setSuccessRestoration(null);
      }, 5000);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = atualizarConfiguracaoBackup(tipoConfig, frequenciaConfig, localConfig);
    if (ok) {
      setSuccessConfig("Parâmetros da rotina automática de backup salvos!");
      setTimeout(() => setSuccessConfig(null), 4000);
    }
  };

  const isExecutingBackup = backups.some((b) => b.status === "executando");

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Histórico de Backups Realizados</h3>
            <p className="text-xs text-muted-foreground">Gerencie pontos de recuperação segura do sistema</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto flex-1">
          {successRestoration && (
            <div className="mb-4 p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span>{successRestoration}</span>
            </div>
          )}

          {backups.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhum backup registrado no histórico do sistema.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">ID</th>
                  <th className="p-3 text-center">Tipo</th>
                  <th className="p-3 text-center">Arquivo de Cópia</th>
                  <th className="p-3 text-center">Executado em</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Responsável</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {backups.map((item) => {
                  const isCurrentExecuting = item.status === "executando";
                  const isSuccess = item.status === "sucesso";

                  return (
                    <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                      <td className="p-3 font-mono font-semibold text-center">{item.id}</td>
                      <td className="p-3 font-bold text-foreground uppercase text-center">{item.tipo}</td>
                      <td className="p-3 font-mono text-muted-foreground text-[10px] truncate max-w-[150px] text-center">
                        {item.caminhoArquivo}
                      </td>
                      <td className="p-3 text-muted-foreground text-center">
                        {new Date(item.dataExecucao).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase inline-flex items-center gap-1",
                            isSuccess
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : isCurrentExecuting
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {isCurrentExecuting && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-left">{item.usuarioResponsavel}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRestore(item)}
                          disabled={isExecutingBackup || !isSuccess}
                          className="px-2.5 py-1 text-[10px] font-bold border border-border rounded-lg bg-background hover:bg-accent disabled:opacity-40 disabled:hover:bg-background cursor-pointer transition-colors"
                        >
                          Restaurar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Rotina de Backup Automático</h3>
              <p className="text-xs text-muted-foreground">Agendamento e parâmetros de execução automática</p>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-xs font-semibold text-destructive bg-destructive/5 border border-destructive/10 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successConfig && (
              <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
                <span>{successConfig}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tipo de Backup Padrão
              </label>
              <select
                value={tipoConfig}
                onChange={(e) => setTipoConfig(e.target.value as "completo" | "incremental")}
                className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                <option value="completo">Backup Completo (Totalidade do Banco)</option>
                <option value="incremental">Backup Incremental (Apenas Alterações)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Frequência de Execução
              </label>
              <select
                value={frequenciaConfig}
                onChange={(e) => setFrequenciaConfig(e.target.value as "diario" | "semanal" | "mensal")}
                className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer"
              >
                <option value="diario">Diário (Todas as noites às 02:00)</option>
                <option value="semanal">Semanal (Todo domingo às 03:00)</option>
                <option value="mensal">Mensal (Todo 1º dia do mês às 04:00)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Destino / Local de Armazenamento
              </label>
              <input
                type="text"
                required
                placeholder="Ex: /var/backups/erp"
                value={localConfig}
                onChange={(e) => setLocalConfig(e.target.value)}
                className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 h-9 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-primary/20 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Salvar Configurações</span>
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden h-fit">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Disparar Cópia de Segurança</h3>
              <p className="text-xs text-muted-foreground">Inicie manualmente uma nova geração de backup de dados</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tipo de Cópia
              </label>
              <select
                value={tipoBackup}
                onChange={(e) => setTipoBackup(e.target.value as "completo" | "incremental")}
                disabled={isExecutingBackup}
                className="w-full bg-accent/40 border border-border focus:border-ring/30 focus:outline-none rounded-lg px-3 py-2 text-xs text-foreground cursor-pointer disabled:opacity-45"
              >
                <option value="completo">Backup Completo</option>
                <option value="incremental">Backup Incremental</option>
              </select>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground bg-accent/40 rounded-xl p-4 border border-border/50">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-foreground">Aviso do Sistema:</span>
                  <p className="leading-snug text-[11px]">
                    A cópia manual de segurança será armazenada no local configurado acima: <span className="font-mono text-foreground font-semibold">{localConfig}</span>.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isExecutingBackup}
              className="w-full flex items-center justify-center gap-1.5 h-9 bg-primary hover:bg-primary/95 text-primary-foreground disabled:opacity-40 disabled:hover:bg-primary rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-primary/20 transition-all"
            >
              {isExecutingBackup ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processando Cópia...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Executar Backup Agora</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
