"use client";

import { useState, useEffect, useCallback } from "react";
import { useLogs } from "@/contexts/logs-context";
import { useAuth } from "@/contexts/auth-context";

export interface NotaFiscalEntrada {
  id: string;
  chaveAcesso: string;
  emitente: string;
  documentoEmitente: string;
  valorTotal: number;
  dataEmissao: string;
  dataRecebimento: string;
  status: "recebida" | "importada";
  xmlContent: string;
  itens: { codigo: string; descricao: string; quantidade: number; valorUnitario: number }[];
}

const mockXMLGerdau = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260603351493000110550010000010291000001029" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00001029</cNF>
        <natOp>Venda de producao do estabelecimento</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>1029</nNF>
        <dhEmi>2026-06-25T10:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
      </ide>
      <emit>
        <CNPJ>03.351.493/0001-10</CNPJ>
        <xNome>Siderurgica Gerdau S.A.</xNome>
        <xFant>Gerdau</xFant>
        <enderEmit>
          <xLgr>Av. Das Nacoes</xLgr>
          <nro>1500</nro>
          <xBairro>Distrito Industrial</xBairro>
          <cMun>3550308</cMun>
          <xMun>Sao Paulo</xMun>
          <UF>SP</UF>
        </enderEmit>
      </emit>
      <dest>
        <CNPJ>12.345.678/0001-90</CNPJ>
        <xNome>ERP Pro S.A.</xNome>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>STEEL-PLATE-01</cProd>
          <xProd>Chapa de Aco Carbono 2x1m 5mm</xProd>
          <NCM>72085100</NCM>
          <CFOP>5101</CFOP>
          <uCom>UN</uCom>
          <qCom>50.0000</qCom>
          <vUnCom>690.0000</vUnCom>
          <vProd>34500.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vBC>34500.00</vBC>
          <vICMS>6210.00</vICMS>
          <vProd>34500.00</vProd>
          <vNF>34500.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

const mockXMLTech = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260614882901000144550010000005421000000542" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00000542</cNF>
        <natOp>Venda de mercadoria adquirida de terceiros</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>542</nNF>
        <dhEmi>2026-06-27T14:15:00-03:00</dhEmi>
        <tpNF>1</tpNF>
      </ide>
      <emit>
        <CNPJ>14.882.901/0001-44</CNPJ>
        <xNome>TechComponents Distribuidora Ltda</xNome>
        <xFant>TechComponents</xFant>
      </emit>
      <dest>
        <CNPJ>12.345.678/0001-90</CNPJ>
        <xNome>ERP Pro S.A.</xNome>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>MICRO-DEV-03</cProd>
          <xProd>Placa Integrada Microcontrolador ESP32-WROOM</xProd>
          <NCM>85423190</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>100.0000</qCom>
          <vUnCom>42.8000</vUnCom>
          <vProd>4280.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vBC>4280.00</vBC>
          <vICMS>770.40</vICMS>
          <vProd>4280.00</vProd>
          <vNF>4280.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

const mockXMLPessoa = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260612345678900000550010000000781000000078" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00000078</cNF>
        <natOp>Prestacao de Servicos de Consultoria</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>78</nNF>
        <dhEmi>2026-06-28T09:00:00-03:00</dhEmi>
        <tpNF>1</tpNF>
      </ide>
      <emit>
        <CPF>123.456.789-00</CPF>
        <xNome>Joao da Silva Ramos</xNome>
      </emit>
      <dest>
        <CNPJ>12.345.678/0001-90</CNPJ>
        <xNome>ERP Pro S.A.</xNome>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>CONS-IND-01</cProd>
          <xProd>Consultoria em Eficiencia Energetica de Producao</xProd>
          <NCM>00000000</NCM>
          <CFOP>5933</CFOP>
          <uCom>SV</uCom>
          <qCom>1.0000</qCom>
          <vUnCom>1500.0000</vUnCom>
          <vProd>1500.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vProd>1500.00</vProd>
          <vNF>1500.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

const notasIniciais: NotaFiscalEntrada[] = [
  {
    id: "NFE-1029",
    chaveAcesso: "35260603351493000110550010000010291000001029",
    emitente: "Siderurgica Gerdau S.A.",
    documentoEmitente: "03.351.493/0001-10",
    valorTotal: 34500.00,
    dataEmissao: "2026-06-25T10:30:00-03:00",
    dataRecebimento: "2026-06-25T15:20:00-03:00",
    status: "recebida",
    xmlContent: mockXMLGerdau,
    itens: [
      { codigo: "STEEL-PLATE-01", descricao: "Chapa de Aco Carbono 2x1m 5mm", quantidade: 50, valorUnitario: 690.00 }
    ]
  },
  {
    id: "NFE-0542",
    chaveAcesso: "35260614882901000144550010000005421000000542",
    emitente: "TechComponents Distribuidora Ltda",
    documentoEmitente: "14.882.901/0001-44",
    valorTotal: 4280.00,
    dataEmissao: "2026-06-27T14:15:00-03:00",
    dataRecebimento: "2026-06-27T18:00:00-03:00",
    status: "importada",
    xmlContent: mockXMLTech,
    itens: [
      { codigo: "MICRO-DEV-03", descricao: "Placa Integrada Microcontrolador ESP32-WROOM", quantidade: 100, valorUnitario: 42.80 }
    ]
  },
  {
    id: "NFE-0078",
    chaveAcesso: "35260612345678900000550010000000781000000078",
    emitente: "Joao da Silva Ramos",
    documentoEmitente: "123.456.789-00",
    valorTotal: 1500.00,
    dataEmissao: "2026-06-28T09:00:00-03:00",
    dataRecebimento: "2026-06-28T10:10:00-03:00",
    status: "recebida",
    xmlContent: mockXMLPessoa,
    itens: [
      { codigo: "CONS-IND-01", descricao: "Consultoria em Eficiencia Energetica de Producao", quantidade: 1, valorUnitario: 1500.00 }
    ]
  }
];

