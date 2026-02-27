"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/services/auth-service";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      toast.success("Sessao encerrada com sucesso.");
      router.push("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível sair.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleSignOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}

