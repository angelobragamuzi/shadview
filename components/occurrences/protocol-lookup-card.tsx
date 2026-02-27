"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { extractProtocolId } from "@/lib/protocol";
import { cn } from "@/lib/utils";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ProtocolLookupCard({ className }: { className?: string }) {
  const router = useRouter();
  const [protocolInput, setProtocolInput] = useState("");

  const handleLookup = () => {
    const protocolId = extractProtocolId(protocolInput.trim());

    if (!protocolId) {
      toast.error("Informe um protocolo válido ou cole o link completo de acompanhamento.");
      return;
    }

    router.push(`/occurrence/${protocolId}`);
  };

  return (
    <Card className={cn("shadow-lg shadow-black/5 dark:shadow-black/30", className)}>
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-lg text-foreground">Acompanhar protocolo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cole o protocolo ou o link recebido para abrir o andamento em 1 clique.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          placeholder="Ex.: 550e8400-e29b-41d4-a716-446655440000"
          value={protocolInput}
          onChange={(event) => setProtocolInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleLookup();
            }
          }}
        />
        <Button onClick={handleLookup}>
          <Search className="mr-2 h-4 w-4" />
          Visualizar protocolo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
