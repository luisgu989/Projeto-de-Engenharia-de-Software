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
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    category: "Administração",
  },
];

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  // Group items by category
  const categories = ["Geral", "Módulos", "Administração"] as const;

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
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header/Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
              EP
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text">
                ERP Pro
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex hover:bg-accent hover:text-accent-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {categories.map((category) => {
            const items = menuItems.filter((item) => item.category === category);
            return (
              <div key={category} className="space-y-1.5">
                {!collapsed && (
                  <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category}
                  </h4>
                )}
                <nav className="space-y-1">
                  {items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 relative group",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}

                        {/* Collapsed Tooltip */}
                        {collapsed && (
                          <div className="absolute left-full ml-2 hidden group-hover:block z-50 rounded-md bg-popover border border-border px-2 py-1 text-xs text-popover-foreground shadow-md pointer-events-none whitespace-nowrap">
                            {item.title}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-border flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 shrink-0 rounded-full bg-accent flex items-center justify-center font-semibold text-sm">
            US
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">Usuário Suporte</span>
              <span className="text-xs text-muted-foreground truncate">admin@erppro.com.</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
