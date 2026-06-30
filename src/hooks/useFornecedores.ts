"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface Fornecedor {
  id: string;
  razaoSocial: string;
  cnpj: string;
  contato: string;
  status: "ativo" | "inativo";
  dataCadastro: string;
  usuarioResponsavel: string;
}

const fornecedoresIniciais: Fornecedor[] = [
  {
    id: "FORN-001",
    razaoSocial: "TechDistrib LTDA",
    cnpj: "11.222.333/0001-01",
    contato: "vendas@techdistrib.com",
    status: "ativo",
    dataCadastro: "2026-05-15T09:00:00.000Z",
    usuarioResponsavel: "Administrador Geral"
  },
  {
    id: "FORN-002",
    razaoSocial: "Inova Componentes Ltda",
    cnpj: "22.333.444/0001-02",
    contato: "atendimento@inova.com.br",
    status: "ativo",
    dataCadastro: "2026-05-18T10:30:00.000Z",
    usuarioResponsavel: "Administrador Geral"
  },
  {
    id: "FORN-003",
    razaoSocial: "Sul Eletro Distribuidora",
    cnpj: "33.444.555/0001-03",
    contato: "comercial@suleletro.com.br",
    status: "ativo",
    dataCadastro: "2026-05-20T11:00:00.000Z",
    usuarioResponsavel: "Administrador Geral"
  },
  {
    id: "FORN-004",
    razaoSocial: "Macro Atacado Varejista",
    cnpj: "44.555.666/0001-04",
    contato: "contato@macroatacado.com",
    status: "ativo",
    dataCadastro: "2026-05-22T14:15:00.000Z",
    usuarioResponsavel: "Administrador Geral"
  },
  {
    id: "FORN-005",
    razaoSocial: "Global Tech Imp. Exp.",
    cnpj: "55.666.777/0001-05",
    contato: "suporte@globaltech.com",
    status: "ativo",
    dataCadastro: "2026-05-25T16:40:00.000Z",
    usuarioResponsavel: "Administrador Geral"
  }
];

export function useFornecedores() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(fornecedoresIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_fornecedores");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setFornecedores(parsed);
          setIsLoaded(true);
        }, 0);
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_fornecedores", JSON.stringify(fornecedores));
    }
  }, [fornecedores, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_fornecedores");
      if (saved) {
        try {
          setFornecedores(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const limparErro = () => setErrorMessage(null);

  const checkDuplicateCnpj = (cnpj: string, excludeId?: string) => {
    const sanitized = cnpj.replace(/\D/g, "");
    return fornecedores.some(
      (f) => f.id !== excludeId && f.cnpj.replace(/\D/g, "") === sanitized
    );
  };

  const adicionarFornecedor = (novo: Omit<Fornecedor, "id" | "dataCadastro" | "usuarioResponsavel">) => {
    setErrorMessage(null);

    if (!novo.razaoSocial.trim()) {
      setErrorMessage("A Razão Social é obrigatória.");
      return false;
    }

    if (!novo.cnpj.trim()) {
      setErrorMessage("O CNPJ é obrigatório.");
      return false;
    }

    if (checkDuplicateCnpj(novo.cnpj)) {
      setErrorMessage("Este CNPJ já está cadastrado.");
      return false;
    }

    if (!novo.contato.trim()) {
      setErrorMessage("O contato comercial é obrigatório.");
      return false;
    }

    const idGerado = `FORN-${String(fornecedores.length + 1).padStart(3, "0")}`;
    const novoFornecedor: Fornecedor = {
      ...novo,
      id: idGerado,
      dataCadastro: new Date().toISOString(),
      usuarioResponsavel: user.name || "Responsável Logística"
    };

    setFornecedores((prev) => [novoFornecedor, ...prev]);
    addLog(`Cadastrou fornecedor: ${novo.razaoSocial} (CNPJ: ${novo.cnpj})`, "estoque");
    return true;
  };

  const atualizarFornecedor = (id: string, dados: Omit<Fornecedor, "id" | "dataCadastro" | "usuarioResponsavel">) => {
    setErrorMessage(null);

    if (!dados.razaoSocial.trim()) {
      setErrorMessage("A Razão Social é obrigatória.");
      return false;
    }

    if (!dados.cnpj.trim()) {
      setErrorMessage("O CNPJ é obrigatório.");
      return false;
    }

    if (checkDuplicateCnpj(dados.cnpj, id)) {
      setErrorMessage("Este CNPJ já está cadastrado para outro fornecedor.");
      return false;
    }

    if (!dados.contato.trim()) {
      setErrorMessage("O contato comercial é obrigatório.");
      return false;
    }

    setFornecedores((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...dados } : f))
    );
    addLog(`Atualizou cadastro do fornecedor: ${dados.razaoSocial} (ID: ${id})`, "estoque");
    return true;
  };

  const atualizarFornecedorStatus = (id: string, novoStatus: Fornecedor["status"]) => {
    setFornecedores((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          addLog(`Alterou status do fornecedor ${f.razaoSocial} para ${novoStatus}`, "estoque");
          return { ...f, status: novoStatus };
        }
        return f;
      })
    );
  };

  const removerFornecedor = (id: string) => {
    const fornecedor = fornecedores.find((f) => f.id === id);
    setFornecedores((prev) => prev.filter((f) => f.id !== id));
    if (fornecedor) {
      addLog(`Removeu fornecedor: ${fornecedor.razaoSocial}`, "estoque");
    }
  };

  return {
    fornecedores,
    errorMessage,
    limparErro,
    adicionarFornecedor,
    atualizarFornecedor,
    atualizarFornecedorStatus,
    removerFornecedor
  };
}
