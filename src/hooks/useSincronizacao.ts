"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface SincronizacaoRegistro {
  id: string; // ID da Sincronização gerado automaticamente (imutável)
  origem: string; // Origem dos Dados (editável)
  destino: string; // Destino da Sincronização (editável)
  tipoEvento: string; // Tipo de Evento (editável)
  status: "Sincronizado" | "Conflito Detectado" | "Processando"; // Status da Sincronização (automático)
  horarioExecucao: string; // Horário da Execução (timestamp)
  usuarioResponsavel: string; // Usuário Responsável (vinculado)
  emailResponsavel: string; // E-mail do Usuário Responsável
  logOperacao: string; // Log da Operação (imutável)
  versaoRegistro: number; // Versão do Registro (atualizado automaticamente)
}

const SINCRONIZACOES_INICIAIS: SincronizacaoRegistro[] = [
  {
    id: "SYNC-7701",
    origem: "Shopify API Checkout",
    destino: "Módulo de Vendas & Faturamento",
    tipoEvento: "Importação de Pedido",
    status: "Sincronizado",
    horarioExecucao: new Date(Date.now() - 600000).toISOString(), // 10 min atrás
    usuarioResponsavel: "Usuário Suporte",
    emailResponsavel: "admin@erppro.com",
    logOperacao: "Sincronização executada com sucesso. 15 registros importados e propagados para Estoque e Financeiro. Integridade transacional OK.",
    versaoRegistro: 1,
  },
  {
    id: "SYNC-7702",
    origem: "API Mercado Pago",
    destino: "Financeiro (Fluxo de Caixa)",
    tipoEvento: "Webhook de Recebimento",
    status: "Sincronizado",
    horarioExecucao: new Date(Date.now() - 3600000 * 3).toISOString(), // 3h atrás
    usuarioResponsavel: "Usuário Suporte",
    emailResponsavel: "admin@erppro.com",
    logOperacao: "Confirmação de recebimento registrada no contas a receber. Versão do registro de faturamento incrementada.",
    versaoRegistro: 2,
  },
];

export function useSincronizacao() {
  const { user } = useAuth();
  const [sincronizacoes, setSincronizacoes] = useState<SincronizacaoRegistro[]>([]);
  const [activeVersions, setActiveVersions] = useState<Record<string, number>>({});

  // Carregar do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSyncs = localStorage.getItem("erp_sincronizacoes_data");
      if (savedSyncs) {
        try {
          const parsed = JSON.parse(savedSyncs);
          setSincronizacoes(parsed);
          
          // Mapear versões de registros existentes
          const versionsMap: Record<string, number> = {};
          parsed.forEach((s: SincronizacaoRegistro) => {
            const key = `${s.origem}->${s.destino}`;
            versionsMap[key] = Math.max(versionsMap[key] || 1, s.versaoRegistro);
          });
          setActiveVersions(versionsMap);
        } catch (e) {
          setSincronizacoes(SINCRONIZACOES_INICIAIS);
        }
      } else {
        setSincronizacoes(SINCRONIZACOES_INICIAIS);
        localStorage.setItem("erp_sincronizacoes_data", JSON.stringify(SINCRONIZACOES_INICIAIS));
      }
    }
  }, []);

  const rodarSincronizacao = (origem: string, destino: string, tipoEvento: string, simulateConflict: boolean = false) => {
    const timestamp = new Date().toISOString();
    const syncId = `SYNC-${Date.now()}`;
    const key = `${origem}->${destino}`;
    
    // Incrementar versão do registro de forma automática
    const novaVersao = (activeVersions[key] || 0) + 1;
    setActiveVersions((prev) => ({ ...prev, [key]: novaVersao }));

    const statusSync = simulateConflict ? "Conflito Detectado" : "Sincronizado";
    const logMsg = simulateConflict
      ? `FALHA: Conflito de atualização simultânea detectado no módulo [${destino}] para a versão de registro ${novaVersao}. O sistema bloqueou a propagação para evitar inconsistências e registrou auditoria.`
      : `SUCESSO: Sincronização de dados em tempo real concluída para a transação. O módulo [${destino}] foi atualizado automaticamente. Log de trânsito verificado.`;

    const novaSync: SincronizacaoRegistro = {
      id: syncId, // Gerado automaticamente
      origem, // Editável
      destino, // Editável
      tipoEvento, // Editável
      status: statusSync, // Atualizado automaticamente
      horarioExecucao: timestamp, // Registrar timestamp
      usuarioResponsavel: user.name, // Vinculado ao usuário autenticado
      emailResponsavel: user.email,
      logOperacao: logMsg, // Imutável para garantir integridade
      versaoRegistro: novaVersao, // Atualizado automaticamente
    };

    setSincronizacoes((prev) => {
      const list = [novaSync, ...prev];
      localStorage.setItem("erp_sincronizacoes_data", JSON.stringify(list));
      return list;
    });
  };

  return {
    sincronizacoes,
    rodarSincronizacao,
  };
}
