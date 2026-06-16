"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useFuncionarios } from "./useFuncionarios";

export interface EventoCorporativo {
  idEvento: string;
  titulo: string;
  dataHora: string; // format: YYYY-MM-DDTHH:MM
  duracaoMinutos: number;
  descricao?: string;
  participantesVinculados: string[]; // employee emails
  status: "Agendado" | "Confirmado" | "Cancelado" | "Concluido";
  usuarioResponsavel: string;
}

const mockEventosIniciais: EventoCorporativo[] = [
  {
    idEvento: "EVT-8942",
    titulo: "Reunião de Alinhamento Semanal",
    dataHora: "2026-06-18T10:00",
    duracaoMinutos: 60,
    descricao: "Alinhamento das sprints semanais de desenvolvimento e vendas.",
    participantesVinculados: ["joao.silva@erppro.com", "maria.santos@erppro.com"],
    status: "Agendado",
    usuarioResponsavel: "João da Silva",
  },
  {
    idEvento: "EVT-7521",
    titulo: "Apresentação de BI com Diretores",
    dataHora: "2026-06-19T14:30",
    duracaoMinutos: 90,
    descricao: "Revisão dos novos painéis analíticos de demanda e KPIs.",
    participantesVinculados: ["joao.silva@erppro.com"],
    status: "Confirmado",
    usuarioResponsavel: "Maria Santos",
  },
];

export function useAgenda() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addNotification } = useNotifications();
  const { funcionarios } = useFuncionarios();

  const [eventos, setEventos] = useState<EventoCorporativo[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_agenda_eventos");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar eventos da agenda:", e);
        }
      }
    }
    return mockEventosIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("erp_agenda_eventos", JSON.stringify(eventos));
  }, [eventos]);

  const adicionarEvento = (
    titulo: string,
    dataHora: string,
    duracaoMinutos: number,
    descricao: string,
    participantes: string[]
  ): boolean => {
    setError(null);

    if (!titulo.trim()) {
      setError("O Título do Evento é obrigatório.");
      return false;
    }

    if (!dataHora) {
      setError("A Data e Horário do Evento são obrigatórios.");
      return false;
    }

    if (duracaoMinutos <= 0) {
      setError("A duração do evento deve ser superior a zero minutos.");
      return false;
    }

    if (participantes.length === 0) {
      setError("Selecione pelo menos um Participante Vinculado.");
      return false;
    }

    // 1. Validar disponibilidade na agenda (Overlap check)
    // Para simplificar, assumimos que dois eventos não podem iniciar no mesmo horário exato
    const conflito = eventos.some(
      (e) => e.status !== "Cancelado" && e.dataHora === dataHora
    );

    if (conflito) {
      setError("O horário selecionado já possui um compromisso agendado na agenda.");
      return false;
    }

    // 2. Validar se os participantes selecionados são perfis autorizados (existentes no ERP)
    const emailsFuncionarios = funcionarios.map((f) => f.email.toLowerCase());
    const invalidos = participantes.filter(
      (email) => !emailsFuncionarios.includes(email.toLowerCase())
    );

    if (invalidos.length > 0) {
      setError(`Os seguintes participantes são inválidos ou não estão cadastrados no ERP: ${invalidos.join(", ")}`);
      return false;
    }

    const idEvento = `EVT-${Math.floor(1000 + Math.random() * 9000)}`;

    const novoEvento: EventoCorporativo = {
      idEvento,
      titulo: titulo.trim(),
      dataHora,
      duracaoMinutos,
      descricao: descricao.trim(),
      participantesVinculados: participantes,
      status: "Agendado",
      usuarioResponsavel: user?.name || "Usuário",
    };

    setEventos((prev) => [novoEvento, ...prev]);

    // 3. Enviar notificações e lembretes automáticos aos envolvidos
    participantes.forEach((pEmail) => {
      addNotification(
        "Novo Convite de Evento",
        `Você foi convidado para o evento '${titulo}' agendado para o dia ${new Date(dataHora).toLocaleString("pt-BR")}.`,
        "info",
        "geral"
      );
    });

    addLog(
      `Agendou o compromisso corporativo '${titulo}' para a data ${dataHora}. ID: ${idEvento}`,
      "seguranca" // Using security/relatorios context logging
    );

    return true;
  };

  const alterarStatusEvento = (id: string, novoStatus: EventoCorporativo["status"]) => {
    setEventos((prev) =>
      prev.map((e) => {
        if (e.idEvento === id) {
          const oldStatus = e.status;
          addLog(
            `Alterou o status do compromisso '${e.titulo}' (${id}) de '${oldStatus}' para '${novoStatus}'.`,
            "seguranca"
          );
          
          // Enviar notificação sobre alteração
          e.participantesVinculados.forEach((part) => {
            addNotification(
              "Evento Atualizado",
              `O status do evento '${e.titulo}' foi alterado para '${novoStatus}'.`,
              "info",
              "geral"
            );
          });

          return { ...e, status: novoStatus };
        }
        return e;
      })
    );
  };

  const removerEvento = (id: string) => {
    const oldEvt = eventos.find((e) => e.idEvento === id);
    setEventos((prev) => prev.filter((e) => e.idEvento !== id));
    if (oldEvt) {
      addLog(`Removeu o evento corporativo '${oldEvt.titulo}' (ID: ${id}) da agenda.`, "seguranca");
    }
  };

  return {
    eventos,
    error,
    setError,
    adicionarEvento,
    alterarStatusEvento,
    removerEvento,
  };
}
