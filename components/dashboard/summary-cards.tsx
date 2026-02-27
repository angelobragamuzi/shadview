import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardMetrics } from "@/types";
import { Activity, Clock3, MapPinned, Workflow } from "lucide-react";

export function SummaryCards({
  metrics,
  compact = false,
}: {
  metrics: DashboardMetrics;
  compact?: boolean;
}) {
  const topNeighborhood = Object.entries(metrics.byNeighborhood).sort(
    (left, right) => right[1] - left[1],
  )[0];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between space-y-0",
            compact && "p-4 pb-2",
          )}
        >
          <CardTitle className={cn("text-sm font-medium", compact && "text-xs")}>
            Total de Ocorrencias
          </CardTitle>
          <Activity className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent className={cn(compact && "p-4 pt-0")}>
          <p className={cn("font-semibold text-blue-950", compact ? "text-2xl" : "text-3xl")}>
            {metrics.total}
          </p>
          <p className="text-xs text-muted-foreground">Base consolidada do periodo filtrado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between space-y-0",
            compact && "p-4 pb-2",
          )}
        >
          <CardTitle className={cn("text-sm font-medium", compact && "text-xs")}>
            Tempo medio de resolucao
          </CardTitle>
          <Clock3 className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent className={cn(compact && "p-4 pt-0")}>
          <p className={cn("font-semibold text-blue-950", compact ? "text-2xl" : "text-3xl")}>
            {metrics.avgResolutionHours.toFixed(1)}h
          </p>
          <p className="text-xs text-muted-foreground">Indicador principal de SLA</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between space-y-0",
            compact && "p-4 pb-2",
          )}
        >
          <CardTitle className={cn("text-sm font-medium", compact && "text-xs")}>
            Bairro mais afetado
          </CardTitle>
          <MapPinned className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent className={cn(compact && "p-4 pt-0")}>
          <p className={cn("font-semibold text-blue-950", compact ? "text-lg" : "text-xl")}>
            {topNeighborhood?.[0] ?? "Sem dados"}
          </p>
          <p className="text-xs text-muted-foreground">
            {topNeighborhood ? `${topNeighborhood[1]} ocorrencias` : "Nenhuma ocorrencia"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between space-y-0",
            compact && "p-4 pb-2",
          )}
        >
          <CardTitle className={cn("text-sm font-medium", compact && "text-xs")}>
            Resolucao efetiva
          </CardTitle>
          <Workflow className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent className={cn(compact && "p-4 pt-0")}>
          <p className={cn("font-semibold text-blue-950", compact ? "text-2xl" : "text-3xl")}>
            {metrics.total > 0
              ? `${(((metrics.byStatus.resolvido ?? 0) / metrics.total) * 100).toFixed(0)}%`
              : "0%"}
          </p>
          <p className="text-xs text-muted-foreground">% de protocolos concluidos</p>
        </CardContent>
      </Card>
    </div>
  );
}
