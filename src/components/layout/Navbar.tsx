"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell, Search, Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
}

export function Navbar({ setMobileOpen, collapsed }: NavbarProps) {
  const pathname = usePathname();

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
          <span className="text-xs text-muted-foreground hidden md:inline">Sistema ERP</span>
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

        {/* Quick actions */}
        <Button variant="ghost" size="icon" className="relative hover:bg-accent">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* Theme Toggle Placeholder */}
        <Button variant="ghost" size="icon" className="hover:bg-accent text-muted-foreground">
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="h-4 w-4 hidden dark:block" />
        </Button>

        <div className="h-8 w-px bg-border" />

        {/* User Status/Role badge */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Online
          </span>
        </div>
      </div>
    </header>
  );
}
