"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/contexts/logs-context";

export interface Cobranca {
  id: string;
  clienteNome: string;
  documentoBoletoId: string;
  dataVencimento: string;
  canalEnvio: "email" | "whatsapp" | "sms";
  statusNotificacao: "pendente" | "enviada" | "erro";
  dataEnvio?: string;
  mensagem: string;
}

const cobrancasIniciais: Cobranca[] = [
  {
    id: "COB-001",
    clienteNome: "Metalúrgica Alfa Ltda",
    documentoBoletoId: "BOL-2026-001",
    dataVencimento: "2026-06-25",
    canalEnvio: "email",
    statusNotificacao: "enviada",
    dataEnvio: "2026-06-12T10:00:00.000Z",
    mensagem: "Prezado cliente, lembramos que seu boleto no valor de R$ 12.500,00 vence em 25/06/2026. Agradecemos a parceria!"
  },
  {
    id: "COB-002",
    clienteNome: "Clínica Médica Viver Bem",
    documentoBoletoId: "BOL-2026-002",
    dataVencimento: "2026-06-12",
    canalEnvio: "whatsapp",
    statusNotificacao: "enviada",
    dataEnvio: "2026-06-13T09:30:00.000Z",
    mensagem: "Olá! Notamos que o boleto BOL-2026-002 de R$ 3.890,00 venceu em 12/06. Por favor, regularize seu débito ou entre em contato."
  }
];

export function useCobrancas() {
  const { addLog } = useLogs();
  const [cobrancas, setCobrancas] = useState<Cobranca[]>(cobrancasIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorCobrancas, setErrorCobrancas] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_cobrancas");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setCobrancas(parsed);
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
      localStorage.setItem("erp_cobrancas", JSON.stringify(cobrancas));
    }
  }, [cobrancas, isLoaded]);

  const limparErroCobrancas = () => setErrorCobrancas(null);

  const enviarCobranca = (dados: {
    clienteNome: string;
    documentoBoletoId: string;
    dataVencimento: string;
    canalEnvio: "email" | "whatsapp" | "sms";
    valor: number;
    isVencido: boolean;
  }) => {
    setErrorCobrancas(null);

    if (!dados.clienteNome || !dados.documentoBoletoId) {
      setErrorCobrancas("Boleto ou cliente inválido.");
      return false;
    }

    const idGerado = `COB-${String(cobrancas.length + 1).padStart(3, "0")}`;
    const formattedValor = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dados.valor);
    const dateFormatted = new Date(dados.dataVencimento + "T00:00:00").toLocaleDateString("pt-BR");

    const msg = dados.isVencido
      ? `Olá! Lembramos que o boleto ${dados.documentoBoletoId} no valor de ${formattedValor} referente ao vencimento ${dateFormatted} está vencido. Favor regularizar para evitar multas.`
      : `Prezado cliente, enviamos o aviso do boleto ${dados.documentoBoletoId} no valor de ${formattedValor} com vencimento para o dia ${dateFormatted}.`;

    const nova: Cobranca = {
      id: idGerado,
      clienteNome: dados.clienteNome,
      documentoBoletoId: dados.documentoBoletoId,
      dataVencimento: dados.dataVencimento,
      canalEnvio: dados.canalEnvio,
      statusNotificacao: "enviada",
      dataEnvio: new Date().toISOString(),
      mensagem: msg
    };

    setCobrancas((prev) => [nova, ...prev]);
    addLog(`Enviou cobrança ${idGerado} para o cliente ${dados.clienteNome}`, "financeiro");
    return true;
  };

  return {
    cobrancas,
    errorCobrancas,
    limparErroCobrancas,
    enviarCobranca
  };
}
