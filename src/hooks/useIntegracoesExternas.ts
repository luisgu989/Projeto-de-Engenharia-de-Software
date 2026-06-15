"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/contexts/logs-context";

export interface IntegracaoExterna {
  id: string;
  nome: string;
  tipo: "REST" | "SOAP" | "Webhook" | "GraphQL";
  endpoint: string;
  chaveAcesso: string;
  dataAtualizacao: string;
  status: "ativa" | "inativa";
}

const mockIntegracoesIniciais: IntegracaoExterna[] = [
  {
    id: "INT-001",
    nome: "API Sefaz Nacional",
    tipo: "REST",
    endpoint: "https://api.sefaz.gov.br/v1/nfe",
    chaveAcesso: "sefaz_prod_key_771829",
    dataAtualizacao: "2026-06-01T08:00:00.000Z",
    status: "ativa"
  },
  {
    id: "INT-002",
    nome: "Gateway de Pagamentos Stripe",
    tipo: "REST",
    endpoint: "https://api.stripe.com/v1/charges",
    chaveAcesso: "sk_live_51N2x89YhG19asK",
    dataAtualizacao: "2026-06-05T14:30:00.000Z",
    status: "ativa"
  },
  {
    id: "INT-003",
    nome: "Webhook Melhor Envio",
    tipo: "Webhook",
    endpoint: "https://api.melhorenvio.com.br/webhooks/shipments",
    chaveAcesso: "me_wh_sig_8829102",
    dataAtualizacao: "2026-06-10T10:00:00.000Z",
    status: "inativa"
  }
];

export function useIntegracoesExternas() {
  const { addLog } = useLogs();
  const [integracoes, setIntegracoes] = useState<IntegracaoExterna[]>(mockIntegracoesIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_integracoes_externas");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setIntegracoes(parsed);
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
      localStorage.setItem("erp_integracoes_externas", JSON.stringify(integracoes));
    }
  }, [integracoes, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_integracoes_externas");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setIntegracoes((current) => {
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

  const validarUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };

  const verificarNomeUnico = (nome: string, excludeId?: string) => {
    const cleaned = nome.trim().toLowerCase();
    return integracoes.some((i) => i.id !== excludeId && i.nome.trim().toLowerCase() === cleaned);
  };

  const adicionarIntegracao = (
    nome: string,
    tipo: IntegracaoExterna["tipo"],
    endpoint: string,
    chaveAcesso: string
  ) => {
    setError(null);
    if (!nome.trim() || !endpoint.trim() || !chaveAcesso.trim()) {
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      return false;
    }
    if (verificarNomeUnico(nome)) {
      setError("Já existe uma integração cadastrada com este nome.");
      return false;
    }
    if (!validarUrl(endpoint)) {
      setError("O endpoint deve ser uma URL válida (ex: https://exemplo.com).");
      return false;
    }

    const id = `INT-${String(integracoes.length + 1).padStart(3, "0")}-${Math.floor(Math.random() * 100)}`;
    const nova: IntegracaoExterna = {
      id,
      nome: nome.trim(),
      tipo,
      endpoint: endpoint.trim(),
      chaveAcesso: chaveAcesso.trim(),
      dataAtualizacao: new Date().toISOString(),
      status: "ativa"
    };

    setIntegracoes((prev) => [nova, ...prev]);
    addLog(`Adicionou integração externa: ${nova.nome} (${nova.tipo})`, "seguranca");
    return true;
  };

  const atualizarIntegracao = (
    id: string,
    nome: string,
    tipo: IntegracaoExterna["tipo"],
    endpoint: string,
    chaveAcesso: string,
    status: IntegracaoExterna["status"]
  ) => {
    setError(null);
    if (!nome.trim() || !endpoint.trim() || !chaveAcesso.trim()) {
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      return false;
    }
    if (verificarNomeUnico(nome, id)) {
      setError("Já existe uma integração cadastrada com este nome.");
      return false;
    }
    if (!validarUrl(endpoint)) {
      setError("O endpoint deve ser uma URL válida (ex: https://exemplo.com).");
      return false;
    }

    setIntegracoes((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              nome: nome.trim(),
              tipo,
              endpoint: endpoint.trim(),
              chaveAcesso: chaveAcesso.trim(),
              status,
              dataAtualizacao: new Date().toISOString()
            }
          : i
      )
    );
    addLog(`Atualizou integração externa: ${nome} (ID: ${id})`, "seguranca");
    return true;
  };

  const removerIntegracao = (id: string) => {
    const alvo = integracoes.find((i) => i.id === id);
    if (alvo) {
      setIntegracoes((prev) => prev.filter((i) => i.id !== id));
      addLog(`Removeu integração externa: ${alvo.nome} (ID: ${id})`, "seguranca");
      return true;
    }
    return false;
  };

  return {
    integracoes,
    adicionarIntegracao,
    atualizarIntegracao,
    removerIntegracao,
    error,
    setError
  };
}
