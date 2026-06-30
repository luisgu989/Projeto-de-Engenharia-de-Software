"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface DocumentoCorporativo {
  id: string; // ID do Documento gerado automaticamente (imutável)
  nome: string; // Nome do Documento (editável, sem duplicados)
  categoria: string; // Categoria do Documento (editável)
  setor: string; // Setor Vinculado (editável)
  versao: string; // Versão do Arquivo (atualizado automaticamente)
  usuarioResponsavel: string; // Usuário Responsável (vinculado)
  emailResponsavel: string;
  dataUpload: string; // Data de Upload (timestamp)
  status: "Em Rascunho" | "Em Revisão" | "Aprovado"; // Status (editável, bloquear após aprovado)
  historicoAlteracoes: string[]; // Histórico de Alterações (imutável)
}

export interface VersaoDocumento {
  id: string; // ID da Versão gerado automaticamente (imutável)
  documentoId: string; // Documento Vinculado (imutável)
  documentoNome: string;
  numeroVersao: number; // Número da Versão (atualizado automaticamente, ex: 1, 2)
  descricaoAlteracao: string; // Descrição da Alteração (editável)
  usuarioResponsavel: string; // Usuário Responsável (vinculado)
  emailResponsavel: string;
  dataAlteracao: string; // Data da Alteração (timestamp)
  statusVersao: "Ativa" | "Substituída" | "Restaurada"; // Status da Versão
  historicoVersionamento: string; // Histórico de Versionamento (imutável)
  ativa: boolean; // Indicador de Versão Ativa (bloquear após cadastro)
}

const DOCUMENTOS_INICIAIS: DocumentoCorporativo[] = [
  {
    id: "DOC-2026-001",
    nome: "Manual de Integração de APIs ERP v1",
    categoria: "Manual Técnico",
    setor: "TI / Tecnologia",
    versao: "1.0",
    usuarioResponsavel: "Usuário Suporte",
    emailResponsavel: "admin@erppro.com",
    dataUpload: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 dias atrás
    status: "Aprovado",
    historicoAlteracoes: ["Documento cadastrado inicialmente na base. Versão 1.0 ativa."],
  },
  {
    id: "DOC-2026-002",
    nome: "Política de Privacidade LGPD Contratos",
    categoria: "Normas Internas",
    setor: "Jurídico",
    versao: "2.0",
    usuarioResponsavel: "Maria Santos",
    emailResponsavel: "maria.santos@erppro.com",
    dataUpload: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 dias atrás
    status: "Em Revisão",
    historicoAlteracoes: [
      "Documento cadastrado inicialmente na base. Versão 1.0 ativa.",
      "Nova versão 2.0 enviada pelo usuário para revisão jurídica.",
    ],
  },
];

const VERSOES_INICIAIS: VersaoDocumento[] = [
  {
    id: "VER-2026-001",
    documentoId: "DOC-2026-001",
    documentoNome: "Manual de Integração de APIs ERP v1",
    numeroVersao: 1,
    descricaoAlteracao: "Carga inicial do manual técnico de APIs.",
    usuarioResponsavel: "Usuário Suporte",
    emailResponsavel: "admin@erppro.com",
    dataAlteracao: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    statusVersao: "Ativa",
    historicoVersionamento: "Versão 1 criada com sucesso.",
    ativa: true,
  },
  {
    id: "VER-2026-002",
    documentoId: "DOC-2026-002",
    documentoNome: "Política de Privacidade LGPD Contratos",
    numeroVersao: 1,
    descricaoAlteracao: "Carga inicial da política de privacidade.",
    usuarioResponsavel: "Maria Santos",
    emailResponsavel: "maria.santos@erppro.com",
    dataAlteracao: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    statusVersao: "Substituída",
    historicoVersionamento: "Versão 1 substituída pela versão 2.",
    ativa: false,
  },
  {
    id: "VER-2026-003",
    documentoId: "DOC-2026-002",
    documentoNome: "Política de Privacidade LGPD Contratos",
    numeroVersao: 2,
    descricaoAlteracao: "Ajuste na cláusula 4 de compartilhamento de cookies.",
    usuarioResponsavel: "Maria Santos",
    emailResponsavel: "maria.santos@erppro.com",
    dataAlteracao: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    statusVersao: "Ativa",
    historicoVersionamento: "Versão 2 criada com sucesso.",
    ativa: true,
  },
];

