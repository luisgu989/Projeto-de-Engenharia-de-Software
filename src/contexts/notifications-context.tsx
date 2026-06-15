"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  tipo: "info" | "success" | "warning" | "error";
  lida: boolean;
  scope: "gerente" | "logistica" | "geral";
}

export interface Toast {
  id: string;
  title: string;
  message: string;
  tipo: "info" | "success" | "warning" | "error";
}

interface NotificationsContextType {
  notifications: Notification[];
  filteredNotifications: Notification[];
  unreadCount: number;
  toasts: Toast[];
  addNotification: (
    title: string,
    message: string,
    tipo: Notification["tipo"],
    scope: Notification["scope"]
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  deleteNotification: (id: string) => void;
  addToast: (title: string, message: string, tipo: Toast["tipo"]) => void;
  dismissToast: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const mockNotificationsIniciais: Notification[] = [
  {
    id: "NOT-001",
    title: "Estoque Baixo",
    message: "O produto Mouse Gamer Sem Fio está abaixo do limite mínimo (8 un. restantes).",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2h atrás
    tipo: "warning",
    lida: false,
    scope: "gerente",
  },
  {
    id: "NOT-002",
    title: "Rota Otimizada",
    message: "A Rota Sudeste (ROT-001) foi otimizada, reduzindo custos em 15% (R$ 240,00 economizados).",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h atrás
    tipo: "success",
    lida: false,
    scope: "logistica",
  },
  {
    id: "NOT-003",
    title: "Ordem de Produção Planejada",
    message: "Nova OP-001 agendada para início na Linha de Montagem A.",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), // 6h atrás
    tipo: "info",
    lida: true,
    scope: "gerente",
  },
  {
    id: "NOT-004",
    title: "Nova Venda Confirmada",
    message: "Venda VEN-2026-001 realizada com sucesso para Ana Silva (R$ 1.250,00).",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24h atrás
    tipo: "success",
    lida: true,
    scope: "geral",
  },
  {
    id: "NOT-005",
    title: "Atraso no Transporte",
    message: "A carga CRG-002 apresentou um atraso devido ao tráfego intenso na rodovia.",
    timestamp: new Date(Date.now() - 3600000 * 30).toISOString(), // 30h atrás
    tipo: "error",
    lida: false,
    scope: "logistica",
  },
];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotificationsIniciais);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("erp_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar notificações:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("erp_notifications", JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  // Sync between tabs/profiles
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("erp_notifications");
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addToast = (title: string, message: string, tipo: Toast["tipo"]) => {
    const id = `TOAST-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, title, message, tipo };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss toast after 5s
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotification = (
    title: string,
    message: string,
    tipo: Notification["tipo"],
    scope: Notification["scope"]
  ) => {
    const newNotification: Notification = {
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      tipo,
      lida: false,
      scope,
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Check if the current user has access to see this notification scope before showing a toast
    const cargo = user.cargo?.toLowerCase() || "";
    const isGerente = user.role === "admin" || cargo.includes("gerente") || cargo.includes("diretor");
    const isLogistica = user.role === "admin" || cargo.includes("logística") || cargo.includes("analista");

    let userCanSee = false;
    if (scope === "geral") userCanSee = true;
    else if (scope === "gerente" && isGerente) userCanSee = true;
    else if (scope === "logistica" && isLogistica) userCanSee = true;

    if (userCanSee) {
      addToast(title, message, tipo);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Filter notifications by user roles/activities (US079)
  const cargo = user.cargo?.toLowerCase() || "";
  const isGerente = user.role === "admin" || cargo.includes("gerente") || cargo.includes("diretor");
  const isLogistica = user.role === "admin" || cargo.includes("logística") || cargo.includes("analista");

  const filteredNotifications = notifications.filter((n) => {
    if (n.scope === "geral") return true;
    if (n.scope === "gerente") return isGerente;
    if (n.scope === "logistica") return isLogistica;
    return true;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.lida).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        filteredNotifications,
        unreadCount,
        toasts,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        deleteNotification,
        addToast,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className={`pointer-events-auto flex flex-col gap-1 p-4 rounded-xl border shadow-lg cursor-pointer transform translate-y-0 opacity-100 transition-all duration-300 bg-card hover:bg-accent/40 ${
              toast.tipo === "success"
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : toast.tipo === "warning"
                ? "border-amber-500/30 text-amber-600 dark:text-amber-400"
                : toast.tipo === "error"
                ? "border-destructive/30 text-destructive"
                : "border-border text-foreground"
            }`}
            style={{
              animation: "slideIn 0.3s ease-out forwards",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold tracking-tight">{toast.title}</span>
              <button
                className="text-xs text-muted-foreground hover:text-foreground shrink-0 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(toast.id);
                }}
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{toast.message}</p>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications deve ser usado dentro de um NotificationsProvider");
  }
  return context;
}
