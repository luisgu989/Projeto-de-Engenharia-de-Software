"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLogs } from "@/contexts/logs-context";

export interface RegistroBackup {
  id: string;
  tipo: "completo" | "incremental";
  dataExecucao: string;
  status: "sucesso" | "falha" | "executando";
  caminhoArquivo: string;
  usuarioResponsavel: string;
}

export interface ConfiguracaoBackup {
  tipo: "completo" | "incremental";
  frequencia: "diario" | "semanal" | "mensal";
  localArmazenamento: string;
}

const backupsIniciais: RegistroBackup[] = [
  {
    id: "BKP-001",
    tipo: "completo",
    dataExecucao: "2026-06-01T02:00:00.000Z",
    status: "sucesso",
    caminhoArquivo: "/backups/backup_completo_20260601.sql",
    usuarioResponsavel: "Administrador Geral"
  },
  {
    id: "BKP-002",
    tipo: "incremental",
    dataExecucao: "2026-06-08T03:00:00.000Z",
    status: "sucesso",
    caminhoArquivo: "/backups/backup_inc_20260608.sql",
    usuarioResponsavel: "Administrador Geral"
  }
];

const configuracaoInicial: ConfiguracaoBackup = {
  tipo: "completo",
  frequencia: "semanal",
  localArmazenamento: "/var/backups/erp"
};

export function useBackup() {
  const { user } = useAuth();
  const { addLog } = useLogs();
  const [backups, setBackups] = useState<RegistroBackup[]>(backupsIniciais);
  const [config, setConfig] = useState<ConfiguracaoBackup>(configuracaoInicial);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedBackups = localStorage.getItem("erp_backups");
    if (savedBackups) {
      try {
        setBackups(JSON.parse(savedBackups));
      } catch (e) {
        console.error(e);
      }
    }

    const savedConfig = localStorage.getItem("erp_backup_config");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
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
      localStorage.setItem("erp_backups", JSON.stringify(backups));
    }
  }, [backups, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_backup_config", JSON.stringify(config));
    }
  }, [config, isLoaded]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedBackups = localStorage.getItem("erp_backups");
      if (savedBackups) {
        try {
          const parsed = JSON.parse(savedBackups);
          setBackups((current) => {
            if (JSON.stringify(current) === savedBackups) {
              return current;
            }
            return parsed;
          });
        } catch (e) {
          console.error(e);
        }
      }

      const savedConfig = localStorage.getItem("erp_backup_config");
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setConfig((current) => {
            if (JSON.stringify(current) === savedConfig) {
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

  const criarBackup = (tipo: "completo" | "incremental") => {
    const idGerado = `BKP-${String(backups.length + 1).padStart(3, "0")}`;
    const timestamp = new Date().toISOString();
    const pastaBase = config.localArmazenamento.endsWith("/")
      ? config.localArmazenamento
      : `${config.localArmazenamento}/`;
    const arquivoNome = `${pastaBase}backup_${tipo}_${timestamp.replace(/[:.-]/g, "")}.sql`;

    const novoBackup: RegistroBackup = {
      id: idGerado,
      tipo,
      dataExecucao: timestamp,
      status: "executando",
      caminhoArquivo: arquivoNome,
      usuarioResponsavel: user.name || "Equipe de TI"
    };

    setBackups((prev) => [novoBackup, ...prev]);
    addLog(`Disparou execução de backup manual (${tipo})`, "seguranca");

    setTimeout(() => {
      setBackups((prevList) =>
        prevList.map((bkp) =>
          bkp.id === idGerado ? { ...bkp, status: "sucesso" as const } : bkp
        )
      );
      addLog(`Backup ${idGerado} concluído com sucesso`, "seguranca");
    }, 3000);

    return true;
  };

  const restaurarBackup = (id: string) => {
    const alvo = backups.find((b) => b.id === id);
    if (alvo) {
      addLog(`Restaurou o sistema para o backup ${id} (${alvo.tipo})`, "seguranca");
      return true;
    }
    return false;
  };

  const atualizarConfiguracaoBackup = (
    tipo: ConfiguracaoBackup["tipo"],
    frequencia: ConfiguracaoBackup["frequencia"],
    localArmazenamento: string
  ) => {
    setError(null);
    if (!localArmazenamento.trim()) {
      setError("O local de armazenamento não pode estar vazio.");
      return false;
    }

    const pathRegex = /^([a-zA-Z]:|\/|[a-zA-Z0-9_-]+)/;
    if (!pathRegex.test(localArmazenamento.trim())) {
      setError("Caminho de armazenamento inválido.");
      return false;
    }

    setConfig({
      tipo,
      frequencia,
      localArmazenamento: localArmazenamento.trim()
    });

    addLog(`Atualizou configuração da rotina automática de backup`, "seguranca");
    return true;
  };

  return {
    backups,
    config,
    criarBackup,
    restaurarBackup,
    atualizarConfiguracaoBackup,
    error,
    setError
  };
}
