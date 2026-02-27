import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login Gestor",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-4 py-10 md:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Acesso gestor
          </p>
          <h1 className="text-4xl text-foreground">Painel de Gestão ShadBoard</h1>
          <p className="max-w-xl text-muted-foreground">
            Este login é exclusivo para gestores da prefeitura. O denunciante utiliza
            apenas o formulário público de ocorrências.
          </p>
        </div>
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/30">
          <CardHeader>
            <CardTitle>Entrar como gestor</CardTitle>
            <CardDescription>
              Use suas credenciais institucionais com role gestor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando...</p>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