export function useFiscalEntrada() {
  const { addLog } = useLogs();
  const { user } = useAuth();
  const [notas, setNotas] = useState<NotaFiscalEntrada[]>(notasIniciais);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync state with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("erp_notas_entrada");
    if (saved) {
      try {
        setNotas(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar notas de entrada:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_notas_entrada", JSON.stringify(notas));
    }
  }, [notas, isLoaded]);

  // Dar entrada de nota fiscal no sistema
  const darEntradaNota = useCallback((id: string) => {
    let notaNome = "";
    let notaValor = 0;
    
    setNotas((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          notaNome = n.emitente;
          notaValor = n.valorTotal;
          return { ...n, status: "importada" };
        }
        return n;
      })
    );

    // Adiciona log de auditoria no sistema
    addLog(
      `Entrada efetuada para a NF-e ${id} emitida por ${notaNome}`,
      "financeiro",
      `Valor total de faturamento: R$ ${notaValor.toFixed(2)}. Importador: ${user.name || "Usuário"}`
    );

    // Simula movimentação de estoque
    const estoqueSaved = localStorage.getItem("erp_estoque");
    if (estoqueSaved) {
      try {
        const estoque = JSON.parse(estoqueSaved);
        // Tentar atualizar quantidades ou registrar log de estoque
        addLog(
          `Processamento de entrada física dos itens da nota ${id} no estoque`,
          "estoque",
          `Itens vinculados à nota da empresa ${notaNome}`
        );
      } catch (e) {
        console.error(e);
      }
    }
    
    return true;
  }, [addLog, user.name]);

  // Simular recebimento de nota por XML carregado/colado
  const receberNotaPorXML = useCallback((xmlText: string) => {
    try {
      // Basic parser simulado
      const docNameRegex = /<xNome>([^<]+)<\/xNome>/;
      const docNumRegex = /<CNPJ>([^<]+)<\/CNPJ>|<CPF>([^<]+)<\/CPF>/;
      const valorRegex = /<vNF>([^<]+)<\/vNF>|<vProd>([^<]+)<\/vProd>/;
      const nNFRegex = /<nNF>([^<]+)<\/nNF>/;
      const idRegex = /Id="([^"]+)"/;
      const prodRegex = /<xProd>([^<]+)<\/xProd>/g;
      
      const emitente = xmlText.match(docNameRegex)?.[1] || "Emissor Desconhecido";
      const doc = xmlText.match(docNumRegex)?.[1] || xmlText.match(docNumRegex)?.[2] || "00.000.000/0001-00";
      const valor = parseFloat(xmlText.match(valorRegex)?.[1] || xmlText.match(valorRegex)?.[2] || "0");
      const numero = xmlText.match(nNFRegex)?.[1] || String(Math.floor(1000 + Math.random() * 9000));
      const chave = xmlText.match(idRegex)?.[1]?.replace("NFe", "") || "352606" + String(Math.floor(Math.random() * 10000000000000000000000000000000000000));

      const newId = `NFE-${numero.padStart(4, "0")}`;

      // Check if already exists
      if (notas.some((n) => n.id === newId)) {
        return { success: false, message: "Esta Nota Fiscal já está registrada no sistema." };
      }

      const novaNota: NotaFiscalEntrada = {
        id: newId,
        chaveAcesso: chave,
        emitente,
        documentoEmitente: doc,
        valorTotal: valor,
        dataEmissao: new Date().toISOString(),
        dataRecebimento: new Date().toISOString(),
        status: "recebida",
        xmlContent: xmlText,
        itens: [
          { codigo: "PROD-GEN", descricao: xmlText.match(prodRegex)?.[0]?.replace(/<\/?xProd>/g, "") || "Itens Gerais Importados", quantidade: 1, valorUnitario: valor }
        ]
      };

      setNotas((prev) => [novaNota, ...prev]);

      addLog(
        `XML de nota fiscal ${newId} recebido com sucesso de ${emitente}`,
        "financeiro",
        `Chave fiscal: ${chave}. Aguardando dar entrada no sistema.`
      );

      return { success: true, nota: novaNota };
    } catch (e) {
      return { success: false, message: "Erro ao processar estrutura do XML. Certifique-se de que é um XML de NF-e válido." };
    }
  }, [notas, addLog]);

  return {
    notas,
    darEntradaNota,
    receberNotaPorXML
  };
}
