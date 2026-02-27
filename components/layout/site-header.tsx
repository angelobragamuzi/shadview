"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-6">
        <Link href="/occurrence" className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              ShadBoard
            </p>
            <p className="text-sm font-semibold text-foreground">
              Gestão Urbana Inteligente
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
