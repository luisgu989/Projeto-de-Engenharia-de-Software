"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useLogs } from "@/contexts/logs-context";

export interface Workflow {
  id: string;
  nomeFluxo: string;
  etapaConfigurada: string;
  processoVinculado: string;
  statusExecucao: "pendente" | "em_andamento" | "concluido" | "cancelado";
  dataExecucao: string;
  responsavelEtapa: string;
  prioridade: "baixa" | "media" | "alta";
}

export interface AtividadeWorkflow {
  id: string;
  workflowId: string;
  nomeFluxo: string;
  campoAlterado: string;
  valorAntigo: string;
  valorNovo: string;
  dataAlteracao: string;
  responsavel: string;
}

export const ETAPAS_WORKFLOW = [
  "Corte",
  "Montagem",
  "Pintura",
  "Controle de Qualidade",
  "Embalagem",
  "Aprovação",
  "Execução",
  "Finalização",
];

// Dependências de etapas
const DEPENDENCIAS_ETAPAS: Record<string, string[]> = {
  "Montagem": ["Corte"],
  "Pintura": ["Montagem"],
  "Controle de Qualidade": ["Montagem", "Pintura"],
  "Embalagem": ["Controle de Qualidade"],
  "Execução": ["Aprovação"],
  "Finalização": ["Execução", "Aprovação"],
};

const mockWorkflowsIniciais: Workflow[] = [
  {
    id: "WF-881023",
    nomeFluxo: "Fabricação de Teclados Mecânicos",
    etapaConfigurada: "Montagem",
    processoVinculado: "Produção Industrial",
    statusExecucao: "em_andamento",
    dataExecucao: "2026-06-15T09:00:00.000Z",
    responsavelEtapa: "Usuário Suporte",
    prioridade: "alta",
  },
  {
    id: "WF-502194",
    nomeFluxo: "Aprovação de Crédito Especial",
    etapaConfigurada: "Aprovação",
    processoVinculado: "Fluxo Financeiro",
    statusExecucao: "concluido",
    dataExecucao: "2026-06-14T14:30:00.000Z",
    responsavelEtapa: "João da Silva",
    prioridade: "media",
  },
];

