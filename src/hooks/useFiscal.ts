"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface DocumentoFiscal {
  id: string;
  tipoDocumento: "NF-e" | "NFS-e" | "NFC-e";
  emitente: string;
  destinatarioId: string;
  destinatarioNome: string;
  destinatarioDocumento: string;
  valorTotal: number;
  statusEmissao: "processando" | "emitida" | "cancelada";
  dataEmissao: string;
  chaveFiscal: string;
  motivoCancelamento?: string;
  dataCancelamento?: string;
  usuarioResponsavel?: string;
}

const documentosFiscaisIniciais: DocumentoFiscal[] = [
  {
    id: "NF-2026-001",
    tipoDocumento: "NF-e",
    emitente: "ERP Pro S.A.",
    destinatarioId: "CLI-001",
    destinatarioNome: "Metalúrgica Alfa Ltda",
    destinatarioDocumento: "12.345.678/0001-90",
    valorTotal: 15430.50,
    statusEmissao: "emitida",
    dataEmissao: "2026-06-10T14:32:00.000Z",
    chaveFiscal: "35260612345678901234550010000000011000000018"
  },
  {
    id: "NF-2026-002",
    tipoDocumento: "NFS-e",
    emitente: "ERP Pro S.A.",
    destinatarioId: "CLI-002",
    destinatarioNome: "Arthur Henrique de Oliveira",
    destinatarioDocumento: "123.456.789-00",
    valorTotal: 1200.00,
    statusEmissao: "emitida",
    dataEmissao: "2026-06-12T09:15:00.000Z",
    chaveFiscal: "35260612345678901234560010000000021000000029"
  }
];

export function useFiscal() {
  const { user } = useAuth();
  const [documentos, setDocumentos] = useState<DocumentoFiscal[]>(documentosFiscaisIniciais);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("erp_documentos_fiscais");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setDocumentos(parsed);
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
      localStorage.setItem("erp_documentos_fiscais", JSON.stringify(documentos));
    }
  }, [documentos, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_documentos_fiscais");
      if (saved) {
        try {
          setDocumentos(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const limparErro = () => setErrorMessage(null);

  const gerarChaveFiscal = (sequencial: number): string => {
    const uf = "35";
    const data = "2606";
    const cnpjEmitente = "12345678901234";
    const modelo = "55";
    const serie = "001";
    const numero = String(sequencial).padStart(9, "0");
    const tipoEmissao = "1";
    const codigoNumerico = String(Math.floor(10000000 + Math.random() * 90000000));
    const chaveSemDigito = `${uf}${data}${cnpjEmitente}${modelo}${serie}${numero}${tipoEmissao}${codigoNumerico}`;
    let soma = 0;
    let peso = 2;
    for (let i = chaveSemDigito.length - 1; i >= 0; i--) {
      soma += parseInt(chaveSemDigito[i]) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    const resto = soma % 11;
    const digito = resto === 0 || resto === 1 ? 0 : 11 - resto;
    return `${chaveSemDigito}${digito}`;
  };

  const emitirDocumentoFiscal = (
    dados: Omit<DocumentoFiscal, "id" | "emitente" | "statusEmissao" | "dataEmissao" | "chaveFiscal">
  ) => {
    setErrorMessage(null);

    if (dados.valorTotal <= 0) {
      setErrorMessage("O valor total do documento deve ser maior que zero.");
      return false;
    }

    if (!dados.destinatarioId) {
      setErrorMessage("Selecione um destinatário para o documento.");
      return false;
    }

    const sequencial = documentos.length + 1;
    const idGerado = `NF-2026-${String(sequencial).padStart(3, "0")}`;
    const novoDocumento: DocumentoFiscal = {
      ...dados,
      id: idGerado,
      emitente: "ERP Pro S.A.",
      statusEmissao: "processando",
      dataEmissao: new Date().toISOString(),
      chaveFiscal: ""
    };

    setDocumentos((prev) => [novoDocumento, ...prev]);

    setTimeout(() => {
      setDocumentos((prev) =>
        prev.map((doc) =>
          doc.id === idGerado
            ? {
                ...doc,
                statusEmissao: "emitida",
                chaveFiscal: gerarChaveFiscal(sequencial)
              }
            : doc
        )
      );
    }, 1500);

    return true;
  };

  const cancelarDocumentoFiscal = (id: string, motivo: string) => {
    setErrorMessage(null);

    if (!motivo || motivo.trim().length < 15) {
      setErrorMessage("O motivo do cancelamento deve conter pelo menos 15 caracteres.");
      return false;
    }

    setDocumentos((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              statusEmissao: "cancelada",
              motivoCancelamento: motivo.trim(),
              dataCancelamento: new Date().toISOString(),
              usuarioResponsavel: user.name || "Contador Responsável"
            }
          : doc
      )
    );
    return true;
  };

  return {
    documentos,
    errorMessage,
    limparErro,
    emitirDocumentoFiscal,
    cancelarDocumentoFiscal
  };
}
