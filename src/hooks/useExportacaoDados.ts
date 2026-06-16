"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";

export interface Exportacao {
  id: string;
  codigoRotina: string;
  rotinaProgramada: string;
  tipoArquivo: "xlsx" | "csv" | "pdf" | "json";
  diretorioDestino: string;
  status: "agendada" | "executando" | "concluida" | "falhou";
  dataExecucao: string;
  responsavel: string;
}

export const FORMATOS_EXPORTACAO = ["xlsx", "csv", "pdf", "json"] as const;

const mockExportacoesIniciais: Exportacao[] = [
  {
    id: "EXP-701021",
    codigoRotina: "EXP-FECH-VENDAS",
    rotinaProgramada: "Fechamento Mensal de Faturamento",
    tipoArquivo: "xlsx",
    diretorioDestino: "C:/ERPPro/Exportacoes/Financeiro",
    status: "concluida",
    dataExecucao: "2026-06-01T23:00:00.000Z",
    responsavel: "Usuário Suporte",
  },
  {
    id: "EXP-920194",
    codigoRotina: "EXP-LOG-ENTREGAS",
    rotinaProgramada: "Relatório de Entregas Pendentes",
    tipoArquivo: "csv",
    diretorioDestino: "C:/ERPPro/Exportacoes/Logistica",
    status: "agendada",
    dataExecucao: "2026-06-17T04:00:00.000Z",
    responsavel: "João da Silva",
  },
];

