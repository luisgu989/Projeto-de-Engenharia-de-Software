"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface RegistroBackup {
  id: string;
  tipo: "completo" | "incremental";
  dataExecucao: string;
  status: "sucesso" | "falha" | "executando";
  caminhoArquivo: string;
  usuarioResponsavel: string;
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

export function useBackup() {
  const { user } = useAuth();
  const [backups, setBackups] = useState<RegistroBackup[]>(backupsIniciais);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("erp_backups");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setBackups(parsed);
          setIsLoaded(true);
        }, 0);
        return;
      } catch (exception) {
        console.error(exception);
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
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_backups");
      if (saved) {
        try {
          setBackups(JSON.parse(saved));
        } catch (exception) {
          console.error(exception);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const criarBackup = (tipo: "completo" | "incremental") => {
    const idGerado = `BKP-${String(backups.length + 1).padStart(3, "0")}`;
    const timestamp = new Date().toISOString();
    const arquivoNome = `/backups/backup_${tipo}_${timestamp.replace(/[:.-]/g, "")}.sql`;

    const novoBackup: RegistroBackup = {
      id: idGerado,
      tipo,
      dataExecucao: timestamp,
      status: "executando",
      caminhoArquivo: arquivoNome,
      usuarioResponsavel: user.name || "Equipe de TI"
    };

    setBackups((prev) => [novoBackup, ...prev]);

    setTimeout(() => {
      setBackups((prevList) =>
        prevList.map((bkp) =>
          bkp.id === idGerado ? { ...bkp, status: "sucesso" as const } : bkp
        )
      );
    }, 3000);

    return true;
  };

  const restaurarBackup = (_id: string) => {
    return true;
  };

  return {
    backups,
    criarBackup,
    restaurarBackup
  };
}
