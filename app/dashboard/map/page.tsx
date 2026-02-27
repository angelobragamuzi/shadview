"use client";

import type { OccurrenceMapMode } from "@/components/maps/heatmap-occurrences-map";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchDashboardOccurrences } from "@/services/occurrence-service";
import type { OccurrenceWithRelations } from "@/types";
import { Flame, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const HeatmapOccurrencesMap = dynamic(
  () =>
    import("@/components/maps/heatmap-occurrences-map").then(
      (mod) => mod.HeatmapOccurrencesMap,
    ),
  { ssr: false },
);

function isOccurrenceMapMode(value: string): value is OccurrenceMapMode {
  return value === "heatmap" || value === "markers";
}

export default function DashboardMapPage() {
  const pathname = usePathname();
  const [occurrences, setOccurrences] = useState<OccurrenceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<OccurrenceMapMode>("markers");

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

  useEffect(() => {
    if (pathname === "/dashboard/map") {
      setMode("markers");
    }
  }, [pathname]);

  return (
    <div className="flex h-[calc(100vh-9.5rem)] min-h-[560px] flex-col gap-3">
      <section className="rounded-lg border border-blue-100 bg-white px-4 py-3">
        <h1 className="text-base font-semibold text-blue-950">Mapa de ocorrências</h1>
        <p className="text-xs text-muted-foreground">
          Use calor para densidade e ponteiros para abrir detalhes no canto superior direito.
        </p>
      </section>

      <Tabs
        value={mode}
        onValueChange={(value) => {
          if (isOccurrenceMapMode(value)) {
            setMode(value);
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="heatmap" className="min-w-[120px]">
            <Flame className="mr-2 h-4 w-4" />
            Calor
          </TabsTrigger>
          <TabsTrigger value="markers" className="min-w-[120px]">
            <MapPin className="mr-2 h-4 w-4" />
            Ponteiros
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="min-h-0 flex-1">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <div className="h-full overflow-hidden rounded-lg border">
            <HeatmapOccurrencesMap
              occurrences={occurrences}
              mode={mode}
              className="h-full w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
