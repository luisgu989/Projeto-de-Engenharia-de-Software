"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserPermissions {
  visualizarEstoque: boolean;
  movimentarEstoque: boolean;      // Registrar entradas e saídas
  gerenciarEstoque: boolean;        // Cadastrar, editar e excluir produtos
  visualizarFinanceiro: boolean;    // Visualizar e gerenciar financeiro
  gerenciarEquipe: boolean;         // Gerenciar colaboradores/funcionários
  verLogsAuditoria: boolean;        // Ver logs de auditoria do sistema
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  cargo: string;
  permissions: UserPermissions;
}

interface AuthContextType {
  user: UserProfile;
  setRole: (role: "admin" | "employee") => void;
  updateUser: (name: string, email: string) => void;
  switchProfile: (email: string) => void;
  updateUserPermissions: (email: string, permissions: Partial<UserPermissions>) => void;
  getUserPermissions: (email: string, role: "admin" | "employee", cargo?: string) => UserPermissions;
  availableProfiles: { id: string; name: string; email: string; role: "admin" | "employee"; cargo: string }[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPermissionsAdmin: UserPermissions = {
  visualizarEstoque: true,
  movimentarEstoque: true,
  gerenciarEstoque: true,
  visualizarFinanceiro: true,
  gerenciarEquipe: true,
  verLogsAuditoria: true,
};

const defaultPermissionsEmployee = (cargo: string = ""): UserPermissions => {
  const c = cargo.toLowerCase();
  if (c.includes("gerente") || c.includes("diretor")) {
    return {
      visualizarEstoque: true,
      movimentarEstoque: true,
      gerenciarEstoque: true,
      visualizarFinanceiro: true,
      gerenciarEquipe: false, // apenas super-admin gerencia equipe por padrão
      verLogsAuditoria: false,
    };
  }
  if (c.includes("analista") || c.includes("assistente") || c.includes("administrativo")) {
    return {
      visualizarEstoque: true,
      movimentarEstoque: true,
      gerenciarEstoque: false,
      visualizarFinanceiro: false,
      gerenciarEquipe: false,
      verLogsAuditoria: false,
    };
  }
  // Suporte ou outros
  return {
    visualizarEstoque: true,
    movimentarEstoque: false,
    gerenciarEstoque: false,
    visualizarFinanceiro: false,
    gerenciarEquipe: false,
    verLogsAuditoria: false,
  };
};

const staticProfiles = [
  { id: "ADMIN-001", name: "Usuário Suporte", email: "admin@erppro.com", role: "admin" as const, cargo: "Administrador" },
  { id: "FUNC-001", name: "João da Silva", email: "joao.silva@erppro.com", role: "employee" as const, cargo: "Gerente" },
  { id: "FUNC-002", name: "Maria Santos", email: "maria.santos@erppro.com", role: "employee" as const, cargo: "Analista" },
  { id: "FUNC-003", name: "Pedro Oliveira", email: "pedro.oliveira@erppro.com", role: "employee" as const, cargo: "Suporte" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>({
    id: "ADMIN-001",
    name: "Usuário Suporte",
    email: "admin@erppro.com",
    role: "admin",
    cargo: "Administrador",
    permissions: defaultPermissionsAdmin,
  });

  const [availableProfiles, setAvailableProfiles] = useState(staticProfiles);

  // Sync available profiles with localStorage employees
  useEffect(() => {
    const updateProfilesList = () => {
      const savedFuncs = localStorage.getItem("erp_funcionarios");
      if (savedFuncs) {
        try {
          const funcs = JSON.parse(savedFuncs);
          const activeFuncs = funcs
            .filter((f: any) => f.status === "ativo")
            .map((f: any) => ({
              id: f.id,
              name: f.nome,
              email: f.email,
              role: f.cargo.toLowerCase().includes("gerente") || f.cargo.toLowerCase().includes("diretor") ? "admin" as const : "employee" as const,
              cargo: f.cargo,
            }));
          
          // Combine Admin with active employees
          const adminProfile = staticProfiles[0];
          setAvailableProfiles([adminProfile, ...activeFuncs]);
        } catch (e) {
          console.error(e);
        }
      }
    };

    updateProfilesList();
    
    // Listen for changes
    window.addEventListener("storage", updateProfilesList);
    return () => window.removeEventListener("storage", updateProfilesList);
  }, []);

  // Helper to load permissions for any user
  const getUserPermissions = (email: string, role: "admin" | "employee", cargo: string = ""): UserPermissions => {
    if (role === "admin" && email === "admin@erppro.com") {
      return defaultPermissionsAdmin;
    }
    const savedCustom = localStorage.getItem("erp_custom_permissions");
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        if (parsed[email]) {
          return {
            ...defaultPermissionsEmployee(cargo),
            ...parsed[email],
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return defaultPermissionsEmployee(cargo);
  };

  // Load active simulated user from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("erp_simulated_email") || "admin@erppro.com";
    const profile = availableProfiles.find((p) => p.email === savedEmail) || availableProfiles[0];
    
    const permissions = getUserPermissions(profile.email, profile.role, profile.cargo);
    setUser({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      cargo: profile.cargo,
      permissions,
    });
  }, [availableProfiles]);

  const switchProfile = (email: string) => {
    const profile = availableProfiles.find((p) => p.email === email) || availableProfiles[0];
    localStorage.setItem("erp_simulated_email", profile.email);
    localStorage.setItem("erp_simulated_role", profile.role);
    localStorage.setItem("erp_simulated_name", profile.name);

    const permissions = getUserPermissions(profile.email, profile.role, profile.cargo);
    setUser({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      cargo: profile.cargo,
      permissions,
    });

    // Fire storage event to notify other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
  };

  const updateUserPermissions = (email: string, newPerms: Partial<UserPermissions>) => {
    const savedCustom = localStorage.getItem("erp_custom_permissions") || "{}";
    let customDict: Record<string, any> = {};
    try {
      customDict = JSON.parse(savedCustom);
    } catch (e) {
      console.error(e);
    }

    const currentProfile = availableProfiles.find(p => p.email === email);
    const basePermissions = getUserPermissions(email, currentProfile?.role || "employee", currentProfile?.cargo || "");

    customDict[email] = {
      ...basePermissions,
      ...newPerms,
    };

    localStorage.setItem("erp_custom_permissions", JSON.stringify(customDict));

    // If updating currently logged in user, refresh their state
    if (user.email === email) {
      setUser((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          ...newPerms,
        },
      }));
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
  };

  const setRole = (role: "admin" | "employee") => {
    localStorage.setItem("erp_simulated_role", role);
    setUser((prev) => {
      const email = role === "admin" ? "admin@erppro.com" : "maria.santos@erppro.com";
      const profile = availableProfiles.find((p) => p.email === email) || availableProfiles[0];
      localStorage.setItem("erp_simulated_email", profile.email);
      localStorage.setItem("erp_simulated_name", profile.name);
      
      return {
        ...prev,
        role,
        name: profile.name,
        email: profile.email,
        cargo: profile.cargo,
        permissions: getUserPermissions(profile.email, role, profile.cargo),
      };
    });
  };

  const updateUser = (name: string, email: string) => {
    localStorage.setItem("erp_simulated_name", name);
    localStorage.setItem("erp_simulated_email", email);
    setUser((prev) => ({ ...prev, name, email }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setRole,
        updateUser,
        switchProfile,
        updateUserPermissions,
        getUserPermissions,
        availableProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
