"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Database,
  FileText,
  Files,
  TrendingUp,
  GitMerge,
  Sparkles,
  CalendarDays,
  MessagesSquare,
  LifeBuoy,
  Activity,
  Layers,
  GitBranch,
  ClipboardList,
  Star,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";

export interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const categories = [
  "Geral",
  "Comercial & CRM",
  "Operações & Logística",
  "Controladoria",
  "Suporte & TI",
  "Colaboração",
  "Inteligência de Negócio",
  "Administração"
] as const;

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: typeof categories[number];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    category: "Geral",
  },
  // Comercial
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
    category: "Comercial & CRM",
  },
  {
    title: "Oportunidades",
    href: "/oportunidades",
    icon: TrendingUp,
    category: "Comercial & CRM",
  },
  {
    title: "Pipeline",
    href: "/pipeline",
    icon: GitMerge,
    category: "Comercial & CRM",
  },
  {
    title: "Vendas",
    href: "/vendas",
    icon: ShoppingCart,
    category: "Comercial & CRM",
  },
  // Operações
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
    category: "Operações & Logística",
  },
  {
    title: "Produção",
    href: "/producao",
    icon: Hammer,
    category: "Operações & Logística",
  },
  {
    title: "Logística",
    href: "/logistica",
    icon: Truck,
    category: "Operações & Logística",
  },
  {
    title: "Ativos & Patrimônio",
    href: "/ativos",
    icon: Layers,
    category: "Operações & Logística",
  },
  // Controladoria
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
    category: "Controladoria",
  },
  {
    title: "Contratos",
    href: "/contratos",
    icon: FileText,
    category: "Controladoria",
  },
  // Suporte & TI
  {
    title: "Chamados Técnicos",
    href: "/chamados",
    icon: LifeBuoy,
    category: "Suporte & TI",
  },
  {
    title: "Solicitações",
    href: "/solicitacoes",
    icon: ClipboardList,
    category: "Suporte & TI",
  },
  {
    title: "Desempenho TI",
    href: "/monitoramento",
    icon: Activity,
    category: "Suporte & TI",
  },
  {
    title: "Integrações",
    href: "/integracoes",
    icon: Database,
    category: "Suporte & TI",
  },
  // Colaboração
  {
    title: "Chat Interno",
    href: "/chat",
    icon: MessagesSquare,
    category: "Colaboração",
  },
  {
    title: "Agenda Corporativa",
    href: "/agenda",
    icon: CalendarDays,
    category: "Colaboração",
  },
  {
    title: "Workflows",
    href: "/workflows",
    icon: GitBranch,
    category: "Colaboração",
  },
  // BI
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    category: "Inteligência de Negócio",
  },
  {
    title: "BI & Analítico",
    href: "/analitico",
    icon: Sparkles,
    category: "Inteligência de Negócio",
  },
  // Administração
  {
    title: "Funcionários",
    href: "/funcionarios",
    icon: Briefcase,
    category: "Administração",
  },
  {
    title: "Documentos",
    href: "/documentos",
    icon: Files,
    category: "Administração",
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    category: "Administração",
  },
];

interface SidebarCategoryItem {
  title: typeof categories[number];
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarCategoryItems: SidebarCategoryItem[] = [
  { title: "Geral", href: "/", icon: LayoutDashboard },
  { title: "Comercial & CRM", href: "/comercial", icon: Users },
  { title: "Operações & Logística", href: "/operacoes", icon: Package },
  { title: "Controladoria", href: "/controladoria", icon: DollarSign },
  { title: "Suporte & TI", href: "/suporte", icon: Database },
  { title: "Colaboração", href: "/colaboracao", icon: MessagesSquare },
  { title: "Inteligência de Negócio", href: "/inteligencia", icon: BarChart3 },
  { title: "Administração", href: "/administracao", icon: Settings },
];

export function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { addToast } = useNotifications();

  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [menuSearch, setMenuSearch] = useState("");

