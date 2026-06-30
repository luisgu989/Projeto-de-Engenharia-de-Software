"use client";

import { useState } from "react";
import { useLogs } from "@/contexts/logs-context";

export interface Cliente {
  id: string;
  nome: string;
  tipo: "PF" | "PJ";
  documento: string; // CPF or CNPJ (locked fields, must be unique)
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  status: "ativo" | "inativo";
  // Audit details
  criadoEm: string;
  criadoPor: string;
  atualizadoEm?: string;
  atualizadoPor?: string;
}

const mockClientesIniciais: Cliente[] = [
  {
    id: "CLI-001",
    nome: "Metalúrgica Alfa Ltda",
    tipo: "PJ",
    documento: "12.345.678/0001-90",
    email: "comercial@metalurgicaalfa.com.br",
    telefone: "(11) 4567-8901",
    cidade: "São Paulo",
    estado: "SP",
    status: "ativo",
    criadoEm: "2026-05-15T09:00:00.000Z",
    criadoPor: "Renata Souza",
  },
  {
    id: "CLI-002",
    nome: "Arthur Henrique de Oliveira",
    tipo: "PF",
    documento: "123.456.789-00",
    email: "arthur.henrique@gmail.com",
    telefone: "(21) 98765-4321",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    status: "ativo",
    criadoEm: "2026-05-18T14:30:00.000Z",
    criadoPor: "Luís Fernando",
  },
  {
    id: "CLI-003",
    nome: "Clínica Médica Viver Bem",
    tipo: "PJ",
    documento: "98.765.432/0001-10",
    email: "contato@viverbem.med.br",
    telefone: "(31) 3224-5566",
    cidade: "Belo Horizonte",
    estado: "MG",
    status: "inativo",
    criadoEm: "2026-05-20T10:15:00.000Z",
    criadoPor: "Admin User",
    atualizadoEm: "2026-05-22T16:00:00.000Z",
    atualizadoPor: "Renata Souza",
  },
];

export function useClientes() {
  const { addLog } = useLogs();
  const [clientes, setClientes] = useState<Cliente[]>(mockClientesIniciais);
  const [busca, setBusca] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Helper to format or sanitize document for duplicate comparison (keeps only numbers)
  const sanitizeDocument = (doc: string) => doc.replace(/\D/g, "");

  // Validate duplicate document
  const checkDuplicateDocument = (documento: string, excludeId?: string) => {
    const sanitizedInput = sanitizeDocument(documento);
    if (!sanitizedInput) return false;

    return clientes.some(
      (c) =>
        c.id !== excludeId && sanitizeDocument(c.documento) === sanitizedInput
    );
  };

  const adicionarCliente = (novoCliente: Omit<Cliente, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">) => {
    setError(null);

    // Duplicate check
    if (checkDuplicateDocument(novoCliente.documento)) {
      setError(`O documento (CPF/CNPJ) "${novoCliente.documento}" já está cadastrado para outro cliente.`);
      return false;
    }

    const idGerado = `CLI-00${clientes.length + 1}`;
    const dataAtual = new Date().toISOString();
    const clienteCompleto: Cliente = {
      ...novoCliente,
      id: idGerado,
      criadoEm: dataAtual,
      criadoPor: "Admin User", // Em um sistema real, seria obtido do contexto de auth
    };

    setClientes((prev) => [clienteCompleto, ...prev]);
    addLog(`Cadastrou o cliente ${idGerado} - ${clienteCompleto.nome}`, "crm");
    return true;
  };

  const atualizarCliente = (
    id: string,
    dadosAlterados: Omit<Cliente, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">
  ) => {
    setError(null);

    // Duplicate check (excluding current editing client)
    if (checkDuplicateDocument(dadosAlterados.documento, id)) {
      setError(`O documento (CPF/CNPJ) "${dadosAlterados.documento}" já está cadastrado para outro cliente.`);
      return false;
    }

    const dataAtual = new Date().toISOString();

    setClientes((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...dadosAlterados,
              atualizadoEm: dataAtual,
              atualizadoPor: "Admin User",
            }
          : c
      )
    );
    addLog(`Atualizou o cliente ${id}`, "crm");
    return true;
  };

  const removerCliente = (id: string) => {
    setClientes((prev) => prev.filter((c) => {
      if (c.id === id) addLog(`Removeu o cliente ${id}`, "crm");
      return c.id !== id;
    }));
  };

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.documento.includes(busca) ||
      c.email.toLowerCase().includes(busca.toLowerCase()) ||
      c.cidade.toLowerCase().includes(busca.toLowerCase())
  );

  // Metrics calcs
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter((c) => c.status === "ativo").length;
  const clientesInativos = clientes.filter((c) => c.status === "inativo").length;
  const totalPF = clientes.filter((c) => c.tipo === "PF").length;
  const totalPJ = clientes.filter((c) => c.tipo === "PJ").length;

  return {
    clientes: clientesFiltrados,
    busca,
    setBusca,
    error,
    setError,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    totalClientes,
    clientesAtivos,
    clientesInativos,
    totalPF,
    totalPJ,
  };
}
