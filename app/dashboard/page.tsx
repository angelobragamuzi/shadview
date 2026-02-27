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
    <div className="space-y-6">
      <section className="rounded-xl border border-blue-100 bg-white p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-blue-700">
          Dashboard executivo
        </p>
        <h1 className="mt-2 text-3xl text-blue-950">Visão consolidada da cidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitoramento em tempo real para {profile?.role ?? "gestão"} com foco em SLA,
          eficiência operacional e priorização territorial.
        </p>
      </section>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full" />
          ))}
        </div>
      ) : (
        <>
          <SummaryCards metrics={metrics} />
          <MetricsCharts metrics={metrics} />
        </>
      )}
    </div>
  );
}
