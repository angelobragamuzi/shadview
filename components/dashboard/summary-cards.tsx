import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetrics } from "@/types";
import { Activity, Clock3, MapPinned, Workflow } from "lucide-react";

export function SummaryCards({ metrics }: { metrics: DashboardMetrics }) {
  const topNeighborhood = Object.entries(metrics.byNeighborhood).sort(
    (left, right) => right[1] - left[1],
  )[0];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Total de Ocorrências</CardTitle>
          <Activity className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-blue-950">{metrics.total}</p>
          <p className="text-xs text-muted-foreground">Base consolidada do período filtrado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Tempo médio de resolução</CardTitle>
          <Clock3 className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-blue-950">
            {metrics.avgResolutionHours.toFixed(1)}h
          </p>
          <p className="text-xs text-muted-foreground">Indicador principal de SLA</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Bairro mais afetado</CardTitle>
          <MapPinned className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold text-blue-950">
            {topNeighborhood?.[0] ?? "Sem dados"}
          </p>
          <p className="text-xs text-muted-foreground">
            {topNeighborhood ? `${topNeighborhood[1]} ocorrências` : "Nenhuma ocorrência"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Resolução efetiva</CardTitle>
          <Workflow className="h-4 w-4 text-blue-700" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-blue-950">
            {metrics.total > 0
              ? `${(((metrics.byStatus.resolvido ?? 0) / metrics.total) * 100).toFixed(0)}%`
              : "0%"}
          </p>
          <p className="text-xs text-muted-foreground">% de protocolos concluídos</p>
        </CardContent>
      </Card>
    </div>
  );
}

