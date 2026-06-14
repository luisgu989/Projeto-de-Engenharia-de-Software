"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Hammer,
  Truck,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";

export interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "Geral" | "Módulos" | "Administração";
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    category: "Geral",
  },
  {
    title: "Vendas",
    href: "/vendas",
    icon: ShoppingCart,
    category: "Módulos",
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
    category: "Módulos",
  },
  {
    title: "Produção",
    href: "/producao",
    icon: Hammer,
    category: "Módulos",
  },
  {
    title: "Logística",
    href: "/logistica",
    icon: Truck,
    category: "Módulos",
  },
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
    category: "Módulos",
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
    category: "Módulos",
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    category: "Módulos",
  },
  {
    title: "Funcionários",
    href: "/funcionarios",
    icon: Briefcase,
    category: "Administração",
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    category: "Administração",
  },
];

const categories = ["Geral", "Módulos", "Administração"] as const;

/**
 * SidebarNavItem: Responsabilidade única — renderiza um item de navegação
 * com suporte a tooltip quando o sidebar está colapsado.
 */
function SidebarNavItem({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: MenuItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  const linkEl = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={linkEl} />
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return linkEl;
}

/**
 * Sidebar: Responsabilidade única — navegação lateral da aplicação
 * com suporte a colapso (desktop) e abertura por overlay (mobile).
 */
export function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const allowedMenuItems = menuItems.filter((item) => {
    if (item.href === "/funcionarios" && !user.permissions.gerenciarEquipe) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ease-in-out lg:translate-x-0",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/20">
              EP
            </div>
            {!collapsed && (
              <span className="font-semibold text-base tracking-tight truncate">
                ERP Pro
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex hover:bg-accent hover:text-accent-foreground shrink-0"
            aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {categories.map((category) => {
            const items = allowedMenuItems.filter((item) => item.category === category);
            return (
              <div key={category} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {category}
                  </p>
                )}
                {collapsed && (
                  <div className="h-px bg-border my-2 mx-1" />
                )}
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                      <SidebarNavItem
                        key={item.href}
                        item={item}
                        isActive={isActive}
                        collapsed={collapsed}
                        onNavigate={() => setMobileOpen(false)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer — User Info */}
        <div className="p-3 border-t border-border shrink-0 no-print">
          <div
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors cursor-pointer",
              collapsed && "justify-center px-0"
            )}
            title={`${user.name} (${user.email})`}
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary border border-primary/20 uppercase">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">{user.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
