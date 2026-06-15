"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useEstoque } from "./useEstoque";

export interface OrdemProducao {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  dataInicio: string;
  dataPrevisao: string;
  recursoId: string;
  prioridade: "baixa" | "media" | "alta";
  status: "planejado" | "em_producao" | "concluido" | "suspenso";
  responsavel: string;
}

export interface RecursoProducao {
  id: string;
  nome: string;
  tipo: string;
  capacidadeMax: number; // un/dia
  unidade: string;
}

const recursosIniciais: RecursoProducao[] = [
  { id: "REC-001", nome: "Linha de Montagem A", tipo: "Montagem", capacidadeMax: 100, unidade: "unidades/dia" },
  { id: "REC-002", nome: "Linha de Montagem B", tipo: "Montagem", capacidadeMax: 80, unidade: "unidades/dia" },
  { id: "REC-003", nome: "Corte e Dobra CNC", tipo: "Usinagem", capacidadeMax: 150, unidade: "unidades/dia" },
  { id: "REC-004", nome: "Impressora 3D Resina", tipo: "Aditiva", capacidadeMax: 30, unidade: "unidades/dia" },
  { id: "REC-005", nome: "Pintura & Acabamento", tipo: "Acabamento", capacidadeMax: 60, unidade: "unidades/dia" },
];

const ordensIniciais: OrdemProducao[] = [
  {
    id: "OP-001",
    produtoId: "PROD-001",
    produtoNome: "Teclado Mecânico RGB Pro",
    quantidade: 40,
    dataInicio: new Date().toISOString().split("T")[0],
    dataPrevisao: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    recursoId: "REC-001",
    prioridade: "media",
    status: "em_producao",
    responsavel: "João da Silva",
  },
  {
    id: "OP-002",
    produtoId: "PROD-002",
    produtoNome: "Mouse Gamer Sem Fio 16000DPI",
    quantidade: 50,
    dataInicio: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    dataPrevisao: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    recursoId: "REC-002",
    prioridade: "alta",
    status: "planejado",
    responsavel: "Renata Souza",
  },
  {
    id: "OP-003",
    produtoId: "PROD-005",
    produtoNome: "Headset Noise Cancelling Wireless",
    quantidade: 20,
    dataInicio: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    dataPrevisao: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    recursoId: "REC-005",
    prioridade: "media",
    status: "concluido",
    responsavel: "João da Silva",
  },
];

export function useProducao() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { registrarMovimentacao } = useEstoque();

  const [ordens, setOrdens] = useState<OrdemProducao[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_producao");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar ordens de produção:", e);
        }
      }
    }
    return ordensIniciais;
  });
  const [recursos] = useState<RecursoProducao[]>(recursosIniciais);

  useEffect(() => {
    localStorage.setItem("erp_producao", JSON.stringify(ordens));
  }, [ordens]);

  // Sync between tabs/events
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_producao");
      if (saved) {
        try {
          setOrdens(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Calculate capacity workload percentage for a resource on a specific date (US075)
  const calcularCargaRecurso = (recursoId: string, dataStr: string, currentOpId?: string) => {
    const ordersOnDate = ordens.filter(
      (o) =>
        o.recursoId === recursoId &&
        o.dataInicio === dataStr &&
        o.id !== currentOpId &&
        (o.status === "planejado" || o.status === "em_producao")
    );
    const totalQtd = ordersOnDate.reduce((sum, o) => sum + o.quantidade, 0);
    const recurso = recursos.find((r) => r.id === recursoId);
    if (!recurso) return 0;
    return Math.round((totalQtd / recurso.capacidadeMax) * 100);
  };

  const adicionarOP = (novaOP: Omit<OrdemProducao, "id" | "status" | "responsavel">) => {
    const id = `OP-${String(ordens.length + 1).padStart(3, "0")}`;
    const opCompleta: OrdemProducao = {
      ...novaOP,
      id,
      status: "planejado",
      responsavel: user.name,
    };

    const novasOrdens = [...ordens, opCompleta];
    setOrdens(novasOrdens);

    // Track capacity warning (US075 / US079)
    const cargaRecurso = calcularCargaRecurso(novaOP.recursoId, novaOP.dataInicio) + 
      Math.round((novaOP.quantidade / (recursos.find(r => r.id === novaOP.recursoId)?.capacidadeMax || 100)) * 100);

    const recursoNome = recursos.find((r) => r.id === novaOP.recursoId)?.nome || "Recurso";

    addNotification(
      "Nova Ordem de Produção",
      `A ordem ${id} para ${novaOP.quantidade} un. de ${novaOP.produtoNome} foi planejada.`,
      "info",
      "gerente"
    );

    if (cargaRecurso > 100) {
      addNotification(
        "Alerta de Sobrecarga",
        `O recurso "${recursoNome}" ultrapassou 100% da capacidade planejada para o dia ${novaOP.dataInicio} (${cargaRecurso}% de carga).`,
        "warning",
        "gerente"
      );
    }

    // Trigger storage event to sync other tabs
    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);

    return true;
  };

  const atualizarOPStatus = (id: string, novoStatus: OrdemProducao["status"]) => {
    let statusAlteradoValido = false;
    let opEncontrada: OrdemProducao | null = null;

    const ordensAtualizadas = ordens.map((op) => {
      if (op.id === id) {
        opEncontrada = op;
        statusAlteradoValido = op.status !== novoStatus;
        return { ...op, status: novoStatus };
      }
      return op;
    });

    if (statusAlteradoValido && opEncontrada) {
      setOrdens(ordensAtualizadas);
      const op = opEncontrada as OrdemProducao;

      addNotification(
        "Status de Produção Alterado",
        `A ordem ${op.id} (${op.produtoNome}) está agora: ${
          novoStatus === "em_producao"
            ? "Em Produção"
            : novoStatus === "concluido"
            ? "Concluída"
            : novoStatus === "suspenso"
            ? "Suspensa"
            : "Planejada"
        }.`,
        novoStatus === "concluido" ? "success" : "info",
        "gerente"
      );

      // If completed, automatically update stock (US075 -> inventory integration)
      if (novoStatus === "concluido") {
        registrarMovimentacao(
          op.produtoId,
          "entrada",
          op.quantidade,
          `Conclusão de Ordem de Produção ${op.id}`
        );

        addNotification(
          "Entrada de Estoque Operacional",
          `Foram adicionadas ${op.quantidade} un. de ${op.produtoNome} ao estoque.`,
          "success",
          "gerente"
        );
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);
      return true;
    }
    return false;
  };

  const removerOP = (id: string) => {
    const op = ordens.find((o) => o.id === id);
    if (!op) return false;

    setOrdens((prev) => prev.filter((o) => o.id !== id));
    addNotification(
      "Ordem de Produção Cancelada",
      `A ordem ${op.id} para ${op.produtoNome} foi removida do planejamento.`,
      "warning",
      "gerente"
    );

    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);
    return true;
  };

  return {
    ordens,
    recursos,
    adicionarOP,
    atualizarOPStatus,
    removerOP,
    calcularCargaRecurso,
  };
}
