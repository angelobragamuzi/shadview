"use client";

import { ShadboardLogo } from "@/components/brand/shadboard-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/sistema") ||
    pathname.startsWith("/login")
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-6">
        <Link href="/occurrence" className="inline-flex items-center" aria-label="ShadBoard">
          <ShadboardLogo className="h-6 md:h-7" />
        </Link>
      </div>
    </header>
  );
}