export function useDocumentos() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [documentos, setDocumentos] = useState<DocumentoCorporativo[]>([]);
  const [versoes, setVersoes] = useState<VersaoDocumento[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carregar do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDocs = localStorage.getItem("erp_documentos_data");
      const savedVersoes = localStorage.getItem("erp_documentos_versoes");

      if (savedDocs) {
        try {
          setDocumentos(JSON.parse(savedDocs));
        } catch (e) {
          setDocumentos(DOCUMENTOS_INICIAIS);
        }
      } else {
        setDocumentos(DOCUMENTOS_INICIAIS);
        localStorage.setItem("erp_documentos_data", JSON.stringify(DOCUMENTOS_INICIAIS));
      }

      if (savedVersoes) {
        try {
          setVersoes(JSON.parse(savedVersoes));
        } catch (e) {
          setVersoes(VERSOES_INICIAIS);
        }
      } else {
        setVersoes(VERSOES_INICIAIS);
        localStorage.setItem("erp_documentos_versoes", JSON.stringify(VERSOES_INICIAIS));
      }
    }
  }, []);

  const persistData = (newDocs: DocumentoCorporativo[], newVersoes: VersaoDocumento[]) => {
    setDocumentos(newDocs);
    setVersoes(newVersoes);
    localStorage.setItem("erp_documentos_data", JSON.stringify(newDocs));
    localStorage.setItem("erp_documentos_versoes", JSON.stringify(newVersoes));
  };

  const cadastrarDocumento = (nome: string, categoria: string, setor: string, status: DocumentoCorporativo["status"]): boolean => {
    setErrorMsg(null);
    const nomeNormalizado = nome.trim().toLowerCase();

    // Validar duplicidade de Nome
    const existeDuplicado = documentos.some((d) => d.nome.trim().toLowerCase() === nomeNormalizado);
    if (existeDuplicado) {
      setErrorMsg("Erro: Já existe um documento cadastrado com este nome na base de dados.");
      return false;
    }

    const timestamp = new Date().toISOString();
    const docId = `DOC-${Date.now()}`;
    const verId = `VER-${Date.now()}`;

    const novoDoc: DocumentoCorporativo = {
      id: docId, // Gerado automaticamente
      nome: nome.trim(), // Editável
      categoria, // Editável
      setor, // Editável
      versao: "1.0", // Atualizado automaticamente
      usuarioResponsavel: user.name, // Vinculado
      emailResponsavel: user.email,
      dataUpload: timestamp, // Registrar timestamp
      status, // Editável
      historicoAlteracoes: [`Documento cadastrado em ${new Date(timestamp).toLocaleString("pt-BR")} por ${user.name}. Versão 1.0 ativa.`],
    };

    const novaVersao: VersaoDocumento = {
      id: verId, // Gerado automaticamente
      documentoId: docId, // Imutável
      documentoNome: nome.trim(),
      numeroVersao: 1, // Atualizado automaticamente
      descricaoAlteracao: "Carga inicial do documento corporativo.",
      usuarioResponsavel: user.name,
      emailResponsavel: user.email,
      dataAlteracao: timestamp, // Registrar timestamp
      statusVersao: "Ativa", // Atualizado automaticamente
      historicoVersionamento: `Versão 1.0 registrada inicialmente.`,
      ativa: true, // Bloqueada após cadastro
    };

    persistData([novoDoc, ...documentos], [novaVersao, ...versoes]);
    addLog(`Cadastrou o documento ${docId} - ${nome.trim()}`, "sistema");
    return true;
  };

  const atualizarDocumento = (id: string, nome: string, categoria: string, setor: string, status: DocumentoCorporativo["status"]): boolean => {
    setErrorMsg(null);
    const docOriginal = documentos.find((d) => d.id === id);
    if (!docOriginal) return false;

    // Bloquear alteração se documento estiver Aprovado (Recomendado bloquear após aprovação)
    if (docOriginal.status === "Aprovado" && status !== "Aprovado") {
      setErrorMsg("Aviso: Documentos com status 'Aprovado' estão bloqueados para modificações operacionais.");
      return false;
    }

    // Validar duplicidade de nome caso mude
    if (docOriginal.nome.trim().toLowerCase() !== nome.trim().toLowerCase()) {
      const existeDuplicado = documentos.some((d) => d.id !== id && d.nome.trim().toLowerCase() === nome.trim().toLowerCase());
      if (existeDuplicado) {
        setErrorMsg("Erro: Já existe outro documento cadastrado com este nome na base de dados.");
        return false;
      }
    }

    const timestamp = new Date().toISOString();
    const logMsg = `Detalhes atualizados em ${new Date(timestamp).toLocaleString("pt-BR")} por ${user.name}. Nome: "${nome}", Categoria: "${categoria}", Setor: "${setor}", Status: "${status}".`;

    const docsAtualizados = documentos.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          nome: nome.trim(),
          categoria,
          setor,
          status,
          historicoAlteracoes: [...d.historicoAlteracoes, logMsg], // Histórico imutável
        };
      }
      return d;
    });

    // Atualizar também o nome nos registros de versões associados
    const versoesAtualizadas = versoes.map((v) => {
      if (v.documentoId === id) {
        return { ...v, documentoNome: nome.trim() };
      }
      return v;
    });

    persistData(docsAtualizados, versoesAtualizadas);
    addLog(`Atualizou o documento ${id}`, "sistema");
    return true;
  };

  const enviarNovaVersao = (docId: string, descricao: string): boolean => {
    setErrorMsg(null);
    const doc = documentos.find((d) => d.id === docId);
    if (!doc) return false;

    // Se estiver aprovado, pode requerer nova revisão, mas vamos apenas criar a versão normalmente
    const proximaVersaoNumero = parseFloat(doc.versao) + 1.0;
    const proximaVersaoStr = proximaVersaoNumero.toFixed(1);
    const timestamp = new Date().toISOString();
    const verId = `VER-${Date.now()}`;

    // Desativar versões anteriores deste documento (Indicador de Versão Ativa bloqueia/desativa anteriores)
    const versoesDesativadas = versoes.map((v) => {
      if (v.documentoId === docId) {
        return { ...v, statusVersao: "Substituída" as const, ativa: false };
      }
      return v;
    });

    const novaVersao: VersaoDocumento = {
      id: verId, // Gerado automaticamente
      documentoId: docId, // Imutável
      documentoNome: doc.nome,
      numeroVersao: Math.floor(proximaVersaoNumero), // Atualizado automaticamente
      descricaoAlteracao: descricao.trim(), // Editável, valida formato
      usuarioResponsavel: user.name, // Vinculado
      emailResponsavel: user.email,
      dataAlteracao: timestamp, // Registrar timestamp
      statusVersao: "Ativa", // Atualizado automaticamente
      historicoVersionamento: `Substituiu a versão anterior ${doc.versao}. Descrição: ${descricao}`,
      ativa: true, // Versão ativa
    };

    const docsAtualizados = documentos.map((d) => {
      if (d.id === docId) {
        return {
          ...d,
          versao: proximaVersaoStr, // Atualizado automaticamente
          status: "Em Revisão" as const, // Forçar para revisão após nova versão
          historicoAlteracoes: [
            ...d.historicoAlteracoes,
            `Nova versão ${proximaVersaoStr} enviada em ${new Date(timestamp).toLocaleString("pt-BR")} por ${user.name}. Motivo: ${descricao}`,
          ],
        };
      }
      return d;
    });

    persistData(docsAtualizados, [novaVersao, ...versoesDesativadas]);
    addLog(`Enviou nova versão do documento ${docId}`, "sistema");
    return true;
  };

  const restaurarVersaoAnterior = (docId: string, versaoId: string): boolean => {
    setErrorMsg(null);
    
    // Validar permissões específicas antes de restaurar versão (apenas admins)
    if (user.role !== "admin") {
      setErrorMsg("Acesso Negado: Apenas administradores do sistema possuem privilégios para restaurar versões anteriores de documentos.");
      return false;
    }

    const doc = documentos.find((d) => d.id === docId);
    const versaoAlvo = versoes.find((v) => v.id === versaoId);
    if (!doc || !versaoAlvo) return false;

    const proximaVersaoNumero = parseFloat(doc.versao) + 1.0;
    const proximaVersaoStr = proximaVersaoNumero.toFixed(1);
    const timestamp = new Date().toISOString();
    const verId = `VER-${Date.now()}`;

    // Desativar versão ativa atual
    const versoesDesativadas = versoes.map((v) => {
      if (v.documentoId === docId) {
        return { ...v, statusVersao: "Substituída" as const, ativa: false };
      }
      return v;
    });

    const novaVersao: VersaoDocumento = {
      id: verId, // Gerado automaticamente
      documentoId: docId, // Imutável
      documentoNome: doc.nome,
      numeroVersao: Math.floor(proximaVersaoNumero), // Atualizado automaticamente
      descricaoAlteracao: `Restauração da versão número ${versaoAlvo.numeroVersao}.0 (${versaoAlvo.descricaoAlteracao}).`,
      usuarioResponsavel: user.name, // Vinculado
      emailResponsavel: user.email,
      dataAlteracao: timestamp, // Registrar timestamp
      statusVersao: "Restaurada", // Atualizado automaticamente
      historicoVersionamento: `Documento restaurado para o estado da versão ${versaoAlvo.numeroVersao}.0 em ${new Date(timestamp).toLocaleString("pt-BR")}.`,
      ativa: true,
    };

    const docsAtualizados = documentos.map((d) => {
      if (d.id === docId) {
        return {
          ...d,
          versao: proximaVersaoStr, // Atualizado automaticamente
          status: "Em Rascunho" as const, // Retorna para rascunho para edição posterior
          historicoAlteracoes: [
            ...d.historicoAlteracoes,
            `Documento restaurado para o estado da versão ${versaoAlvo.numeroVersao}.0 em ${new Date(timestamp).toLocaleString("pt-BR")} por ${user.name}.`,
          ],
        };
      }
      return d;
    });

    persistData(docsAtualizados, [novaVersao, ...versoesDesativadas]);
    addLog(`Restaurou versão anterior do documento ${docId}`, "sistema");
    return true;
  };

  return {
    documentos,
    versoes,
    errorMsg,
    setErrorMsg,
    cadastrarDocumento,
    atualizarDocumento,
    enviarNovaVersao,
    restaurarVersaoAnterior,
  };
}
