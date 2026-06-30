"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface AssinaturaContrato {
  usuario: string;
  data: string;
  certificado: string;
  hash: string;
}

export interface Contrato {
  id: string;
  tipoContrato: "comercial" | "operacional" | "financeiro";
  empresaVinculada: string;
  dataVencimento: string;
  status: "pendente" | "assinado" | "expirado" | "cancelado";
  documentoNome: string;
  dataCadastro: string;
  usuarioResponsavel: string;
  assinatura: AssinaturaContrato | null;
}

const contratosIniciais: Contrato[] = [
  {
    id: "CON-001",
    tipoContrato: "comercial",
    empresaVinculada: "TechDistrib LTDA",
    dataVencimento: "2026-12-31T23:59:59.000Z",
    status: "assinado",
    documentoNome: "contrato_fornecimento_v1.pdf",
    dataCadastro: "2026-06-01T08:00:00.000Z",
    usuarioResponsavel: "Administrador Geral",
    assinatura: {
      usuario: "Administrador Geral",
      data: "2026-06-01T10:15:30.000Z",
      certificado: "e-CPF: Administrador Geral (CNPJ 12.345.678/0001-90)",
      hash: "SHA256:7d8a9b1c2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b"
    }
  },
  {
    id: "CON-002",
    tipoContrato: "financeiro",
    empresaVinculada: "Banco do Brasil S.A.",
    dataVencimento: "2026-06-25T23:59:59.000Z",
    status: "pendente",
    documentoNome: "prestacao_servicos_credito.pdf",
    dataCadastro: "2026-06-12T10:00:00.000Z",
    usuarioResponsavel: "Administrador Geral",
    assinatura: null
  }
];

export function useContratos() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [contratos, setContratos] = useState<Contrato[]>(contratosIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_contratos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setContratos(parsed);
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
      localStorage.setItem("erp_contratos", JSON.stringify(contratos));
    }
  }, [contratos, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_contratos");
      if (saved) {
        try {
          setContratos(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const limparErro = () => setErrorMessage(null);

  const adicionarContrato = (novo: Omit<Contrato, "id" | "status" | "dataCadastro" | "usuarioResponsavel" | "assinatura">) => {
    setErrorMessage(null);

    if (!novo.empresaVinculada.trim()) {
      setErrorMessage("A Empresa Vinculada é obrigatória.");
      return false;
    }

    if (!novo.dataVencimento) {
      setErrorMessage("A data de vencimento é obrigatória.");
      return false;
    }

    const dataVenc = new Date(novo.dataVencimento);
    if (dataVenc.getTime() <= Date.now()) {
      setErrorMessage("A data de vencimento deve ser futura.");
      return false;
    }

    const idGerado = `CON-${String(contratos.length + 1).padStart(3, "0")}`;
    const novoContrato: Contrato = {
      ...novo,
      id: idGerado,
      status: "pendente",
      dataCadastro: new Date().toISOString(),
      usuarioResponsavel: user.name || "Responsável TI",
      assinatura: null
    };

    setContratos((prev) => [novoContrato, ...prev]);
    addLog(`Cadastrou o contrato ${idGerado} para ${novo.empresaVinculada}`, "relatorios");
    return true;
  };

  const assinarContrato = (id: string, senhaCertificado: string) => {
    setErrorMessage(null);

    if (!senhaCertificado) {
      setErrorMessage("A senha do certificado digital é obrigatória.");
      return false;
    }

    if (senhaCertificado !== "123456") {
      setErrorMessage("Senha do certificado digital inválida. Use a senha de testes '123456'.");
      return false;
    }

    setContratos((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: "assinado" as const,
            assinatura: {
              usuario: user.name || "Gerente Autenticado",
              data: new Date().toISOString(),
              certificado: `e-CPF: ${user.name || "Gerente"} (Simulado CPF)`,
              hash: `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
            }
          };
        }
        return c;
      })
    );

    addLog(`Assinou digitalmente o contrato ${id}`, "relatorios");
    return true;
  };

  const cancelarContrato = (id: string) => {
    setContratos((prev) =>
      prev.map((c) => {
        if (c.id === id && c.status !== "cancelado") {
          addLog(`Cancelou o contrato ${id}`, "relatorios");
          return { ...c, status: "cancelado" as const };
        }
        return c;
      })
    );
  };

  return {
    contratos,
    errorMessage,
    limparErro,
    adicionarContrato,
    assinarContrato,
    cancelarContrato
  };
}
