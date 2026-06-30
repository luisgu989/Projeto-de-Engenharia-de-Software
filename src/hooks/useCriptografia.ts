"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface RegistroProtegido {
  id: string; // ID do Registro protegido pelo sistema (imutável)
  tipoInformacao: string; // Tipo de Informação
  metodoCriptografia: string; // Método ideal definido pelo ERP (imutável)
  statusProtecao: "Ativa" | "Instável" | "Desativada"; // Status da Proteção
  dataCriptografia: string; // Data da Criptografia timestamp (imutável)
  permissaoAcesso: string; // Permissão de Acesso (ÚNICO EDITÁVEL)
}

export interface LogOperacaoCripto {
  id: string;
  timestamp: string;
  usuario: string;
  email: string;
  acao: string;
  registroId: string;
  tipoInformacao: string;
}

const DADOS_INICIAIS: RegistroProtegido[] = [
  {
    id: "REG-CRP-001",
    tipoInformacao: "Dados Cadastrais de Clientes (CPF/CNPJ/Endereço)",
    metodoCriptografia: "AES-256-GCM (Simétrico)",
    statusProtecao: "Ativa",
    dataCriptografia: new Date(Date.now() - 3600000 * 24 * 30).toISOString(), // 30 dias atrás
    permissaoAcesso: "Gerente Geral",
  },
  {
    id: "REG-CRP-002",
    tipoInformacao: "Folha de Pagamento & Dados Bancários de Colaboradores",
    metodoCriptografia: "AES-256-CBC (Simétrico com Salt)",
    statusProtecao: "Ativa",
    dataCriptografia: new Date(Date.now() - 3600000 * 24 * 15).toISOString(), // 15 dias atrás
    permissaoAcesso: "Diretor de RH",
  },
  {
    id: "REG-CRP-003",
    tipoInformacao: "Tokens de API & Credenciais de Integração Externa",
    metodoCriptografia: "RSA-4096-OAEP (Assimétrico)",
    statusProtecao: "Ativa",
    dataCriptografia: new Date(Date.now() - 3600000 * 24 * 60).toISOString(), // 60 dias atrás
    permissaoAcesso: "Administrador / Equipe TI",
  },
  {
    id: "REG-CRP-004",
    tipoInformacao: "Relatórios de Faturamento & Dados Contábeis",
    metodoCriptografia: "ChaCha20-Poly1305 (Alta Performance)",
    statusProtecao: "Ativa",
    dataCriptografia: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 dias atrás
    permissaoAcesso: "Diretor Financeiro",
  },
];

const OPERACOES_INICIAIS: LogOperacaoCripto[] = [
  {
    id: "OPR-1001",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    usuario: "Usuário Suporte",
    email: "admin@erppro.com",
    acao: "Criptografia ativada inicialmente para todas as tabelas sensíveis de clientes.",
    registroId: "REG-CRP-001",
    tipoInformacao: "Dados Cadastrais de Clientes (CPF/CNPJ/Endereço)",
  },
];

export function useCriptografia() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [dadosProtegidos, setDadosProtegidos] = useState<RegistroProtegido[]>([]);
  const [historicoOperacoes, setHistoricoOperacoes] = useState<LogOperacaoCripto[]>([]);

  // Carregar dados iniciais e logs de operações do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDados = localStorage.getItem("erp_dados_criptografados");
      const savedOperacoes = localStorage.getItem("erp_cripto_operacoes");

      if (savedDados) {
        try {
          setDadosProtegidos(JSON.parse(savedDados));
        } catch (e) {
          setDadosProtegidos(DADOS_INICIAIS);
        }
      } else {
        setDadosProtegidos(DADOS_INICIAIS);
        localStorage.setItem("erp_dados_criptografados", JSON.stringify(DADOS_INICIAIS));
      }

      if (savedOperacoes) {
        try {
          setHistoricoOperacoes(JSON.parse(savedOperacoes));
        } catch (e) {
          setHistoricoOperacoes(OPERACOES_INICIAIS);
        }
      } else {
        setHistoricoOperacoes(OPERACOES_INICIAIS);
        localStorage.setItem("erp_cripto_operacoes", JSON.stringify(OPERACOES_INICIAIS));
      }
    }
  }, []);

  const atualizarPermissaoAcesso = (registroId: string, novaPermissao: string) => {
    const dadosAtualizados = dadosProtegidos.map((d) => {
      if (d.id === registroId) {
        return {
          ...d,
          permissaoAcesso: novaPermissao, // Permite apenas editar este campo
        };
      }
      return d;
    });

    setDadosProtegidos(dadosAtualizados);
    localStorage.setItem("erp_dados_criptografados", JSON.stringify(dadosAtualizados));

    const registroModificado = dadosProtegidos.find((d) => d.id === registroId);
    if (registroModificado) {
      const novaOperacao: LogOperacaoCripto = {
        id: `OPR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        usuario: user.name,
        email: user.email,
        acao: `Alterou a permissão de acesso para "${novaPermissao}".`,
        registroId,
        tipoInformacao: registroModificado.tipoInformacao,
      };

      const operacoesAtualizadas = [novaOperacao, ...historicoOperacoes];
      setHistoricoOperacoes(operacoesAtualizadas);
      localStorage.setItem("erp_cripto_operacoes", JSON.stringify(operacoesAtualizadas));

      addLog(`Atualizou permissão de acesso criptográfico no registro ${registroId}`, "seguranca");
    }
  };

  return {
    dadosProtegidos,
    historicoOperacoes,
    atualizarPermissaoAcesso,
  };
}
