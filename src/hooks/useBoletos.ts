"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/contexts/logs-context";

export interface Boleto {
  id: string;
  lancamentoId: string;
  clienteNome: string;
  valor: number;
  dataVencimento: string;
  status: "pendente" | "pago" | "vencido" | "cancelado";
  codigoBarras: string;
  dataGeracao: string;
}

const boletosIniciais: Boleto[] = [
  {
    id: "BOL-2026-001",
    lancamentoId: "FIN-001",
    clienteNome: "Metalúrgica Alfa Ltda",
    valor: 12500.00,
    dataVencimento: "2026-06-25",
    status: "pendente",
    codigoBarras: "34191.79001 01043.513184 91020.150008 7 90020000012500",
    dataGeracao: "2026-06-10T14:32:00.000Z"
  },
  {
    id: "BOL-2026-002",
    lancamentoId: "FIN-006",
    clienteNome: "Clínica Médica Viver Bem",
    valor: 3890.00,
    dataVencimento: "2026-06-12",
    status: "vencido",
    codigoBarras: "34191.79001 01043.513184 91020.150008 7 90020000003890",
    dataGeracao: "2026-05-28T09:15:00.000Z"
  }
];

export function useBoletos() {
  const { addLog } = useLogs();
  const [boletos, setBoletos] = useState<Boleto[]>(boletosIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorBoletos, setErrorBoletos] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_boletos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setBoletos(parsed);
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
      localStorage.setItem("erp_boletos", JSON.stringify(boletos));
    }
  }, [boletos, isLoaded]);

  const limparErroBoletos = () => setErrorBoletos(null);

  const gerarCodigoBarrasMock = (valor: number): string => {
    const banco = "341";
    const moeda = "9";
    const campo1 = `${banco}${moeda}${String(Math.floor(10000 + Math.random() * 90000))}`;
    const campo2 = String(Math.floor(1000000000 + Math.random() * 9000000000));
    const campo3 = String(Math.floor(1000000000 + Math.random() * 9000000000));
    const dv = String(Math.floor(1 + Math.random() * 9));
    const valorCentavos = String(Math.round(valor * 100)).padStart(10, "0");
    const fatorkVencimento = "9002";
    return `${campo1.slice(0, 5)}.${campo1.slice(5)} ${campo2.slice(0, 5)}.${campo2.slice(5)} ${campo3.slice(0, 5)}.${campo3.slice(5)} ${dv} ${fatorkVencimento}${valorCentavos}`;
  };

  const gerarBoleto = (dados: { lancamentoId: string; clienteNome: string; valor: number }) => {
    setErrorBoletos(null);

    const checkExistente = boletos.some((b) => b.lancamentoId === dados.lancamentoId && b.status !== "cancelado");
    if (checkExistente) {
      setErrorBoletos("Já existe um boleto ativo gerado para este lançamento.");
      return false;
    }

    const sequencial = boletos.length + 1;
    const idGerado = `BOL-2026-${String(sequencial).padStart(3, "0")}`;
    const dataVenc = new Date();
    dataVenc.setDate(dataVenc.getDate() + 15);
    const vencimentoStr = dataVenc.toISOString().split("T")[0];

    const novoBoleto: Boleto = {
      id: idGerado,
      lancamentoId: dados.lancamentoId,
      clienteNome: dados.clienteNome,
      valor: dados.valor,
      dataVencimento: vencimentoStr,
      status: "pendente",
      codigoBarras: gerarCodigoBarrasMock(dados.valor),
      dataGeracao: new Date().toISOString()
    };

    setBoletos((prev) => [novoBoleto, ...prev]);
    addLog(`Gerou boleto ${idGerado} para ${dados.clienteNome} no valor de R$ ${dados.valor}`, "financeiro");
    return true;
  };

  const cancelarBoleto = (id: string) => {
    setBoletos((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          addLog(`Cancelou o boleto ${id}`, "financeiro");
          return { ...b, status: "cancelado" };
        }
        return b;
      })
    );
  };

  const liquidarBoleto = (id: string) => {
    setBoletos((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          addLog(`Liquidou o boleto ${id}`, "financeiro");
          return { ...b, status: "pago" };
        }
        return b;
      })
    );
  };

  return {
    boletos,
    errorBoletos,
    limparErroBoletos,
    gerarBoleto,
    cancelarBoleto,
    liquidarBoleto
  };
}
