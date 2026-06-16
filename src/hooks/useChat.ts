"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useFuncionarios } from "./useFuncionarios";

export interface ChatMensagem {
  idMensagem: string;
  remetenteNome: string;
  remetenteEmail: string;
  destinatarioNome: string;
  destinatarioEmail: string;
  conteudo: string;
  dataEnvio: string; // ISO timestamp
  status: "Enviada" | "Entregue" | "Lida";
}

const mockMensagensIniciais: ChatMensagem[] = [
  {
    idMensagem: "MSG-101",
    remetenteNome: "João da Silva",
    remetenteEmail: "joao.silva@erppro.com",
    destinatarioNome: "Administrador Geral",
    destinatarioEmail: "admin@erppro.com",
    conteudo: "Olá! Você poderia aprovar a nova meta de faturamento que cadastrei?",
    dataEnvio: "2026-06-15T10:30:00.000Z",
    status: "Lida",
  },
  {
    idMensagem: "MSG-102",
    remetenteNome: "Administrador Geral",
    remetenteEmail: "admin@erppro.com",
    destinatarioNome: "João da Silva",
    destinatarioEmail: "joao.silva@erppro.com",
    conteudo: "Olá João! Claro, vou analisar os dados e aprovar agora mesmo.",
    dataEnvio: "2026-06-15T10:32:00.000Z",
    status: "Lida",
  },
];

export function useChat() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addToast } = useNotifications();
  const { funcionarios } = useFuncionarios();

  const [mensagens, setMensagens] = useState<ChatMensagem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_chat_mensagens");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar mensagens do chat:", e);
        }
      }
    }
    return mockMensagensIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("erp_chat_mensagens", JSON.stringify(mensagens));
  }, [mensagens]);

  const enviarMensagem = (destinatarioEmail: string, conteudo: string): boolean => {
    setError(null);

    if (!conteudo.trim()) {
      setError("O conteúdo da mensagem não pode ser vazio.");
      return false;
    }

    if (!destinatarioEmail) {
      setError("Selecione um destinatário válido.");
      return false;
    }

    // 1. Validar se o destinatário é um perfil cadastrado no ERP
    const empList = [
      { nome: "Administrador Geral", email: "admin@erppro.com" },
      ...funcionarios.map((f) => ({ nome: f.nome, email: f.email })),
    ];

    const destPerfil = empList.find(
      (emp) => emp.email.toLowerCase() === destinatarioEmail.toLowerCase()
    );

    if (!destPerfil) {
      setError("O destinatário selecionado não é um perfil cadastrado ou autorizado no ERP.");
      return false;
    }

    const idMensagem = `MSG-${Math.floor(100000 + Math.random() * 900000)}`;
    const dataEnvio = new Date().toISOString();

    const novaMensagem: ChatMensagem = {
      idMensagem,
      remetenteNome: user?.name || "Usuário",
      remetenteEmail: user?.email || "sistema@erppro.com",
      destinatarioNome: destPerfil.nome,
      destinatarioEmail: destPerfil.email,
      conteudo: conteudo.trim(),
      dataEnvio,
      status: "Enviada",
    };

    setMensagens((prev) => [...prev, novaMensagem]);

    // 2. Disparar notificação imediata
    addToast(
      `Mensagem Enviada`,
      `Mensagem para ${destPerfil.nome} foi entregue com sucesso.`,
      "success"
    );

    addLog(
      `Enviou mensagem interna para ${destPerfil.nome} (${destPerfil.email}). ID: ${idMensagem}`,
      "funcionarios"
    );

    // 3. Simular uma resposta automática após 2 segundos para dar dinamismo (opcional/premium)
    const mockRespostas = [
      "Perfeito! Vou verificar isso agora mesmo.",
      "Ok, entendi. Retorno em breve.",
      "Obrigado pelo aviso! Qualquer dúvida te chamo.",
      "Entendido! Estarei verificando com a equipe.",
      "Legal! Falamos sobre isso na próxima reunião.",
    ];

    setTimeout(() => {
      const idResposta = `MSG-${Math.floor(100000 + Math.random() * 900000)}`;
      const dataResp = new Date().toISOString();
      const respostaAleatoria = mockRespostas[Math.floor(Math.random() * mockRespostas.length)];

      const novaMensagemResposta: ChatMensagem = {
        idMensagem: idResposta,
        remetenteNome: destPerfil.nome,
        remetenteEmail: destPerfil.email,
        destinatarioNome: user?.name || "Usuário",
        destinatarioEmail: user?.email || "sistema@erppro.com",
        conteudo: respostaAleatoria,
        dataEnvio: dataResp,
        status: "Entregue",
      };

      setMensagens((prev) => [...prev, novaMensagemResposta]);
      
      // Mostrar notificação para a resposta simulada recebida
      addToast(
        `Mensagem de ${destPerfil.nome}`,
        respostaAleatoria,
        "info"
      );
    }, 2500);

    return true;
  };

  const limparConversa = (emailContato: string) => {
    const userEmail = user?.email || "";
    setMensagens((prev) =>
      prev.filter(
        (m) =>
          !(
            (m.remetenteEmail === userEmail && m.destinatarioEmail === emailContato) ||
            (m.remetenteEmail === emailContato && m.destinatarioEmail === userEmail)
          )
      )
    );
    addLog(`Limpou histórico de chat local com o contato ${emailContato}.`, "funcionarios");
  };

  return {
    mensagens,
    error,
    setError,
    enviarMensagem,
    limparConversa,
  };
}
