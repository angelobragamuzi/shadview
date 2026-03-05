"use client";

import { OccurrenceManageDialog } from "@/components/dashboard/occurrence-manage-dialog";
import type {
  OccurrenceBaseMapType,
  OccurrenceMapMode,
} from "@/components/maps/heatmap-occurrences-map";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { getNeighborhoodBoundarySeedPoints } from "@/lib/neighborhood-boundaries";
import {
  fetchDashboardOccurrences,
  fetchInstitutions,
  fetchOperationalAgents,
  fetchTeams,
} from "@/services/occurrence-service";
import type {
  Institution,
  OccurrenceStatus,
  OccurrenceWithRelations,
  OperationalAgent,
  Team,
} from "@/types";
import { Flame, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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

function isOccurrenceBaseMapType(value: string): value is OccurrenceBaseMapType {
  return value === "roadmap" || value === "satellite";
}

const ACTIVE_OCCURRENCE_STATUSES = new Set<OccurrenceStatus>([
  "aberto",
  "em_analise",
  "em_execucao",
]);

function normalizeNeighborhood(value: string | null | undefined) {
  return (
    value
      ?.normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLocaleLowerCase("pt-BR") ?? ""
  );
}

export default function DashboardMapPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [occurrences, setOccurrences] = useState<OccurrenceWithRelations[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [operationalAgents, setOperationalAgents] = useState<OperationalAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<OccurrenceMapMode>("markers");
  const [mapType, setMapType] = useState<OccurrenceBaseMapType>("roadmap");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("all");
  const [manageOccurrenceTarget, setManageOccurrenceTarget] =
    useState<OccurrenceWithRelations | null>(null);

  const activeNeighborhoods = useMemo(() => {
    const bucket = new Map<string, { label: string; count: number }>();

    for (const occurrence of occurrences) {
      if (!ACTIVE_OCCURRENCE_STATUSES.has(occurrence.status)) {
        continue;
      }

      const label = occurrence.neighborhood?.trim();
      if (!label) {
        continue;
      }

      const key = normalizeNeighborhood(label);
      const current = bucket.get(key);
      if (current) {
        current.count += 1;
      } else {
        bucket.set(key, { label, count: 1 });
      }
    }

    return Array.from(bucket.entries())
      .map(([value, data]) => ({ value, label: data.label, count: data.count }))
      .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
  }, [occurrences]);

  const selectedNeighborhoodLabel =
    selectedNeighborhood === "all"
      ? null
      : activeNeighborhoods.find((option) => option.value === selectedNeighborhood)?.label ??
        null;

  const filteredOccurrences = useMemo(() => {
    if (selectedNeighborhood === "all") {
      return occurrences;
    }

    return occurrences.filter(
      (occurrence) =>
        normalizeNeighborhood(occurrence.neighborhood) === selectedNeighborhood &&
        ACTIVE_OCCURRENCE_STATUSES.has(occurrence.status),
    );
  }, [occurrences, selectedNeighborhood]);

  const selectedNeighborhoodBoundaryPoints = useMemo(() => {
    if (selectedNeighborhood === "all") {
      return [];
    }

    const fromOccurrences = occurrences
      .filter(
        (occurrence) => normalizeNeighborhood(occurrence.neighborhood) === selectedNeighborhood,
      )
      .map((occurrence) => ({
        lat: occurrence.latitude,
        lng: occurrence.longitude,
      }));

    const fromBoundarySeeds = getNeighborhoodBoundarySeedPoints(selectedNeighborhoodLabel);

    return Array.from(
      new Map(
        [...fromOccurrences, ...fromBoundarySeeds].map((point) => [
          `${point.lat.toFixed(6)}-${point.lng.toFixed(6)}`,
          point,
        ]),
      ).values(),
    );
  }, [occurrences, selectedNeighborhood, selectedNeighborhoodLabel]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardOccurrences();
      setOccurrences(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      const [institutionData, teamData, operationalAgentData] = await Promise.all([
        fetchInstitutions(),
        fetchTeams(),
        fetchOperationalAgents(),
      ]);
      setInstitutions(institutionData);
      setTeams(teamData);
      setOperationalAgents(operationalAgentData);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os cadastros operacionais.";
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (pathname === "/dashboard/map") {
      setMode("markers");
    }
  }, [pathname]);

  useEffect(() => {
    if (selectedNeighborhood === "all") {
      return;
    }

    if (!activeNeighborhoods.some((option) => option.value === selectedNeighborhood)) {
      setSelectedNeighborhood("all");
    }
  }, [activeNeighborhoods, selectedNeighborhood]);

  return (
    <div className="flex h-[calc(100vh-9.5rem)] min-h-[560px] flex-col gap-3">
      <section className="rounded-lg border border-border bg-card px-4 py-3">
        <h1 className="text-base font-semibold text-foreground">Mapa de ocorrências</h1>
        <p className="text-xs text-muted-foreground">
          Use calor para densidade e ponteiros para abrir detalhes. Filtre por bairro para
          destacar o contorno e visualizar somente as ocorrências da área selecionada.
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <div className="grid w-full min-w-[260px] gap-2 sm:w-auto sm:grid-cols-[180px_320px]">
          <Select
            value={mapType}
            onValueChange={(value) => {
              if (isOccurrenceBaseMapType(value)) {
                setMapType(value);
              }
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tipo de mapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roadmap">Mapa padrão</SelectItem>
              <SelectItem value="satellite">Satélite</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedNeighborhood}
            onValueChange={setSelectedNeighborhood}
            disabled={activeNeighborhoods.length === 0}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filtrar por bairro (ocorrências ativas)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os bairros</SelectItem>
              {activeNeighborhoods.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <div className="h-full overflow-hidden rounded-lg border">
            <HeatmapOccurrencesMap
              occurrences={filteredOccurrences}
              mode={mode}
              mapType={mapType}
              highlightedNeighborhood={selectedNeighborhoodLabel}
              highlightedNeighborhoodPoints={selectedNeighborhoodBoundaryPoints}
              onManageOccurrence={setManageOccurrenceTarget}
              className="h-full w-full"
            />
          </div>
        )}
      </div>

      <OccurrenceManageDialog
        occurrence={manageOccurrenceTarget}
        open={Boolean(manageOccurrenceTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setManageOccurrenceTarget(null);
          }
        }}
        institutions={institutions}
        teams={teams}
        operationalAgents={operationalAgents}
        userId={user?.id}
        onCatalogRefresh={() => void loadCatalog()}
        onSaved={() => void loadData()}
      />
    </div>
  );
}
