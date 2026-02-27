"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { purgeAllAppData } from "@/services/occurrence-service";
import { AlertTriangle, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmationText.trim().toUpperCase() === "APAGAR";

  const handleDeleteAllData = async () => {
    if (!canDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await purgeAllAppData();
      toast.success("Todos os dados operacionais e de ocorrências foram apagados.");
      setConfirmationText("");
      setIsDialogOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível apagar os dados.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Configurações
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Área para ajustes gerais da plataforma.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-destructive/35 bg-destructive/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Zona de risco
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta ação remove ocorrências, vínculos, instituições, equipes e agentes
              operacionais cadastrados.
            </p>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="mt-4">
                  Apagar todos os dados
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Confirmar exclusão total de dados</DialogTitle>
                  <DialogDescription>
                    Esta ação é irreversível. Para confirmar, digite <strong>APAGAR</strong> no
                    campo abaixo.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <Label htmlFor="delete-confirmation">Confirmação</Label>
                  <Input
                    id="delete-confirmation"
                    placeholder="Digite APAGAR"
                    value={confirmationText}
                    onChange={(event) => setConfirmationText(event.target.value)}
                    autoComplete="off"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void handleDeleteAllData()}
                    disabled={!canDelete || isDeleting}
                  >
                    {isDeleting ? "Apagando..." : "Confirmar exclusão"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
