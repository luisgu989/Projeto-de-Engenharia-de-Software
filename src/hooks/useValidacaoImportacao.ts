"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useLogs } from "@/contexts/logs-context";

export interface Importacao {
  id: string;
  arquivoImportado: string;
  formatoValido: boolean;
  registroDuplicado: boolean;
  quantidadeInconsistencias: number;
  statusValida: "Aprovado" | "Reprovado";
  responsavel: string;
  dataValida: string;
  mensagem: string;
}

const mockImportacoesIniciais: Importacao[] = [
  {
    id: "IMP-902102",
    arquivoImportado: "clientes_leads_maio.csv",
    formatoValido: true,
    registroDuplicado: false,
    quantidadeInconsistencias: 0,
    statusValida: "Aprovado",
    responsavel: "Usuário Suporte",
    dataValida: "2026-06-10T11:00:00.000Z",
    mensagem: "Arquivo validado com 100% de conformidade estrutural. Integridade dos dados garantida.",
  },
  {
    id: "IMP-104920",
    arquivoImportado: "tabela_precos_corrompida.pdf",
    formatoValido: false,
    registroDuplicado: false,
    quantidadeInconsistencias: 1,
    statusValida: "Reprovado",
    responsavel: "Maria Santos",
    dataValida: "2026-06-12T15:20:00.000Z",
    mensagem: "Erro crítico de formato. Formato de arquivo PDF não é suportado pelo ERP (formatos aceitos: CSV, XLSX, JSON).",
  },
];

export function useValidacaoImportacao() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addNotification } = useNotifications();

  const [importacoes, setImportacoes] = useState<Importacao[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_importacoes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar importacoes:", e);
        }
      }
    }
    return mockImportacoesIniciais;
  });

  const [historicoValida, setHistoricoValida] = useState<Importacao[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_validacoes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico de validacoes:", e);
        }
      }
    }
    return mockImportacoesIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_importacoes", JSON.stringify(importacoes));
  }, [importacoes]);

  useEffect(() => {
    localStorage.setItem("erp_historico_validacoes", JSON.stringify(historicoValida));
  }, [historicoValida]);

  // Sync entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const savedImps = localStorage.getItem("erp_importacoes");
      const savedHist = localStorage.getItem("erp_historico_validacoes");
      if (savedImps) {
        try { setImportacoes(JSON.parse(savedImps)); } catch (e) {}
      }
      if (savedHist) {
        try { setHistoricoValida(JSON.parse(savedHist)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Processar importação e executar varredura de integridade em segundo plano
  const importarEValidar = useCallback(
    (arquivoNome: string, cenario: "ok" | "formato_invalido" | "duplicado" | "inconsistencias") => {
      setError(null);

      const cleanedNome = arquivoNome.trim();
      if (!cleanedNome) {
        setError("O nome do arquivo importado é obrigatório.");
        return false;
      }

      // Validação de formato/extensão prévia
      const ext = cleanedNome.split(".").pop()?.toLowerCase() || "";
      const extensoesPermitidas = ["csv", "xlsx", "json"];
      const eFormatoValido = extensoesPermitidas.includes(ext) && cenario !== "formato_invalido";

      const id = `IMP-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataAtual = new Date().toISOString();

      let registroDuplicado = false;
      let quantidadeInconsistencias = 0;
      let statusValida: Importacao["statusValida"] = "Aprovado";
      let mensagem = "Arquivo validado com 100% de integridade estrutural.";

      if (!eFormatoValido) {
        statusValida = "Reprovado";
        quantidadeInconsistencias = 1;
        mensagem = `Formato de arquivo ".${ext}" inválido ou corrompido. Extensões aceitas pelo ERP: CSV, XLSX e JSON.`;
      } else if (cenario === "duplicado") {
        statusValida = "Reprovado";
        registroDuplicado = true;
        quantidadeInconsistencias = 4;
        mensagem = "Validação falhou: Encontrados 4 registros com chaves primárias duplicadas que causariam sobreposição de chaves no ERP.";
      } else if (cenario === "inconsistencias") {
        statusValida = "Reprovado";
        quantidadeInconsistencias = 12;
        mensagem = "Validação falhou: Encontradas 12 células com dados corrompidos, campos numéricos vazios ou formatação incompatível.";
      }

      const novaImportacao: Importacao = {
        id,
        arquivoImportado: cleanedNome,
        formatoValido: eFormatoValido,
        registroDuplicado,
        quantidadeInconsistencias,
        statusValida,
        responsavel: user.name,
        dataValida: dataAtual,
        mensagem,
      };

      // Adiciona na lista ativa e no histórico de validações imutável
      setImportacoes((prev) => [novaImportacao, ...prev]);
      setHistoricoValida((prev) => [novaImportacao, ...prev]);

      // Emite alertas em caso de erros encontrados
      if (statusValida === "Reprovado") {
        addNotification(
          "Alerta de Inconsistência",
          `A importação do arquivo "${cleanedNome}" foi bloqueada por inconsistências (${quantidadeInconsistencias} erros detectados).`,
          "error",
          "geral"
        );
      } else {
        addNotification(
          "Importação Concluída",
          `Arquivo "${cleanedNome}" importado com sucesso. Registros inseridos nos módulos internos.`,
          "success",
          "geral"
        );
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      addLog(`Validou importação de arquivo ${cleanedNome}: ${statusValida}`, "sistema");

      // Retorna true se passou na validação (permitindo a persistência nos módulos internos)
      return statusValida === "Aprovado";
    },
    [user, addNotification]
  );

  return {
    importacoes,
    historicoValida,
    error,
    setError,
    importarEValidar,
  };
}
