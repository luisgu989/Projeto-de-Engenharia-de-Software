"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface RegistroSensivel {
  id: string; // ID do Registro gerado automaticamente (imutável)
  tipoDado: "CPF" | "E-mail" | "Telefone" | "Dados Bancários"; // Tipo de Dado
  valorOriginal: string; // Valor original antes da anonimização
  valorAtual: string; // Valor atual (mascarado/anônimo após processamento)
  status: "Pendente" | "Anonimizado"; // Status de Anonimização
  metodoAplicado: string; // Método Aplicado
  dataAnonimizacao: string | null; // Data da Anonimização (timestamp)
  integridadePreservada: boolean; // Integridade Referencial
}

export interface LogOperacaoAnonima {
  id: string;
  timestamp: string;
  usuario: string;
  email: string;
  registroId: string;
  tipoDado: string;
  metodo: string;
  acao: string;
}

const REGISTROS_INICIAIS: RegistroSensivel[] = [
  {
    id: "REG-SENS-101",
    tipoDado: "CPF",
    valorOriginal: "458.963.214-77",
    valorAtual: "458.963.214-77",
    status: "Pendente",
    metodoAplicado: "Nenhum",
    dataAnonimizacao: null,
    integridadePreservada: true,
  },
  {
    id: "REG-SENS-102",
    tipoDado: "E-mail",
    valorOriginal: "carlos.almeida@hotmail.com",
    valorAtual: "carlos.almeida@hotmail.com",
    status: "Pendente",
    metodoAplicado: "Nenhum",
    dataAnonimizacao: null,
    integridadePreservada: true,
  },
  {
    id: "REG-SENS-103",
    tipoDado: "Telefone",
    valorOriginal: "(11) 98765-4321",
    valorAtual: "(11) 98765-4321",
    status: "Pendente",
    metodoAplicado: "Nenhum",
    dataAnonimizacao: null,
    integridadePreservada: true,
  },
  {
    id: "REG-SENS-104",
    tipoDado: "Dados Bancários",
    valorOriginal: "Agência 3421-2 / Conta 45698-9 (Itaú)",
    valorAtual: "Agência 3421-2 / Conta 45698-9 (Itaú)",
    status: "Pendente",
    metodoAplicado: "Nenhum",
    dataAnonimizacao: null,
    integridadePreservada: true,
  },
];

const HISTORICO_INICIAL: LogOperacaoAnonima[] = [
  {
    id: "OPR-ANON-1001",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    usuario: "Usuário Suporte",
    email: "admin@erppro.com",
    registroId: "REG-SENS-100",
    tipoDado: "CPF",
    metodo: "Mascaramento Físico",
    acao: "Auditoria inicial de mapeamento de dados sensíveis na base de clientes.",
  },
];

export function useAnonimizacao() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<RegistroSensivel[]>([]);
  const [historicoOperacoes, setHistoricoOperacoes] = useState<LogOperacaoAnonima[]>([]);

  // Carregar dados iniciais do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRegistros = localStorage.getItem("erp_sensivel_registros");
      const savedHistorico = localStorage.getItem("erp_anon_historico");

      if (savedRegistros) {
        try {
          setRegistros(JSON.parse(savedRegistros));
        } catch (e) {
          setRegistros(REGISTROS_INICIAIS);
        }
      } else {
        setRegistros(REGISTROS_INICIAIS);
        localStorage.setItem("erp_sensivel_registros", JSON.stringify(REGISTROS_INICIAIS));
      }

      if (savedHistorico) {
        try {
          setHistoricoOperacoes(JSON.parse(savedHistorico));
        } catch (e) {
          setHistoricoOperacoes(HISTORICO_INICIAL);
        }
      } else {
        setHistoricoOperacoes(HISTORICO_INICIAL);
        localStorage.setItem("erp_anon_historico", JSON.stringify(HISTORICO_INICIAL));
      }
    }
  }, []);

  const anonimizarRegistro = (registroId: string) => {
    const timestamp = new Date().toISOString(); // Processa internamente

    const registrosAtualizados = registros.map((r) => {
      if (r.id === registroId && r.status === "Pendente") {
        // Definir automaticamente o método com base no tipo de dado sensível
        let metodo = "Mascaramento Parcial";
        let valorAnonimo = r.valorOriginal;

        if (r.tipoDado === "CPF") {
          metodo = "Mascaramento Parcial (Substituição)";
          valorAnonimo = "***.***.***-**";
        } else if (r.tipoDado === "E-mail") {
          metodo = "Hashing SHA-256 (Criptografia Irreversível)";
          // Simulação de hash SHA-256
          valorAnonimo = "sha256_" + Math.random().toString(36).substring(2, 12) + "@anon.erppro.com";
        } else if (r.tipoDado === "Telefone") {
          metodo = "Mascaramento Físico";
          valorAnonimo = "(**) *****-****";
        } else if (r.tipoDado === "Dados Bancários") {
          metodo = "Tokenização de Conta";
          valorAnonimo = "TOKEN-BANK-" + Math.floor(100000 + Math.random() * 900000);
        }

        return {
          ...r,
          status: "Anonimizado" as const, // Status de Anonimização atualizado automaticamente
          valorAtual: valorAnonimo,
          metodoAplicado: metodo, // Definido automaticamente
          dataAnonimizacao: timestamp, // Registra timestamp
          integridadePreservada: true, // Integridade preservada automaticamente
        };
      }
      return r;
    });

    setRegistros(registrosAtualizados);
    localStorage.setItem("erp_sensivel_registros", JSON.stringify(registrosAtualizados));

    const registroModificado = registros.find((r) => r.id === registroId);
    if (registroModificado) {
      // Definir método correspondente para o log
      let metodoLog = "Mascaramento";
      if (registroModificado.tipoDado === "CPF") metodoLog = "Mascaramento";
      else if (registroModificado.tipoDado === "E-mail") metodoLog = "Hashing SHA-256";
      else if (registroModificado.tipoDado === "Telefone") metodoLog = "Mascaramento";
      else if (registroModificado.tipoDado === "Dados Bancários") metodoLog = "Tokenização";

      const novaOperacao: LogOperacaoAnonima = {
        id: `OPR-ANON-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp,
        usuario: user.name,
        email: user.email,
        registroId,
        tipoDado: registroModificado.tipoDado,
        metodo: metodoLog,
        acao: `Anonimização executada com sucesso. Integridade de chaves estrangeiras preservada na base.`,
      };

      const historicoAtualizado = [novaOperacao, ...historicoOperacoes];
      setHistoricoOperacoes(historicoAtualizado);
      localStorage.setItem("erp_anon_historico", JSON.stringify(historicoAtualizado));
    }
  };

  return {
    registros,
    historicoOperacoes,
    anonimizarRegistro,
  };
}
