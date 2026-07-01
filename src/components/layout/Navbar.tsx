"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, Search, Sun, Moon, Trash2, CheckCircle2, AlertTriangle, XCircle, Info, CheckCheck, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useNotifications } from "@/contexts/notifications-context";
import { cn } from "@/lib/utils";

export interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
}

export function Navbar({ setMobileOpen, collapsed: _collapsed }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, switchProfile, availableProfiles, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { filteredNotifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [notifsOpen, setNotifsOpen] = React.useState(false);

  // Helper to format breadcrumb based on pathname
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/").filter(Boolean)[0];
    if (!segment) return "ERP Pro";
    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Toggle Mobile Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Title / Breadcrumb */}
        <div className="flex items-center gap-2">
          {pathname !== "/" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 mr-1 hover:bg-accent text-muted-foreground hover:text-foreground"
              title="Voltar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
            Sistema ERP
          </Link>
          <span className="text-xs text-muted-foreground hidden md:inline">/</span>
          <h1 className="text-base font-semibold text-foreground tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-3">
        {/* Search Toggle Placeholder */}
        <div className="relative hidden sm:block w-48 md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Pesquisar..."
            className="w-full bg-accent/50 hover:bg-accent/80 focus:bg-background rounded-md pl-9 pr-4 py-1.5 text-sm border border-transparent focus:border-border focus:outline-none transition-all"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifsOpen(!notifsOpen)}
            className={cn("relative hover:bg-accent", notifsOpen && "bg-accent")}
            aria-label="Abrir notificações"
            id="notifications-bell"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
            )}
          </Button>

          {notifsOpen && (
            <>
              {/* Overlay background to close the modal */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setNotifsOpen(false)}
              />

              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card text-card-foreground shadow-xl z-50 overflow-hidden divide-y divide-border transform scale-100 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-accent/40">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                        {unreadCount} novas
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Marcar todas como lidas"
                      onClick={() => {
                        markAllAsRead();
                      }}
                      className="hover:bg-accent hover:text-foreground text-muted-foreground"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Limpar todas"
                      onClick={() => {
                        clearAll();
                      }}
                      className="hover:bg-accent hover:text-foreground text-muted-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Nenhuma notificação por aqui
                      </span>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => {
                      let Icon = Info;
                      let iconColor = "text-blue-500";
                      if (notif.tipo === "success") {
                        Icon = CheckCircle2;
                        iconColor = "text-emerald-500";
                      } else if (notif.tipo === "warning") {
                        Icon = AlertTriangle;
                        iconColor = "text-amber-500";
                      } else if (notif.tipo === "error") {
                        Icon = XCircle;
                        iconColor = "text-destructive";
                      }

                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                          }}
                          className={cn(
                            "flex gap-3 p-3 text-left transition-colors cursor-pointer hover:bg-accent/40",
                            !notif.lida && "bg-primary/5 dark:bg-primary/10"
                          )}
                        >
                          <div className={cn("p-1.5 rounded-lg bg-accent/60 shrink-0 self-start", iconColor)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={cn("text-xs font-bold truncate", !notif.lida && "text-foreground font-extrabold")}>
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {new Date(notif.timestamp).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] leading-snug text-muted-foreground break-words line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                          {!notif.lida && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 self-center" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2.5 bg-accent/20 text-center border-t border-border">
                  <Link
                    href="/notificacoes"
                    onClick={() => setNotifsOpen(false)}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors inline-block w-full"
                  >
                    Ver todas as notificações
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-accent text-muted-foreground"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </Button>

        <div className="h-8 w-px bg-border no-print" />

        {/* Profile Simulator Dropdown (US021) */}
        <div className="flex items-center gap-2 no-print">
          <label htmlFor="simulador-acesso" className="text-[10px] font-bold text-muted-foreground uppercase hidden lg:inline-block">
            Simular:
          </label>
          <select
            id="simulador-acesso"
            value={user.email}
            onChange={(e) => switchProfile(e.target.value)}
            className="bg-accent/40 border border-border focus:border-ring/30 focus:ring-2 focus:ring-ring/10 focus:outline-none rounded-md px-2 py-1 text-xs font-medium cursor-pointer max-w-[130px] sm:max-w-[180px] md:max-w-none text-foreground"
          >
            {availableProfiles.map((p) => (
              <option key={p.email} value={p.email}>
                {p.name} ({p.cargo})
              </option>
            ))}
          </select>
        </div>

        {/* User Status/Role badge */}
        <div className="hidden md:flex flex-col items-end no-print">
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
            user.role === "admin" 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          )}>
            {user.role === "admin" ? "Admin" : "Colaborador"}
          </span>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          title="Sair do Sistema"
          className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0 no-print"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
