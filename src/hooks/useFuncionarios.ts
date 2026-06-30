"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/contexts/logs-context";
import { useAuth } from "@/contexts/auth-context";

export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  cpf: string;
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
    cpf: "111.111.111-11",
    status: "ativo",
    dataAdmissao: "2024-03-10",
    criadoEm: "2024-03-10T09:00:00.000Z",
    criadoPor: "Administrador Geral",
  },
  {
    id: "FUNC-002",
    nome: "Maria Santos",
    email: "maria.santos@erppro.com",
    cargo: "Analista",
    departamento: "Administrativo",
    cpf: "222.222.222-22",
    status: "ativo",
    dataAdmissao: "2025-01-15",
    criadoEm: "2025-01-15T10:30:00.000Z",
    criadoPor: "Administrador Geral",
  },
  {
    id: "FUNC-003",
    nome: "Pedro Oliveira",
    email: "pedro.oliveira@erppro.com",
    cargo: "Suporte",
    departamento: "Tecnologia",
    cpf: "333.333.333-33",
    status: "inativo",
    dataAdmissao: "2025-08-01",
    criadoEm: "2025-08-01T14:00:00.000Z",
    criadoPor: "Administrador Geral",
    atualizadoEm: "2025-12-05T16:00:00.000Z",
    atualizadoPor: "Administrador Geral",
  },
];

export function useFuncionarios() {
  const { addLog } = useLogs();
  const { user } = useAuth();

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(mockFuncionariosIniciais);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("erp_funcionarios");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setFuncionarios(parsed);
          setIsLoaded(true);
        }, 0);
        return;
      } catch (e) {
        console.error("Erro ao carregar funcionários:", e);
      }
    }
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_funcionarios", JSON.stringify(funcionarios));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
    }
  }, [funcionarios, isLoaded]);

  // Sync state across storage events (tabs / simulation)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_funcionarios");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFuncionarios((current) => {
            if (JSON.stringify(current) === saved) {
              return current;
            }
            return parsed;
          });
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const [busca, setBusca] = useState("");
  const [error, setError] = useState<string | null>(null);

  const checkDuplicateEmail = (email: string, excludeId?: string) => {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail) return false;
    return funcionarios.some(
      (f) => f.id !== excludeId && f.email.trim().toLowerCase() === cleanedEmail
    );
  };

  const checkDuplicateCpf = (cpf: string, excludeId?: string) => {
    const cleanedCpf = cpf.replace(/\D/g, "");
    if (!cleanedCpf) return false;
    return funcionarios.some(
      (f) => f.id !== excludeId && f.cpf.replace(/\D/g, "") === cleanedCpf
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

    if (checkDuplicateCpf(novoFunc.cpf)) {
      setError(`O CPF "${novoFunc.cpf}" já está cadastrado para outro funcionário.`);
      return false;
    }

    const idGerado = `FUNC-00${funcionarios.length + 1}-${Math.floor(Math.random() * 100)}`;
    const dataAtual = new Date().toISOString();
    const funcionarioCompleto: Funcionario = {
      ...novoFunc,
      email: novoFunc.email.trim().toLowerCase(),
      id: idGerado,
      criadoEm: dataAtual,
      criadoPor: user.name,
    };

    setFuncionarios((prev) => [funcionarioCompleto, ...prev]);
    addLog(`Cadastrou o colaborador ${novoFunc.nome} (${novoFunc.cargo} - ${novoFunc.departamento})`, "funcionarios");
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

    if (checkDuplicateCpf(dadosAlterados.cpf, id)) {
      setError(`O CPF "${dadosAlterados.cpf}" já está cadastrado para outro funcionário.`);
      return false;
    }

    const dataAtual = new Date().toISOString();
    const oldFunc = funcionarios.find((f) => f.id === id);

    setFuncionarios((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              ...dadosAlterados,
              email: dadosAlterados.email.trim().toLowerCase(),
              atualizadoEm: dataAtual,
              atualizadoPor: user.name,
            }
          : f
      )
    );

    if (oldFunc) {
      addLog(`Atualizou o cadastro do colaborador ${dadosAlterados.nome} (ID: ${id})`, "funcionarios");
    }
    return true;
  };

  const removerFuncionario = (id: string) => {
    const oldFunc = funcionarios.find((f) => f.id === id);
    setFuncionarios((prev) => prev.filter((f) => f.id !== id));
    if (oldFunc) {
      addLog(`Excluiu o cadastro do colaborador ${oldFunc.nome} (ID: ${id})`, "funcionarios");
    }
  };

  const funcionariosFiltrados = funcionarios.filter(
    (f) =>
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.email.toLowerCase().includes(busca.toLowerCase()) ||
      f.cpf.includes(busca) ||
      f.departamento.toLowerCase().includes(busca.toLowerCase()) ||
      f.cargo.toLowerCase().includes(busca.toLowerCase())
  );

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
