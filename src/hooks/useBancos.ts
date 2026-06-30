"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/contexts/logs-context";

export interface TransacaoBancaria {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: "credito" | "debito";
}

export interface ConexaoBancaria {
  id: string;
  bancoNome: string;
  agencia: string;
  contaNumero: string;
  statusConexao: "ativa" | "inativa" | "sincronizando";
  dataSincronizacao?: string;
  saldo: number;
  transacoes: TransacaoBancaria[];
}

const conexoesIniciais: ConexaoBancaria[] = [
  {
    id: "INTEG-001",
    bancoNome: "Banco do Brasil",
    agencia: "0001",
    contaNumero: "10234-5",
    statusConexao: "ativa",
    dataSincronizacao: "2026-06-14T18:00:00.000Z",
    saldo: 45900.50,
    transacoes: [
      { id: "TX-001", descricao: "Recebimento Metalúrgica Alfa", valor: 12500.00, data: "2026-06-10T14:00:00.000Z", tipo: "credito" },
      { id: "TX-002", descricao: "Tarifa Bancária Mensal", valor: 45.00, data: "2026-06-12T08:00:00.000Z", tipo: "debito" }
    ]
  },
  {
    id: "INTEG-002",
    bancoNome: "Itaú Unibanco",
    agencia: "4050",
    contaNumero: "98765-4",
    statusConexao: "inativa",
    saldo: 0,
    transacoes: []
  }
];

export function useBancos() {
  const { addLog } = useLogs();
  const [conexoes, setConexoes] = useState<ConexaoBancaria[]>(conexoesIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorBancos, setErrorBancos] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_bancos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setConexoes(parsed);
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
      localStorage.setItem("erp_bancos", JSON.stringify(conexoes));
    }
  }, [conexoes, isLoaded]);

  const limparErroBancos = () => setErrorBancos(null);

  const adicionarConexao = (dados: Omit<ConexaoBancaria, "id" | "statusConexao" | "saldo" | "transacoes" | "dataSincronizacao">) => {
    setErrorBancos(null);

    if (!dados.bancoNome) {
      setErrorBancos("Selecione um banco válido.");
      return false;
    }

    if (!dados.agencia || !dados.contaNumero) {
      setErrorBancos("Agência e número de conta são obrigatórios.");
      return false;
    }

    const idGerado = `INTEG-00${conexoes.length + 1}`;
    const nova: ConexaoBancaria = {
      ...dados,
      id: idGerado,
      statusConexao: "inativa",
      saldo: 0,
      transacoes: []
    };

    setConexoes((prev) => [...prev, nova]);
    addLog(`Adicionou conexão bancária: ${dados.bancoNome} (Ag: ${dados.agencia} CC: ${dados.contaNumero})`, "financeiro");
    return true;
  };

  const removerConexao = (id: string) => {
    const conexao = conexoes.find((c) => c.id === id);
    setConexoes((prev) => prev.filter((c) => c.id !== id));
    if (conexao) {
      addLog(`Removeu conexão bancária: ${conexao.bancoNome}`, "financeiro");
    }
  };

  const sincronizarConexao = (id: string) => {
    setConexoes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, statusConexao: "sincronizando" } : c))
    );

    setTimeout(() => {
      setConexoes((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const novasTransacoes: TransacaoBancaria[] = [
              {
                id: `TX-${Math.floor(100 + Math.random() * 900)}`,
                descricao: "Sincronização Automática ERP",
                valor: Math.floor(500 + Math.random() * 3000),
                data: new Date().toISOString(),
                tipo: Math.random() > 0.4 ? "credito" : "debito"
              },
              ...c.transacoes
            ];

            const novoSaldo = novasTransacoes.reduce((acc, t) => {
              return t.tipo === "credito" ? acc + t.valor : acc - t.valor;
            }, 10000);

            addLog(`Sincronizou extrato bancário (Banco: ${c.bancoNome}, ID: ${c.id})`, "financeiro");

            return {
              ...c,
              statusConexao: "ativa",
              dataSincronizacao: new Date().toISOString(),
              saldo: parseFloat(novoSaldo.toFixed(2)),
              transacoes: novasTransacoes
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  return {
    conexoes,
    errorBancos,
    limparErroBancos,
    adicionarConexao,
    removerConexao,
    sincronizarConexao
  };
}
