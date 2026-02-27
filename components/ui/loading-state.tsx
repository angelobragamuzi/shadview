import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({
  label = "Carregando...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[160px] w-full items-center justify-center",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