  // Carregar favoritos
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_sidebar_favoritos");
      if (saved) {
        try {
          setFavoritos(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const toggleFavorite = (href: string) => {
    setFavoritos((prev) => {
      let updated;
      if (prev.includes(href)) {
        updated = prev.filter((h) => h !== href);
      } else {
        if (prev.length >= 4) {
          addToast("Limite Atingido", "Você pode fixar no máximo 4 módulos nos favoritos.", "warning");
          return prev;
        }
        updated = [...prev, href];
      }
      localStorage.setItem("erp_sidebar_favoritos", JSON.stringify(updated));
      return updated;
    });
  };

  // Filtragem de permissões nos itens internos (para busca e favoritos)
  const allowedMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.href === "/funcionarios" && !user.permissions.gerenciarEquipe) {
        return false;
      }
      if (item.href === "/financeiro" && !user.permissions.visualizarFinanceiro) {
        return false;
      }
      if (item.href === "/estoque" && !user.permissions.visualizarEstoque) {
        return false;
      }
      if (item.href === "/monitoramento" && user.role !== "admin") {
        return false;
      }
      return true;
    });
  }, [user]);

  // Filtragem inteligente de categorias baseadas na pesquisa
  const filteredCategories = useMemo(() => {
    return sidebarCategoryItems.filter((cat) => {
      // Se não for Geral, checa se tem algum submódulo permitido sob esta categoria
      if (cat.title !== "Geral") {
        const temPermitidos = allowedMenuItems.some((item) => item.category === cat.title);
        if (!temPermitidos) return false;
      }

      if (!menuSearch.trim()) return true;
      const term = menuSearch.toLowerCase();

      // Checa se o título da categoria combina com a pesquisa
      if (cat.title.toLowerCase().includes(term)) return true;

      // Checa se algum submódulo permitido da categoria combina com a pesquisa
      const subModules = allowedMenuItems.filter((item) => item.category === cat.title);
      return subModules.some((sub) => sub.title.toLowerCase().includes(term));
    });
  }, [allowedMenuItems, menuSearch]);

  // Função para determinar se a categoria está ativa (com base na rota atual ou rota dos filhos)
  const isCategoryActive = (title: typeof categories[number], href: string) => {
    if (pathname === href) return true;
    
    // Se estiver em um dos sub-itens dessa categoria, destaca a categoria pai como ativa
    const subModules = allowedMenuItems.filter((item) => item.category === title);
    return subModules.some(
      (sub) => pathname === sub.href || (sub.href !== "/" && pathname.startsWith(sub.href))
    );
  };

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
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:translate-x-0 select-none",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header / Logo (EP Preto) */}
        <div className={cn("flex h-16 items-center px-4 border-b border-border bg-card shrink-0", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow-lg shadow-primary/20">
                EP
              </div>
              <span className="font-extrabold text-base tracking-tight truncate text-foreground">
                ERP Pro
              </span>
            </Link>
          )}
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

        {/* Search input (Solidus style) */}
        {!collapsed && (
          <div className="px-3 pt-4 shrink-0">
            <input
              type="text"
              placeholder="Pesquisar..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full bg-card border border-border hover:border-muted-foreground/35 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none transition-all shadow-sm text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin">
          {/* Section: Favoritos (Se houver algum e sidebar expandido) */}
          {!collapsed && favoritos.length > 0 && (
            <div className="space-y-1.5">
              <div className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-500/5 border border-amber-500/25 rounded-xl shadow-sm">
                <Star className="h-4 w-4 fill-current shrink-0" />
                <span className="flex-1 text-left leading-none uppercase tracking-wider">Favoritos</span>
              </div>
              
              <div className="space-y-0.5 pl-3 border-l border-amber-500/25 ml-5 mt-1">
                {allowedMenuItems
                  .filter((item) => favoritos.includes(item.href))
                  .map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                    const SubIcon = item.icon;
                    return (
                      <div key={`fav-${item.href}`} className="group relative flex items-center w-full">
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 flex-1 min-w-0",
                            isActive
                              ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/10"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <SubIcon className="h-4 w-4 shrink-0 opacity-75" />
                          <span className="truncate leading-none">{item.title}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(item.href);
                          }}
                          className="absolute right-1 p-1 rounded text-amber-500 hover:text-amber-600 cursor-pointer"
                        >
                          <Star className="h-3 w-3 fill-current" />
                        </button>
                      </div>
                    );
                  })}
              </div>
              <div className="h-px bg-border/80 my-3 mx-1" />
            </div>
          )}

          {/* List of Category Pills (Solidus style) */}
          <div className="space-y-2">
            {filteredCategories.map((cat) => {
              const active = isCategoryActive(cat.title, cat.href);
              const CategoryIcon = cat.icon;

              if (collapsed) {
                return (
                  <div key={cat.title} className="py-1">
                    <Tooltip>
                      <TooltipTrigger render={<div className="mx-auto" />}>
                        <Link
                          href={cat.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "w-10 h-10 flex items-center justify-center bg-card border rounded-xl shadow-sm transition-all hover:bg-accent cursor-pointer text-primary",
                            active && "border-primary bg-primary text-primary-foreground"
                          )}
                        >
                          <CategoryIcon className="h-5 w-5 shrink-0" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-semibold text-xs">{cat.title}</TooltipContent>
                    </Tooltip>
                  </div>
                );
              }

              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold bg-card border border-border shadow-sm rounded-xl hover:shadow hover:bg-accent/40 transition-all cursor-pointer",
                    active && "border-primary/35 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary"
                  )}
                >
                  <CategoryIcon
                    className={cn(
                      "h-4.5 w-4.5 text-primary shrink-0",
                      active && "text-primary-foreground dark:text-white"
                    )}
                  />
                  <span className="flex-1 text-left truncate leading-none">{cat.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer — User Info */}
        <div className="p-3 border-t border-border bg-card shrink-0 no-print">
          <Link
            href="/configuracoes"
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors cursor-pointer outline-none",
              collapsed && "justify-center px-0"
            )}
            title={`${user.name} (${user.email}) - Acessar Perfil e Configurações`}
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary border border-primary/20 uppercase">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">{user.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
