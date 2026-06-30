"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { useLogs } from "@/contexts/logs-context";

export interface OcorrenciaAcesso {
  id: string;
  usuarioIdentificado: string;
  enderecoAcesso: string;
  tipoOcorrencia: "Falha de Autenticação" | "Tentativa de Força Bruta" | "Acesso Fora de Horário";
  codigoSeguranca: string;
  quantidadeTentativas: number;
  statusBloqueio: "Liberado" | "Bloqueado Temporário" | "Bloqueado Permanente";
  dataTentativa: string;
}

const mockOcorrenciasIniciais: OcorrenciaAcesso[] = [
  {
    id: "INC-881029",
    usuarioIdentificado: "intruso.anonimo@hacker.io",
    enderecoAcesso: "198.51.100.42",
    tipoOcorrencia: "Tentativa de Força Bruta",
    codigoSeguranca: "SEC-BRUTE-992A",
    quantidadeTentativas: 5,
    statusBloqueio: "Bloqueado Permanente",
    dataTentativa: new Date(Date.now() - 3600000 * 2).toISOString(), // 2h atrás
  },
  {
    id: "INC-302194",
    usuarioIdentificado: "joao.silva@erppro.com",
    enderecoAcesso: "177.200.45.12",
    tipoOcorrencia: "Falha de Autenticação",
    codigoSeguranca: "SEC-AUTH-102B",
    quantidadeTentativas: 1,
    statusBloqueio: "Liberado",
    dataTentativa: new Date(Date.now() - 3600000 * 1).toISOString(), // 1h atrás
  },
];

export function useDeteccaoAcessos() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const { addNotification } = useNotifications();

  const [ocorrencias, setOcorrencias] = useState<OcorrenciaAcesso[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_tentativas_acesso");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar tentativas de acesso:", e);
        }
      }
    }
    return mockOcorrenciasIniciais;
  });

  const [historicoEventos, setHistoricoEventos] = useState<OcorrenciaAcesso[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_historico_eventos_acesso");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar historico de acessos indesejados:", e);
        }
      }
    }
    return mockOcorrenciasIniciais;
  });

  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("erp_tentativas_acesso", JSON.stringify(ocorrencias));
  }, [ocorrencias]);

  useEffect(() => {
    localStorage.setItem("erp_historico_eventos_acesso", JSON.stringify(historicoEventos));
  }, [historicoEventos]);

  // Sync entre abas
  useEffect(() => {
    const handleStorageChange = () => {
      const savedOcors = localStorage.getItem("erp_tentativas_acesso");
      const savedHist = localStorage.getItem("erp_historico_eventos_acesso");
      if (savedOcors) {
        try { setOcorrencias(JSON.parse(savedOcors)); } catch (e) {}
      }
      if (savedHist) {
        try { setHistoricoEventos(JSON.parse(savedHist)); } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Registrar Falha/Tentativa de Login
  const registrarTentativa = useCallback(
    (usuarioIdentificado: string, enderecoAcesso: string, tipoOcorrencia: OcorrenciaAcesso["tipoOcorrencia"]) => {
      setError(null);

      const cleanedUser = usuarioIdentificado.trim();
      const cleanedIP = enderecoAcesso.trim();

      if (!cleanedUser || !cleanedIP) {
        setError("Dados da tentativa de login incompletos.");
        return false;
      }

      const dataAtual = new Date().toISOString();
      const refCodigoSeguranca = `SEC-${tipoOcorrencia === "Falha de Autenticação" ? "AUTH" : tipoOcorrencia === "Tentativa de Força Bruta" ? "BRUTE" : "TIME"}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Verifica se já existe um registro ativo do mesmo IP/Usuário
      const existeRegistro = ocorrencias.find(
        (o) => o.usuarioIdentificado === cleanedUser && o.enderecoAcesso === cleanedIP && o.statusBloqueio !== "Bloqueado Permanente"
      );

      let novaTentativas = 1;
      let statusBloqueio: OcorrenciaAcesso["statusBloqueio"] = "Liberado";
      let idOcorrencia = `INC-${Math.floor(100000 + Math.random() * 900000)}`;

      if (existeRegistro) {
        idOcorrencia = existeRegistro.id;
        novaTentativas = existeRegistro.quantidadeTentativas + 1;
      }

      if (novaTentativas >= 5) {
        statusBloqueio = "Bloqueado Permanente";
      } else if (novaTentativas >= 3) {
        statusBloqueio = "Bloqueado Temporário";
      }

      const ocorrenciaAtualizada: OcorrenciaAcesso = {
        id: idOcorrencia,
        usuarioIdentificado: cleanedUser,
        enderecoAcesso: cleanedIP,
        tipoOcorrencia,
        codigoSeguranca: existeRegistro?.codigoSeguranca || refCodigoSeguranca,
        quantidadeTentativas: novaTentativas,
        statusBloqueio,
        dataTentativa: dataAtual,
      };

      // Atualiza lista ativa
      if (existeRegistro) {
        setOcorrencias((prev) => prev.map((o) => (o.id === idOcorrencia ? ocorrenciaAtualizada : o)));
      } else {
        setOcorrencias((prev) => [ocorrenciaAtualizada, ...prev]);
      }

      // Copia para o Histórico de Eventos (imutável)
      setHistoricoEventos((prev) => [ocorrenciaAtualizada, ...prev]);

      addLog(`Registrou tentativa de acesso suspeita do IP ${cleanedIP}`, "seguranca");

      // Alertas de segurança
      if (statusBloqueio !== "Liberado") {
        addNotification(
          "Tentativa de Acesso Indevido",
          `O IP ${cleanedIP} foi ${statusBloqueio === "Bloqueado Permanente" ? "bloqueado permanentemente" : "bloqueado temporariamente"} após ${novaTentativas} tentativas falhas de login.`,
          "error",
          "gerente"
        );
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [ocorrencias, addNotification]
  );

  // Desbloquear IP (Ação administrativa de TI)
  const desbloquearIP = useCallback(
    (id: string) => {
      setError(null);

      if (user.role !== "admin") {
        setError("Apenas administradores de infraestrutura e segurança de TI podem desbloquear acessos.");
        return false;
      }

      setOcorrencias((prev) =>
        prev.map((o) => {
          if (o.id === id) {
            return {
              ...o,
              quantidadeTentativas: 0,
              statusBloqueio: "Liberado",
              dataTentativa: new Date().toISOString(),
            };
          }
          return o;
        })
      );

      addLog(`Desbloqueou o IP do registro de acesso ${id}`, "seguranca");

      addNotification(
        "Acesso Desbloqueado",
        `O bloqueio do registro ${id} foi revogado pelo administrador ${user.name}.`,
        "success",
        "gerente"
      );

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);

      return true;
    },
    [user, addNotification]
  );

  return {
    ocorrencias,
    historicoEventos,
    error,
    setError,
    registrarTentativa,
    desbloquearIP,
  };
}
