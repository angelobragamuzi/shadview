"use client";

import { OccurrenceManagementTable } from "@/components/dashboard/occurrence-management-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { extractProtocolId } from "@/lib/protocol";
import {
  fetchDashboardOccurrences,
  fetchInstitutions,
  fetchOperationalAgents,
  fetchTeams,
} from "@/services/occurrence-service";
import type { Institution, OccurrenceWithRelations, OperationalAgent, Team } from "@/types";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const PublicOccurrencesMap = dynamic(
  () =>
    import("@/components/maps/public-occurrences-map").then(
      (mod) => mod.PublicOccurrencesMap,
    ),
  { ssr: false },
);

export default function DashboardOccurrencesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [occurrences, setOccurrences] = useState<OccurrenceWithRelations[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [operationalAgents, setOperationalAgents] = useState<OperationalAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [protocolQuery, setProtocolQuery] = useState("");
  const openOccurrenceId = searchParams.get("occurrenceId");

  const handleOpenProtocol = () => {
    const protocolId = extractProtocolId(protocolQuery.trim());
    if (!protocolId) {
      toast.error("Informe um protocolo válido ou cole o link completo.");
      return;
    }

    router.push(`/occurrence/${protocolId}`);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const occurrenceData = await fetchDashboardOccurrences();
      setOccurrences(occurrenceData);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      setLoadingCatalog(true);
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
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-foreground">Gestão de Ocorrências</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualize no mapa ou gerencie em lista com classificação, filtros e paginação.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <Input
              value={protocolQuery}
              onChange={(event) => setProtocolQuery(event.target.value)}
              placeholder="Visualização rápida: cole o protocolo ou link de acompanhamento"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleOpenProtocol();
                }
              }}
            />
            <Button onClick={handleOpenProtocol}>Abrir protocolo</Button>
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
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/operational">Cadastro operacional</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => void loadData()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading || (viewMode === "list" && loadingCatalog) ? (
        <LoadingState
          label={
            loading
              ? "Carregando ocorrências..."
              : "Carregando cadastros operacionais..."
          }
          className="min-h-[320px] rounded-xl border border-dashed border-border/70 bg-card/50"
        />
      ) : viewMode === "map" ? (
        <Card>
          <CardHeader>
            <CardTitle>Mapa de ocorrências</CardTitle>
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
          institutions={institutions}
          teams={teams}
          operationalAgents={operationalAgents}
          userId={user?.id}
          openOccurrenceId={openOccurrenceId}
          onCatalogRefresh={() => void loadCatalog()}
          onRefresh={() => void loadData()}
        />
      )}
    </div>
  );
}
