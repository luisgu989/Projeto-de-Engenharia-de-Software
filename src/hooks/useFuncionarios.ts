"use client";

import { useState } from "react";

export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  status: "ativo" | "inativo";
  dataAdmissao: string;
  // Audit details
  criadoEm: string;
  criadoPor: string;
  atualizadoEm?: string;
  atualizadoPor?: string;
}

const mockFuncionariosIniciais: Funcionario[] = [
  {
    id: "FUNC-001",
    nome: "João da Silva",
    email: "joao.silva@erppro.com",
    cargo: "Gerente",
    departamento: "Vendas",
    status: "ativo",
    dataAdmissao: "2024-03-10",
    criadoEm: "2024-03-10T09:00:00.000Z",
    criadoPor: "Admin User",
  },
  {
    id: "FUNC-002",
    nome: "Maria Santos",
    email: "maria.santos@erppro.com",
    cargo: "Analista",
    departamento: "Administrativo",
    status: "ativo",
    dataAdmissao: "2025-01-15",
    criadoEm: "2025-01-15T10:30:00.000Z",
    criadoPor: "Admin User",
  },
  {
    id: "FUNC-003",
    nome: "Pedro Oliveira",
    email: "pedro.oliveira@erppro.com",
    cargo: "Suporte",
    departamento: "Tecnologia",
    status: "inativo",
    dataAdmissao: "2025-08-01",
    criadoEm: "2025-08-01T14:00:00.000Z",
    criadoPor: "Admin User",
    atualizadoEm: "2025-12-05T16:00:00.000Z",
    atualizadoPor: "Admin User",
  },
];

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(mockFuncionariosIniciais);
  const [busca, setBusca] = useState("");
  const [error, setError] = useState<string | null>(null);

  const checkDuplicateEmail = (email: string, excludeId?: string) => {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail) return false;
    return funcionarios.some(
      (f) => f.id !== excludeId && f.email.trim().toLowerCase() === cleanedEmail
    );
  };

  const adicionarFuncionario = (
    novoFunc: Omit<Funcionario, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">
  ) => {
    setError(null);
    if (checkDuplicateEmail(novoFunc.email)) {
      setError(`O e-mail "${novoFunc.email.trim().toLowerCase()}" já está cadastrado para outro funcionário.`);
      return false;
    }

    const idGerado = `FUNC-00${funcionarios.length + 1}`;
    const dataAtual = new Date().toISOString();
    const funcionarioCompleto: Funcionario = {
      ...novoFunc,
      email: novoFunc.email.trim().toLowerCase(),
      id: idGerado,
      criadoEm: dataAtual,
      criadoPor: "Admin User", // Em sistema real seria do contexto auth
    };

    setFuncionarios((prev) => [funcionarioCompleto, ...prev]);
    return true;
  };

  const atualizarFuncionario = (
    id: string,
    dadosAlterados: Omit<Funcionario, "id" | "criadoEm" | "criadoPor" | "atualizadoEm" | "atualizadoPor">
  ) => {
    setError(null);
    if (checkDuplicateEmail(dadosAlterados.email, id)) {
      setError(`O e-mail "${dadosAlterados.email.trim().toLowerCase()}" já está cadastrado para outro funcionário.`);
      return false;
    }

    const dataAtual = new Date().toISOString();
    setFuncionarios((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              ...dadosAlterados,
              email: dadosAlterados.email.trim().toLowerCase(),
              atualizadoEm: dataAtual,
              atualizadoPor: "Admin User",
            }
          : f
      )
    );
    return true;
  };

  const removerFuncionario = (id: string) => {
    setFuncionarios((prev) => prev.filter((f) => f.id !== id));
  };

  const funcionariosFiltrados = funcionarios.filter(
    (f) =>
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.email.toLowerCase().includes(busca.toLowerCase()) ||
      f.departamento.toLowerCase().includes(busca.toLowerCase()) ||
      f.cargo.toLowerCase().includes(busca.toLowerCase())
  );

  // Computations
  const totalFuncionarios = funcionarios.length;
  const ativos = funcionarios.filter((f) => f.status === "ativo").length;
  const inativos = funcionarios.filter((f) => f.status === "inativo").length;

  return {
    funcionarios: funcionariosFiltrados,
    busca,
    setBusca,
    error,
    setError,
    adicionarFuncionario,
    atualizarFuncionario,
    removerFuncionario,
    totalFuncionarios,
    ativos,
    inativos,
  };
}
