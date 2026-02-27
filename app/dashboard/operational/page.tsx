"use client";

import { OperationalRegistry } from "@/components/dashboard/operational-registry";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchInstitutions,
  fetchOperationalAgents,
  fetchTeams,
} from "@/services/occurrence-service";
import type { Institution, OperationalAgent, Team } from "@/types";
import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardOperationalPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [operationalAgents, setOperationalAgents] = useState<OperationalAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCatalog = useCallback(async () => {
    try {
      setLoading(true);
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
          : "Não foi possível carregar o cadastro operacional.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cadastro operacional</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre instituições, equipes e agentes para vincular às ocorrências.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadCatalog()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar cadastros
        </Button>
      </div>

      {loading ? (
        <LoadingState
          label="Carregando cadastro operacional..."
          className="min-h-[280px] rounded-xl border border-dashed border-border/70 bg-card/50"
        />
      ) : (
        <OperationalRegistry
          institutions={institutions}
          teams={teams}
          agents={operationalAgents}
          actorId={user?.id}
          onRefresh={() => void loadCatalog()}
        />
      )}
    </div>
  );
}
