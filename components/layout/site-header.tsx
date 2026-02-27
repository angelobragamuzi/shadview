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
    <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-6">
        <Link href="/occurrence" className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-900 p-2 text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
              ShadBoard
            </p>
            <p className="text-sm font-semibold text-blue-950 dark:text-blue-50">
              Gestão Urbana Inteligente
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