export function useWorkflow() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addNotification } = useNotifications();

  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_workflows");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar workflows:", e);
        }
      }
    }
    return mockWorkflowsIniciais;
  });

  const [historicoAtividades, setHistoricoAtividades] = useState<AtividadeWorkflow[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_workflows");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico de workflows:", e);
        }
      }
    }
    return [];
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_workflows", JSON.stringify(workflows));
  }, [workflows]);

  useEffect(() => {
    localStorage.setItem("erp_historico_workflows", JSON.stringify(historicoAtividades));
  }, [historicoAtividades]);

  // Sincronizar entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const savedWfs = localStorage.getItem("erp_workflows");
      const savedHist = localStorage.getItem("erp_historico_workflows");
      if (savedWfs) {
        try { setWorkflows(JSON.parse(savedWfs)); } catch (e) {}
      }
      if (savedHist) {
        try { setHistoricoAtividades(JSON.parse(savedHist)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar privilégios (Gerente/Admin)
  const verificarPermissao = useCallback(() => {
    const cargo = user.cargo?.toLowerCase() || "";
    return user.role === "admin" || cargo.includes("gerente") || cargo.includes("diretor");
  }, [user]);

  // Calcular prioridade automaticamente baseada no processo e no nome do fluxo
  const calcularPrioridade = useCallback((nomeFluxo: string, processoVinculado: string): Workflow["prioridade"] => {
    const searchStr = `${nomeFluxo} ${processoVinculado}`.toLowerCase();
    if (searchStr.includes("crítico") || searchStr.includes("urgente") || searchStr.includes("financeiro") || searchStr.includes("crédito")) {
      return "alta";
    }
    if (searchStr.includes("produção") || searchStr.includes("compra") || searchStr.includes("ativo")) {
      return "media";
    }
    return "baixa";
  }, []);

  // Validar sequência e dependências
  const validarSequencia = useCallback((etapa: string, historicoEtapasAnteriores: string[] = []): boolean => {
    const deps = DEPENDENCIAS_ETAPAS[etapa];
    if (!deps) return true; // Sem dependências, liberado

    // Valida se pelo menos uma das dependências da etapa foi configurada anteriormente
    return deps.some((dep) => historicoEtapasAnteriores.includes(dep) || etapa === dep);
  }, []);

  // Criar Workflow
  const criarWorkflow = useCallback(
    (nomeFluxo: string, etapaConfigurada: string, processoVinculado: string) => {
      setError(null);

      if (!verificarPermissao()) {
        setError("Apenas gerentes e administradores podem configurar workflows.");
        return false;
      }

      if (!nomeFluxo.trim() || !processoVinculado.trim()) {
        setError("Preencha todos os campos obrigatórios.");
        return false;
      }

      if (!ETAPAS_WORKFLOW.includes(etapaConfigurada)) {
        setError("Etapa configurada inválida.");
        return false;
      }

      const id = `WF-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataAtual = new Date().toISOString();
      const prioridade = calcularPrioridade(nomeFluxo, processoVinculado);

      const novoWorkflow: Workflow = {
        id,
        nomeFluxo: nomeFluxo.trim(),
        etapaConfigurada,
        processoVinculado: processoVinculado.trim(),
        statusExecucao: "pendente",
        dataExecucao: dataAtual,
        responsavelEtapa: user.name,
        prioridade,
      };

      setWorkflows((prev) => [novoWorkflow, ...prev]);

      const novaAtividade: AtividadeWorkflow = {
        id: `LOG-WF-${Math.floor(100000 + Math.random() * 900000)}`,
        workflowId: id,
        nomeFluxo: nomeFluxo.trim(),
        campoAlterado: "Criação",
        valorAntigo: "-",
        valorNovo: `Criado no processo ${processoVinculado.trim()} na etapa ${etapaConfigurada}`,
        dataAlteracao: dataAtual,
        responsavel: user.name,
      };
      setHistoricoAtividades((prev) => [novaAtividade, ...prev]);

      addLog(`Configurou o workflow ${id} para o processo ${processoVinculado.trim()}`, "sistema");

      addNotification(
        "Workflow Configurado",
        `O fluxo "${nomeFluxo}" foi mapeado sob o processo "${processoVinculado}". Prioridade: ${prioridade.toUpperCase()}`,
        "info",
        "gerente"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [user, verificarPermissao, calcularPrioridade, addNotification]
  );

  // Atualizar Workflow
  const atualizarWorkflow = useCallback(
    (
      id: string,
      novosDados: {
        nomeFluxo: string;
        etapaConfigurada: string;
        statusExecucao: Workflow["statusExecucao"];
      }
    ) => {
      setError(null);

      if (!verificarPermissao()) {
        setError("Apenas gerentes e administradores possuem permissão para alterar workflows.");
        return false;
      }

      const workflow = workflows.find((w) => w.id === id);
      if (!workflow) {
        setError("Workflow não encontrado.");
        return false;
      }

      // Processos concluídos ficam blindados contra modificações
      if (workflow.statusExecucao === "concluido" || workflow.statusExecucao === "cancelado") {
        setError("Este workflow já foi encerrado e não pode mais receber alterações manuais.");
        return false;
      }

      if (!ETAPAS_WORKFLOW.includes(novosDados.etapaConfigurada)) {
        setError("Etapa configurada inválida.");
        return false;
      }

      // Validar sequência (dependência operacional)
      // Passa a etapa configurada anterior do próprio workflow para simular histórico
      const passouValidacao = validarSequencia(novosDados.etapaConfigurada, [workflow.etapaConfigurada]);
      if (!passouValidacao) {
        setError(
          `Erro de sequência: A etapa "${novosDados.etapaConfigurada}" necessita de uma etapa precedente válida (Ex: ${DEPENDENCIAS_ETAPAS[novosDados.etapaConfigurada]?.join(", ") || ""}).`
        );
        return false;
      }

      const dataAtual = new Date().toISOString();
      const logsAlteracao: AtividadeWorkflow[] = [];
      const prioridadeCalculada = calcularPrioridade(novosDados.nomeFluxo, workflow.processoVinculado);

      if (workflow.nomeFluxo !== novosDados.nomeFluxo.trim()) {
        logsAlteracao.push({
          id: `LOG-WF-${Math.floor(100000 + Math.random() * 900000)}`,
          workflowId: id,
          nomeFluxo: novosDados.nomeFluxo.trim(),
          campoAlterado: "Nome do Fluxo",
          valorAntigo: workflow.nomeFluxo,
          valorNovo: novosDados.nomeFluxo.trim(),
          dataAlteracao: dataAtual,
          responsavel: user.name,
        });
      }

      if (workflow.etapaConfigurada !== novosDados.etapaConfigurada) {
        logsAlteracao.push({
          id: `LOG-WF-${Math.floor(100000 + Math.random() * 900000)}`,
          workflowId: id,
          nomeFluxo: workflow.nomeFluxo,
          campoAlterado: "Etapa Configurada",
          valorAntigo: workflow.etapaConfigurada,
          valorNovo: novosDados.etapaConfigurada,
          dataAlteracao: dataAtual,
          responsavel: user.name,
        });
      }

      if (workflow.statusExecucao !== novosDados.statusExecucao) {
        logsAlteracao.push({
          id: `LOG-WF-${Math.floor(100000 + Math.random() * 900000)}`,
          workflowId: id,
          nomeFluxo: workflow.nomeFluxo,
          campoAlterado: "Status da Execução",
          valorAntigo: workflow.statusExecucao,
          valorNovo: novosDados.statusExecucao,
          dataAlteracao: dataAtual,
          responsavel: user.name,
        });
      }

      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id === id) {
            // processoVinculado permanece completamente IMUTÁVEL
            return {
              ...w,
              nomeFluxo: novosDados.nomeFluxo.trim(),
              etapaConfigurada: novosDados.etapaConfigurada,
              statusExecucao: novosDados.statusExecucao,
              dataExecucao: dataAtual,
              responsavelEtapa: user.name,
              prioridade: prioridadeCalculada,
            };
          }
          return w;
        })
      );

      if (logsAlteracao.length > 0) {
        setHistoricoAtividades((prev) => [...logsAlteracao, ...prev]);
        addLog(`Atualizou o workflow ${id}`, "sistema");
      }

      if (novosDados.statusExecucao === "concluido") {
        addNotification(
          "Workflow Concluído",
          `O fluxo "${workflow.nomeFluxo}" foi finalizado com sucesso por ${user.name}.`,
          "success",
          "gerente"
        );
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [workflows, user, verificarPermissao, calcularPrioridade, validarSequencia, addNotification]
  );

  return {
    workflows,
    historicoAtividades,
    error,
    setError,
    criarWorkflow,
    atualizarWorkflow,
    verificarPermissao,
  };
}
