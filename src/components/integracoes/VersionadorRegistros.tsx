import React, { useState } from "react";
import { useIntegracoes, VersaoImportacao, RegistroImportado } from "@/hooks/useIntegracoes";
import { FileSpreadsheet, History, RefreshCw, CheckCircle2, User, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function VersionadorRegistros() {
  const { versoes, importarNovaVersao, restaurarVersaoAnterior } = useIntegracoes();

  const [selectedVersao, setSelectedVersao] = useState<VersaoImportacao | null>(null);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  const mockPlanilhas = [
    {
      nome: "Inventário Mensal - Auditoria",
      dados: [
        {
          id: "PROD-001",
          sku: "PRD-TEC-001",
          nome: "Teclado Mecânico RGB Pro",
          categoria: "Periféricos",
          quantidade: 50,
          estoqueMinimo: 10,
          precoCusto: 185.0,
          precoVenda: 359.9,
          status: "ativo",
          criadoEm: "2026-05-15T09:00:00.000Z",
          criadoPor: "Auditoria"
        },
        {
          id: "PROD-002",
          sku: "PRD-MOU-002",
          nome: "Mouse Gamer Sem Fio 16000DPI",
          categoria: "Periféricos",
          quantidade: 15,
          estoqueMinimo: 12,
          precoCusto: 125.0,
          precoVenda: 239.9,
          status: "ativo",
          criadoEm: "2026-05-16T10:30:00.000Z",
          criadoPor: "Auditoria"
        }
      ]
    },
    {
      nome: "Lote de Importação Suprimentos",
      dados: [
        {
          id: "PROD-001",
          sku: "PRD-TEC-001",
          nome: "Teclado Mecânico RGB Pro",
          categoria: "Periféricos",
          quantidade: 90,
          estoqueMinimo: 10,
          precoCusto: 175.0,
          precoVenda: 339.9,
          status: "ativo",
          criadoEm: "2026-05-15T09:00:00.000Z",
          criadoPor: "Logística"
        },
        {
          id: "PROD-002",
          sku: "PRD-MOU-002",
          nome: "Mouse Gamer Sem Fio 16000DPI",
          categoria: "Periféricos",
          quantidade: 30,
          estoqueMinimo: 12,
          precoCusto: 115.0,
          precoVenda: 219.9,
          status: "ativo",
          criadoEm: "2026-05-16T10:30:00.000Z",
          criadoPor: "Logística"
        }
      ]
    }
  ];

  const handleSimulatedImport = (planilha: typeof mockPlanilhas[0]) => {
    const success = importarNovaVersao(planilha.nome, planilha.dados as RegistroImportado[]);
    if (success) {
      setIsSuccessMessage(true);
      setTimeout(() => {
        setIsSuccessMessage(false);
      }, 3000);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Histórico de Versões Importadas</h3>
            <p className="text-xs text-muted-foreground">Versionamento e rollback de dados externos integrados</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {versoes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Nenhuma versão de importação encontrada.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/40 border-b border-border font-bold text-muted-foreground text-[10px] uppercase">
                  <th className="p-3 text-center">Código</th>
                  <th className="p-3 text-center">Versão</th>
                  <th className="p-3 text-left">Origem / Descrição</th>
                  <th className="p-3 text-center">Data</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Responsável</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {versoes.map((item) => {
                  const isVersaoAtiva = item.statusVersao === "ativa";

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-accent/10 transition-colors",
                        isVersaoAtiva && "bg-primary/[0.02] font-semibold"
                      )}
                    >
                      <td className="p-3 font-mono text-muted-foreground text-center">{item.id}</td>
                      <td className="p-3 font-bold text-center">v{item.versao}</td>
                      <td className="p-3 text-foreground text-left">{item.origemImportacao}</td>
                      <td className="p-3 text-muted-foreground text-center">
                        {new Date(item.dataImportacao).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
                            isVersaoAtiva
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-accent text-muted-foreground"
                          )}
                        >
                          {item.statusVersao}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-1.5 text-muted-foreground text-left">
                        <User className="h-3 w-3" />
                        <span>{item.usuarioResponsavel}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedVersao(item)}
                          className="px-2.5 py-1 text-[10px] font-bold border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        >
                          Ver Dados
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
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-accent/20">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Simular Importação</h3>
              <p className="text-xs text-muted-foreground">Importar planilhas para gerar nova versão</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {isSuccessMessage && (
              <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                Planilha importada com sucesso e nova versão criada!
              </div>
            )}

            <div className="grid gap-3">
              {mockPlanilhas.map((planilha, index) => (
                <button
                  key={index}
                  onClick={() => handleSimulatedImport(planilha)}
                  className="w-full flex items-center justify-between p-3.5 border border-border/80 hover:border-primary/30 rounded-xl hover:bg-accent/40 text-left transition-all cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {planilha.nome}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      Contém {planilha.dados.length} produtos mapeados
                    </span>
                  </div>
                  <ArrowLeftRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedVersao && (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/20">
              <div>
                <h3 className="font-bold text-xs font-mono text-muted-foreground uppercase">
                  Mapeamento de Dados v{selectedVersao.versao}
                </h3>
                <h4 className="text-xs font-bold text-foreground truncate max-w-[200px]">
                  {selectedVersao.origemImportacao}
                </h4>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground font-mono">
                {selectedVersao.dados.length} itens
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="max-h-48 overflow-y-auto divide-y divide-border/60 pr-1">
                {selectedVersao.dados.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-foreground block">{item.nome}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {item.sku}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-foreground block">
                        Qtd: {item.quantidade}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Custo: R$ {item.precoCusto}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedVersao.statusVersao !== "ativa" ? (
                <button
                  onClick={() => {
                    const success = restaurarVersaoAnterior(selectedVersao.id);
                    if (success) {
                      setSelectedVersao({ ...selectedVersao, statusVersao: "ativa" });
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 h-9 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-primary/10 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Restaurar Esta Versão no Estoque
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-500/20 py-2.5 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Versão Ativa no Sistema</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
