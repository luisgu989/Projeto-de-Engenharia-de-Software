"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface AtendimentoCRM {
  id: string;
  clienteId: string;
  clienteNome: string;
  tipoInteracao: "E-mail" | "Telefone" | "Reunião" | "Suporte" | "WhatsApp";
  descricao: string;
  statusAtendimento: "aberto" | "em_andamento" | "resolvido" | "cancelado";
  dataRegistro: string;
  usuarioResponsavel: string;
}

const atendimentosIniciais: AtendimentoCRM[] = [
  {
    id: "CRM-001",
    clienteId: "CLI-001",
    clienteNome: "Metalúrgica Alfa Ltda",
    tipoInteracao: "Telefone",
    descricao: "Contato para negociar prazo de entrega do lote de chapas de aço. Cliente solicitou urgência.",
    statusAtendimento: "resolvido",
    dataRegistro: "2026-06-12T10:00:00.000Z",
    usuarioResponsavel: "Luís Fernando"
  },
  {
    id: "CRM-002",
    clienteId: "CLI-002",
    clienteNome: "Arthur Henrique de Oliveira",
    tipoInteracao: "WhatsApp",
    descricao: "Envio de orçamentos extras para kits residenciais. Aguardando retorno com aprovação.",
    statusAtendimento: "em_andamento",
    dataRegistro: "2026-06-14T15:30:00.000Z",
    usuarioResponsavel: "Luís Fernando"
  }
];

export function useRelacionamento() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [atendimentos, setAtendimentos] = useState<AtendimentoCRM[]>(atendimentosIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorCRM, setErrorCRM] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_atendimentos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setAtendimentos(parsed);
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
      localStorage.setItem("erp_atendimentos", JSON.stringify(atendimentos));
    }
  }, [atendimentos, isLoaded]);

  const limparErroCRM = () => setErrorCRM(null);

  const adicionarAtendimento = (dados: Omit<AtendimentoCRM, "id" | "dataRegistro" | "usuarioResponsavel">) => {
    setErrorCRM(null);

    if (!dados.clienteId || !dados.tipoInteracao) {
      setErrorCRM("Cliente e tipo de interação são obrigatórios.");
      return false;
    }

    if (!dados.descricao || dados.descricao.trim().length < 10) {
      setErrorCRM("A descrição do atendimento deve conter pelo menos 10 caracteres.");
      return false;
    }

    const idGerado = `CRM-${String(atendimentos.length + 1).padStart(3, "0")}`;
    const novoAtendimento: AtendimentoCRM = {
      ...dados,
      id: idGerado,
      dataRegistro: new Date().toISOString(),
      usuarioResponsavel: user.name || "Operador Administrativo"
    };

    setAtendimentos((prev) => [novoAtendimento, ...prev]);
    addLog(`Cadastrou atendimento ${idGerado} para o cliente ${dados.clienteNome}`, "crm");
    return true;
  };

  const atualizarStatusAtendimento = (id: string, novoStatus: AtendimentoCRM["statusAtendimento"]) => {
    setAtendimentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, statusAtendimento: novoStatus } : a))
    );
    addLog(`Atualizou o status do atendimento ${id} para ${novoStatus}`, "crm");
  };

  const removerAtendimento = (id: string) => {
    setAtendimentos((prev) => prev.filter((a) => {
      if (a.id === id) addLog(`Removeu o atendimento ${id}`, "crm");
      return a.id !== id;
    }));
  };

  return {
    atendimentos,
    errorCRM,
    limparErroCRM,
    adicionarAtendimento,
    atualizarStatusAtendimento,
    removerAtendimento
  };
}
