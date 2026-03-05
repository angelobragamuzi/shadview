"use client";

import { OccurrenceManagementTable } from "@/components/dashboard/occurrence-management-table";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchDashboardOccurrences,
  fetchInstitutions,
  fetchOperationalAgents,
  fetchTeams,
} from "@/services/occurrence-service";
import type { Institution, OccurrenceWithRelations, OperationalAgent, Team } from "@/types";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardOccurrencesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [occurrences, setOccurrences] = useState<OccurrenceWithRelations[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [operationalAgents, setOperationalAgents] = useState<OperationalAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const openOccurrenceId = searchParams.get("occurrenceId");

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gestão de Ocorrências</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie em lista com classificação, filtros e paginação.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/operational">Cadastro operacional</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void loadData()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {loading || loadingCatalog ? (
        <LoadingState
          label={
            loading
              ? "Carregando ocorrências..."
              : "Carregando cadastros operacionais..."
          }
          className="min-h-[320px] rounded-xl border border-dashed border-border/70 bg-card/50"
        />
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
