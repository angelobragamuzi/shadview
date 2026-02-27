"use client";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@/types";
import { ClipboardList, Home, Link2, Map, MapPinned, Menu, ScrollText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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

function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-blue-950 text-blue-50">
      <div className="px-6 py-5">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200">ShadBoard</p>
        <h1 className="mt-1 text-xl font-semibold">Gestão Urbana</h1>
        <Badge className="mt-3 bg-blue-100 text-blue-900 hover:bg-blue-100">
          {ROLE_LABELS[role]}
        </Badge>
      </div>
      <Separator className="bg-blue-900" />
      <nav className="space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-blue-800 text-white"
                  : "text-blue-100 hover:bg-blue-900/70 hover:text-white",
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3">
        <div className="rounded-lg border border-blue-800 bg-blue-900/50 p-3 text-xs text-blue-200">
          <p className="font-medium text-blue-50">Centro de controle urbano</p>
          <p className="mt-1">SLA, priorização e monitoramento em tempo real.</p>
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
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen md:grid-cols-[280px_1fr]">
        <aside className="hidden md:block">
          <Sidebar role={role} />
        </aside>
        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
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
                <div>
                  <p className="text-sm text-muted-foreground">Painel Executivo</p>
                  <p className="text-sm font-semibold text-blue-950">{fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/occurrence" target="_blank" rel="noreferrer">
                    <MapPinned className="mr-2 h-4 w-4" />
                    Formulário público
                  </Link>
                </Button>
                <ThemeToggle />
                <SignOutButton />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

