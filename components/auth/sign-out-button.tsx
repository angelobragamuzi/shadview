"use client";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { signOut } from "@/services/auth-service";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function SignOutButton({
  className,
  variant = "outline",
  size = "sm",
  showLabel = true,
}: {
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  showLabel?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      toast.success("Sessão encerrada com sucesso.");
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
      variant={variant}
      size={size}
      className={className}
      disabled={loading}
      onClick={handleSignOut}
      aria-label="Sair"
      title={showLabel ? undefined : "Sair"}
    >
      <LogOut className={showLabel ? "mr-2 h-4 w-4" : "h-4 w-4"} />
      {showLabel ? (loading ? "Saindo..." : "Sair") : null}
    </Button>
  );
}
