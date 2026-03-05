"use client";

import { MetricsCharts } from "@/components/dashboard/metrics-charts";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { buildDashboardMetrics, fetchDashboardOccurrences } from "@/services/occurrence-service";
import type { DashboardMetrics, OccurrenceWithRelations } from "@/types";
import { useEffect, useMemo, useState } from "react";

function emptyMetrics(): DashboardMetrics {
  return {
    total: 0,
    byCategory: {},
    byNeighborhood: {},
    byStatus: {},
    avgResolutionHours: 0,
    monthlyComparison: [],
  };
}

export default function DashboardHomePage() {
  const { profile } = useAuth();
  const [occurrences, setOccurrences] = useState<OccurrenceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDashboardOccurrences();
        setOccurrences(data);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const metrics = useMemo(
    () => (occurrences.length > 0 ? buildDashboardMetrics(occurrences) : emptyMetrics()),
    [occurrences],
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 sm:gap-4">
      <section className="shrink-0 rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
        <p className="text-xs uppercase tracking-[0.18em] text-primary">Dashboard</p>
        <h1 className="mt-1 text-xl text-foreground sm:text-2xl">Visão consolidada da cidade</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitoramento em tempo real para {profile?.role ?? "gestão"} com foco em SLA,
          eficiência operacional e priorização territorial.
        </p>
      </section>

      {loading ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.7fr_1fr]">
            <Skeleton className="h-[240px] w-full sm:h-[280px] lg:h-full" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
              <Skeleton className="h-[200px] w-full sm:h-[220px] lg:h-full" />
              <Skeleton className="h-[200px] w-full sm:h-[220px] lg:h-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <SummaryCards metrics={metrics} compact />
          <div className="min-h-0 flex-1">
            <MetricsCharts metrics={metrics} compact />
          </div>
        </div>
      )}
    </div>
  );
}
