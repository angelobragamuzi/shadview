"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ExternalLink, Link2, MapPinned } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PUBLIC_FORM_PATH = "/occurrence";

export default function PublicLinksPage() {
  const [publicFormLink, setPublicFormLink] = useState(PUBLIC_FORM_PATH);

  useEffect(() => {
    setPublicFormLink(`${window.location.origin}${PUBLIC_FORM_PATH}`);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicFormLink);
      toast.success("Link público copiado com sucesso.");
    } catch {
      toast.error("Não foi possível copiar o link público.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-blue-100 bg-white p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-blue-700">
          Operação institucional
        </p>
        <h1 className="mt-2 text-3xl text-blue-950">Links públicos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use estes links para divulgar os canais de abertura de demanda pela população.
        </p>
      </section>

      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-950">
            <Link2 className="h-5 w-5 text-blue-700" />
            Formulário de denúncia pública
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
            {publicFormLink}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-blue-800 hover:bg-blue-700">
              <Link href={PUBLIC_FORM_PATH} target="_blank" rel="noreferrer">
                <MapPinned className="mr-2 h-4 w-4" />
                Abrir formulário
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" onClick={copyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
