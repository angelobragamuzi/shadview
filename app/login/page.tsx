import { LoginForm } from "@/components/auth/login-form";
import { ShadboardLogo } from "@/components/brand/shadboard-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,560px)_1fr]">
        <section className="flex flex-col border-b border-border/70 bg-background/95 lg:border-b-0 lg:border-r">
          <div className="px-6 pt-8 md:px-10">
            <Link href="/sistema" className="inline-flex items-center" aria-label="ShadBoard">
              <ShadboardLogo className="h-7 md:h-8" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-10 md:px-10">
            <Card className="w-full max-w-md border-border/70 bg-card/90 shadow-2xl shadow-black/5 backdrop-blur dark:shadow-black/30">
              <CardHeader className="space-y-3">
                <CardTitle className="text-3xl">Login</CardTitle>
                <CardDescription className="leading-relaxed">
                  Acesse o painel de gestão urbana e planejamento operacional.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Suspense
                  fallback={<LoadingState className="min-h-[220px]" label="Carregando formulário..." />}
                >
                  <LoginForm />
                </Suspense>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Ainda não conhece a plataforma?</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/sistema">Ver apresentação do sistema</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </section>

        <section className="relative hidden overflow-hidden lg:block">
          <Image
            src="/login-gestao-urbana.jpg"
            alt="Vista aérea de área urbana com malha viária para representar gestão urbana e planejamento"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/45 via-background/30 to-background/75" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.18)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,hsl(var(--primary)/0.35),transparent_38%),radial-gradient(circle_at_80%_85%,hsl(var(--chart-1)/0.24),transparent_34%)]" />

        </section>
      </div>
    </div>
  );
}

