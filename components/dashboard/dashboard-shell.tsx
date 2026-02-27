"use client";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { NotificationsMenu } from "@/components/dashboard/notifications-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@/types";
import {
  Building2,
  ClipboardList,
  Columns2,
  Home,
  Link2,
  Map,
  MapPinned,
  Menu,
  ScrollText,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  {
    title: "Resumo",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Ocorrências",
    href: "/dashboard/occurrences",
    icon: ClipboardList,
  },
  {
    title: "Cadastro operacional",
    href: "/dashboard/operational",
    icon: Building2,
  },
  {
    title: "Mapa",
    href: "/dashboard/map",
    icon: Map,
  },
  {
    title: "Relatórios",
    href: "/dashboard/reports",
    icon: ScrollText,
  },
  {
    title: "Links públicos",
    href: "/dashboard/public-links",
    icon: Link2,
  },
];

function Sidebar({
  role,
  collapsed = false,
}: {
  role: UserRole;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const sidebarItemClass = (active?: boolean) =>
    cn(
      "flex w-full items-center rounded-md py-2 text-sm transition-all duration-200",
      collapsed ? "justify-center px-2" : "justify-start px-3",
      active
        ? "bg-blue-800 text-white dark:bg-slate-800"
        : "text-blue-100 hover:bg-blue-900/70 hover:text-white dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
    );

  return (
    <div className="flex h-full flex-col bg-blue-950 text-blue-50 transition-[padding] duration-300 dark:bg-slate-900 dark:text-slate-100">
      <div className={cn("py-5", collapsed ? "px-3" : "px-6")}>
        <div className={cn("flex items-start", collapsed ? "justify-center" : "justify-between")}>
          <div className={cn("min-w-0", collapsed && "text-center")}>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200 dark:text-slate-300">
              {collapsed ? "SB" : "ShadBoard"}
            </p>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                collapsed ? "mt-0 max-h-0 opacity-0" : "mt-1 max-h-16 opacity-100",
              )}
            >
              <h1 className="text-xl font-semibold">Gestão Urbana</h1>
              <Badge className="mt-3 border border-blue-100 bg-blue-100 text-blue-900 hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-800">
                {ROLE_LABELS[role]}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <Separator className="bg-blue-900 dark:bg-slate-800" />
      <nav className="space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={sidebarItemClass(active)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-200",
                  collapsed ? "max-w-0 opacity-0" : "ml-2 max-w-[140px] opacity-100",
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className={cn("mt-auto", collapsed ? "p-2" : "p-3")}>
        <Separator className="bg-blue-900 dark:bg-slate-800" />
        <div className="mt-2 space-y-1">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            asChild
            title={collapsed ? "Formulário público" : undefined}
            className={sidebarItemClass(false)}
          >
            <Link href="/occurrence" target="_blank" rel="noreferrer">
              <MapPinned className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-200",
                  collapsed ? "max-w-0 opacity-0" : "ml-2 max-w-[160px] opacity-100",
                )}
              >
                Formulário público
              </span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            asChild
            title={collapsed ? "Configurações" : undefined}
            className={sidebarItemClass(pathname === "/dashboard/settings")}
          >
            <Link href="/dashboard/settings" aria-label="Configurações">
              <Settings className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-200",
                  collapsed ? "max-w-0 opacity-0" : "ml-2 max-w-[120px] opacity-100",
                )}
              >
                Configurações
              </span>
            </Link>
          </Button>

          <SignOutButton
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            showLabel={!collapsed}
            className={sidebarItemClass(false)}
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  fullName,
  role,
}: {
  children: React.ReactNode;
  fullName: string;
  role: UserRole;
}) {
  const pathname = usePathname();
  const isDashboardHome = pathname === "/dashboard";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="h-dvh overflow-hidden bg-background">
      <div className="flex h-dvh">
        <aside
          className={cn(
            "hidden shrink-0 md:block",
            "transition-[width] duration-300 ease-in-out",
            isSidebarCollapsed ? "w-[84px]" : "w-[280px]",
          )}
        >
          <Sidebar role={role} collapsed={isSidebarCollapsed} />
        </aside>
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="outline" size="icon">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0">
                    <Sidebar role={role} />
                  </SheetContent>
                </Sheet>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="hidden h-9 w-9 border-primary/40 bg-background text-primary shadow-sm transition hover:bg-primary/10 md:inline-flex"
                  onClick={() => setIsSidebarCollapsed((previous) => !previous)}
                  aria-label={isSidebarCollapsed ? "Expandir menu lateral" : "Minimizar menu lateral"}
                >
                  <Columns2 className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-sm text-muted-foreground">Painel Executivo</p>
                  <p className="text-sm font-semibold text-foreground">{fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <NotificationsMenu />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main
            className={cn(
              "mx-auto w-full max-w-[1600px] flex-1 min-h-0 px-3 py-3 sm:px-4 sm:py-4 md:px-6",
              isDashboardHome ? "overflow-y-auto 2xl:overflow-hidden" : "overflow-y-auto",
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