export function useExportacaoDados() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [exportacoes, setExportacoes] = useState<Exportacao[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_exportacoes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar exportações:", e);
        }
      }
    }
    return mockExportacoesIniciais;
  });

  const [historicoExportacoes, setHistoricoExportacoes] = useState<Exportacao[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_exportacoes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico de exportações:", e);
        }
      }
    }
    return mockExportacoesIniciais.filter((e) => e.status === "concluida");
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_exportacoes", JSON.stringify(exportacoes));
  }, [exportacoes]);

  useEffect(() => {
    localStorage.setItem("erp_historico_exportacoes", JSON.stringify(historicoExportacoes));
  }, [historicoExportacoes]);

  // Sync entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const savedExps = localStorage.getItem("erp_exportacoes");
      const savedHist = localStorage.getItem("erp_historico_exportacoes");
      if (savedExps) {
        try { setExportacoes(JSON.parse(savedExps)); } catch (e) {}
      }
      if (savedHist) {
        try { setHistoricoExportacoes(JSON.parse(savedHist)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Verificar permissões: Administrador ou cargo ligado a faturamento/administração/gerência
  const verificarPermissaoExportacao = useCallback(() => {
    const cargo = user.cargo?.toLowerCase() || "";
    return (
      user.role === "admin" ||
      cargo.includes("gerente") ||
      cargo.includes("diretor") ||
      cargo.includes("administra") ||
      cargo.includes("analista")
    );
  }, [user]);

  // Verificar código de rotina duplicado
  const checkDuplicateCodigo = useCallback(
    (codigo: string, excludeId?: string) => {
      const cleaned = codigo.trim().toUpperCase();
      if (!cleaned) return false;
      return exportacoes.some((e) => e.id !== excludeId && e.codigoRotina.trim().toUpperCase() === cleaned);
    },
    [exportacoes]
  );

  // Agendar Exportação Programada
  const agendarExportacao = useCallback(
    (
      codigoRotina: string,
      rotinaProgramada: string,
      tipoArquivo: Exportacao["tipoArquivo"],
      diretorioDestino: string
    ) => {
      setError(null);

      if (!verificarPermissaoExportacao()) {
        setError("Seu perfil de usuário não tem permissão para configurar agendamento de exportações.");
        return false;
      }

      const cleanedCodigo = codigoRotina.trim().toUpperCase();
      if (!cleanedCodigo) {
        setError("O código da rotina é obrigatório.");
        return false;
      }

      if (checkDuplicateCodigo(cleanedCodigo)) {
        setError(`O código de rotina "${cleanedCodigo}" já está sendo utilizado em outra programação.`);
        return false;
      }

      if (!rotinaProgramada.trim() || !diretorioDestino.trim()) {
        setError("Preencha todos os campos obrigatórios.");
        return false;
      }

      // Validar formato
      if (!FORMATOS_EXPORTACAO.includes(tipoArquivo)) {
        setError("Formato de arquivo para exportação inválido.");
        return false;
      }

      // Validar diretório (simples regex de caminho local ou rede)
      const isPathValid = /^[a-zA-Z]:[\\/]/i.test(diretorioDestino) || diretorioDestino.startsWith("/");
      if (!isPathValid) {
        setError("Diretório de destino inválido. Insira um caminho de disco válido (Ex: C:/diretorio ou /diretorio).");
        return false;
      }

      const id = `EXP-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataAtual = new Date().toISOString();

      const novaExportacao: Exportacao = {
        id,
        codigoRotina: cleanedCodigo,
        rotinaProgramada: rotinaProgramada.trim(),
        tipoArquivo,
        diretorioDestino: diretorioDestino.trim(),
        status: "agendada",
        dataExecucao: dataAtual,
        responsavel: user.name,
      };

      setExportacoes((prev) => [novaExportacao, ...prev]);

      addNotification(
        "Exportação Agendada",
        `Extração automática de relatórios agendada (${tipoArquivo.toUpperCase()}) para o diretório ${diretorioDestino}.`,
        "info",
        "geral"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [exportacoes, user, verificarPermissaoExportacao, checkDuplicateCodigo, addNotification]
  );

  // Editar Exportação (Apenas se não concluída)
  const editarExportacao = useCallback(
    (
      id: string,
      novosDados: {
        rotinaProgramada: string;
        tipoArquivo: Exportacao["tipoArquivo"];
        diretorioDestino: string;
      }
    ) => {
      setError(null);

      if (!verificarPermissaoExportacao()) {
        setError("Você não possui permissões administrativas para alterar esta configuração.");
        return false;
      }

      const exportacao = exportacoes.find((e) => e.id === id);
      if (!exportacao) {
        setError("Exportação programada não encontrada.");
        return false;
      }

      // Registros concluídos ficam protegidos contra modificações manuais
      if (exportacao.status === "concluida") {
        setError("Não é permitido modificar configurações de exportações já executadas/concluídas.");
        return false;
      }

      if (!novosDados.rotinaProgramada.trim() || !novosDados.diretorioDestino.trim()) {
        setError("Preencha todos os campos obrigatórios.");
        return false;
      }

      if (!FORMATOS_EXPORTACAO.includes(novosDados.tipoArquivo)) {
        setError("Formato de arquivo de exportação inválido.");
        return false;
      }

      const isPathValid = /^[a-zA-Z]:[\\/]/i.test(novosDados.diretorioDestino) || novosDados.diretorioDestino.startsWith("/");
      if (!isPathValid) {
        setError("Diretório de destino inválido.");
        return false;
      }

      setExportacoes((prev) =>
        prev.map((e) => {
          if (e.id === id) {
            // codigoRotina permanece completamente IMUTÁVEL
            return {
              ...e,
              rotinaProgramada: novosDados.rotinaProgramada.trim(),
              tipoArquivo: novosDados.tipoArquivo,
              diretorioDestino: novosDados.diretorioDestino.trim(),
              dataExecucao: new Date().toISOString(),
              responsavel: user.name,
            };
          }
          return e;
        })
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [exportacoes, user, verificarPermissaoExportacao]
  );

  // Simular processamento/extração de dados
  const executarExportacao = useCallback(
    (id: string) => {
      setError(null);

      const exportacao = exportacoes.find((e) => e.id === id);
      if (!exportacao) {
        setError("Exportação programada não encontrada.");
        return false;
      }

      if (exportacao.status === "concluida") {
        setError("Esta exportação já foi finalizada.");
        return false;
      }

      const dataAtual = new Date().toISOString();

      // Executa simulação alterando status
      setExportacoes((prev) =>
        prev.map((e) => {
          if (e.id === id) {
            return {
              ...e,
              status: "concluida",
              dataExecucao: dataAtual,
              responsavel: user.name,
            };
          }
          return e;
        })
      );

      // Grava no Histórico de Exportações (imutável)
      const exportacaoConcluida: Exportacao = {
        ...exportacao,
        status: "concluida",
        dataExecucao: dataAtual,
        responsavel: user.name,
      };

      setHistoricoExportacoes((prev) => [exportacaoConcluida, ...prev]);

      addNotification(
        "Exportação de Dados Concluída",
        `O relatório programado "${exportacao.rotinaProgramada}" foi gerado e salvo em ${exportacao.diretorioDestino}.`,
        "success",
        "geral"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [exportacoes, user, addNotification]
  );

  // Remover Exportação (Apenas se agendada)
  const removerExportacao = useCallback(
    (id: string) => {
      setError(null);

      if (!verificarPermissaoExportacao()) {
        setError("Apenas administradores e analistas podem deletar programações.");
        return false;
      }

      const exportacao = exportacoes.find((e) => e.id === id);
      if (!exportacao) {
        setError("Exportação não encontrada.");
        return false;
      }

      if (exportacao.status === "concluida") {
        setError("Não é permitido excluir logs históricos de exportações finalizadas.");
        return false;
      }

      setExportacoes((prev) => prev.filter((e) => e.id !== id));

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [exportacoes, verificarPermissaoExportacao]
  );

  return {
    exportacoes,
    historicoExportacoes,
    error,
    setError,
    agendarExportacao,
    editarExportacao,
    executarExportacao,
    removerExportacao,
    verificarPermissaoExportacao,
  };
}
