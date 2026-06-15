"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/contexts/logs-context";

export interface AutomacaoProcesso {
  id: string;
  nome: string;
  tipoProcesso: "Sincronização" | "Faturamento" | "Notificação" | "Backup" | "Limpeza";
  regraExecucao: string;
  frequencia: "Minuto a minuto" | "A cada hora" | "Diário" | "Semanal" | "Mensal";
  dataAtualizacao: string;
  ultimaExecucao: string | null;
  status: "ativo" | "inativo";
}

const mockAutomacoesIniciais: AutomacaoProcesso[] = [
  {
    id: "AUT-001",
    nome: "Sincronização Automática de Estoque",
    tipoProcesso: "Sincronização",
    regraExecucao: "Importar lotes de planilhas pendentes no diretório temporário a cada ciclo.",
    frequencia: "A cada hora",
    dataAtualizacao: "2026-06-01T08:00:00.000Z",
    ultimaExecucao: "2026-06-15T00:00:00.000Z",
    status: "ativo"
  },
  {
    id: "AUT-002",
    nome: "Notificação de Boletos Vencidos",
    tipoProcesso: "Faturamento",
    regraExecucao: "Enviar e-mails e alertas de cobrança automática aos clientes inadimplentes há mais de 3 dias.",
    frequencia: "Diário",
    dataAtualizacao: "2026-06-05T14:30:00.000Z",
    ultimaExecucao: "2026-06-14T07:00:00.000Z",
    status: "ativo"
  },
  {
    id: "AUT-003",
    nome: "Backup Automático para AWS S3",
    tipoProcesso: "Backup",
    regraExecucao: "Gerar backup incremental das tabelas do ERP e enviar ao bucket da nuvem S3.",
    frequencia: "Semanal",
    dataAtualizacao: "2026-06-10T10:00:00.000Z",
    ultimaExecucao: null,
    status: "inativo"
  }
];

export function useAutomacoes() {
  const { addLog } = useLogs();
  const [automacoes, setAutomacoes] = useState<AutomacaoProcesso[]>(mockAutomacoesIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_automacoes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setAutomacoes(parsed);
          setIsLoaded(true);
        }, 0);
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_automacoes", JSON.stringify(automacoes));
    }
  }, [automacoes, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_automacoes");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAutomacoes((current) => {
            if (JSON.stringify(current) === saved) {
              return current;
            }
            return parsed;
          });
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const verificarNomeUnico = (nome: string, excludeId?: string) => {
    const cleaned = nome.trim().toLowerCase();
    return automacoes.some((a) => a.id !== excludeId && a.nome.trim().toLowerCase() === cleaned);
  };

  const adicionarAutomacao = (
    nome: string,
    tipoProcesso: AutomacaoProcesso["tipoProcesso"],
    regraExecucao: string,
    frequencia: AutomacaoProcesso["frequencia"]
  ) => {
    setError(null);
    if (!nome.trim() || !regraExecucao.trim()) {
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      return false;
    }
    if (verificarNomeUnico(nome)) {
      setError("Já existe uma automação cadastrada com este nome.");
      return false;
    }

    const id = `AUT-${String(automacoes.length + 1).padStart(3, "0")}-${Math.floor(Math.random() * 100)}`;
    const nova: AutomacaoProcesso = {
      id,
      nome: nome.trim(),
      tipoProcesso,
      regraExecucao: regraExecucao.trim(),
      frequencia,
      dataAtualizacao: new Date().toISOString(),
      ultimaExecucao: null,
      status: "ativo"
    };

    setAutomacoes((prev) => [nova, ...prev]);
    addLog(`Criou regra de automação: ${nova.nome}`, "seguranca");
    return true;
  };

  const atualizarAutomacao = (
    id: string,
    nome: string,
    tipoProcesso: AutomacaoProcesso["tipoProcesso"],
    regraExecucao: string,
    frequencia: AutomacaoProcesso["frequencia"],
    status: AutomacaoProcesso["status"]
  ) => {
    setError(null);
    if (!nome.trim() || !regraExecucao.trim()) {
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      return false;
    }
    if (verificarNomeUnico(nome, id)) {
      setError("Já existe uma automação cadastrada com este nome.");
      return false;
    }

    setAutomacoes((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              nome: nome.trim(),
              tipoProcesso,
              regraExecucao: regraExecucao.trim(),
              frequencia,
              status,
              dataAtualizacao: new Date().toISOString()
            }
          : a
      )
    );
    addLog(`Atualizou regra de automação: ${nome} (ID: ${id})`, "seguranca");
    return true;
  };

  const removerAutomacao = (id: string) => {
    const alvo = automacoes.find((a) => a.id === id);
    if (alvo) {
      setAutomacoes((prev) => prev.filter((a) => a.id !== id));
      addLog(`Removeu regra de automação: ${alvo.nome} (ID: ${id})`, "seguranca");
      return true;
    }
    return false;
  };

  const executarAutomacaoAgora = (id: string) => {
    const timestamp = new Date().toISOString();
    let nomeAutomacao = "";
    setAutomacoes((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          nomeAutomacao = a.nome;
          return { ...a, ultimaExecucao: timestamp };
        }
        return a;
      })
    );
    if (nomeAutomacao) {
      addLog(`Executou manualmente automação: ${nomeAutomacao}`, "seguranca");
      return true;
    }
    return false;
  };

  return {
    automacoes,
    adicionarAutomacao,
    atualizarAutomacao,
    removerAutomacao,
    executarAutomacaoAgora,
    error,
    setError
  };
}
