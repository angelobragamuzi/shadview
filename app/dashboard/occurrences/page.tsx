"use client";

import { OccurrenceManagementTable } from "@/components/dashboard/occurrence-management-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OCCURRENCE_CATEGORIES, OCCURRENCE_STATUSES, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { fetchAgents, fetchDashboardOccurrences } from "@/services/occurrence-service";
import type { OccurrenceWithRelations, Profile } from "@/types";
import dynamic from "next/dynamic";
import { Filter, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const PublicOccurrencesMap = dynamic(
  () =>
    import("@/components/maps/public-occurrences-map").then(
      (mod) => mod.PublicOccurrencesMap,
    ),
  { ssr: false },
);

export default function DashboardOccurrencesPage() {
  const { user, profile } = useAuth();
  const [occurrences, setOccurrences] = useState<OccurrenceWithRelations[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    neighborhood: "",
    from: "",
    to: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [occurrenceData, agentData] = await Promise.all([
        fetchDashboardOccurrences({
          category:
            filters.category === "all"
              ? undefined
              : (filters.category as OccurrenceWithRelations["category"]),
          status:
            filters.status === "all"
              ? undefined
              : (filters.status as OccurrenceWithRelations["status"]),
          neighborhood: filters.neighborhood || undefined,
          from: filters.from ? new Date(`${filters.from}T00:00:00`).toISOString() : undefined,
          to: filters.to ? new Date(`${filters.to}T23:59:59`).toISOString() : undefined,
        }),
        fetchAgents(),
      ]);
      setOccurrences(occurrenceData);
      setAgents(agentData);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-blue-950">Gestão de Ocorrências</CardTitle>
          <p className="text-sm text-muted-foreground">
            Filtros avançados, priorização por gravidade e operação de campo.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Select
              value={filters.category}
              onValueChange={(value) =>
                setFilters((previous) => ({ ...previous, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {OCCURRENCE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((previous) => ({ ...previous, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {OCCURRENCE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Bairro"
              value={filters.neighborhood}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  neighborhood: event.target.value,
                }))
              }
            />

            <Input
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters((previous) => ({ ...previous, from: event.target.value }))
              }
            />

            <Input
              type="date"
              value={filters.to}
              onChange={(event) =>
                setFilters((previous) => ({ ...previous, to: event.target.value }))
              }
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "list" | "map")}
            >
              <TabsList>
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="map">Mapa</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => void loadData()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Button
                size="sm"
                className="bg-blue-800 hover:bg-blue-700"
                onClick={() => void loadData()}
              >
                <Filter className="mr-2 h-4 w-4" />
                Aplicar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando ocorrências...</p>
      ) : viewMode === "map" ? (
        <Card>
          <CardHeader>
            <CardTitle>Mapa das ocorrências filtradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[560px] overflow-hidden rounded-xl border">
              <PublicOccurrencesMap occurrences={occurrences} className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <OccurrenceManagementTable
          occurrences={occurrences}
          agents={agents}
          userId={user?.id}
          userRole={profile?.role}
          onRefresh={() => void loadData()}
        />
      )}
    </div>
  );
}

