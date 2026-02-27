"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createInstitution,
  createTeam,
} from "@/services/occurrence-service";
import type { Institution, OperationalAgent, Team } from "@/types";
import { Building2, Plus, Users, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function OperationalRegistry({
  institutions,
  teams,
  agents,
  actorId,
  onRefresh,
}: {
  institutions: Institution[];
  teams: Team[];
  agents: OperationalAgent[];
  actorId?: string | null;
  onRefresh: () => void;
}) {
  const [savingInstitution, setSavingInstitution] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingAgent, setSavingAgent] = useState(false);

  const [institutionName, setInstitutionName] = useState("");
  const [institutionAcronym, setInstitutionAcronym] = useState("");

  const [teamInstitutionId, setTeamInstitutionId] = useState<string>("none");
  const [teamName, setTeamName] = useState("");

  const [agentFullName, setAgentFullName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [agentInstitutionId, setAgentInstitutionId] = useState<string>("none");
  const [agentTeamId, setAgentTeamId] = useState<string>("none");

  const teamOptions = useMemo(
    () =>
      teams.filter(
        (team) =>
          agentInstitutionId === "none" || team.institution_id === agentInstitutionId,
      ),
    [agentInstitutionId, teams],
  );

  const handleCreateInstitution = async () => {
    if (institutionName.trim().length < 3) {
      toast.error("Informe um nome válido para a instituição.");
      return;
    }

    try {
      setSavingInstitution(true);
      await createInstitution(
        {
          name: institutionName,
          acronym: institutionAcronym,
        },
        actorId,
      );
      toast.success("Instituição cadastrada com sucesso.");
      setInstitutionName("");
      setInstitutionAcronym("");
      onRefresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível cadastrar a instituição.";
      toast.error(message);
    } finally {
      setSavingInstitution(false);
    }
  };

  const handleCreateTeam = async () => {
    if (teamInstitutionId === "none") {
      toast.error("Selecione a instituição da equipe.");
      return;
    }
    if (teamName.trim().length < 3) {
      toast.error("Informe um nome válido para a equipe.");
      return;
    }

    try {
      setSavingTeam(true);
      await createTeam(
        {
          institutionId: teamInstitutionId,
          name: teamName,
        },
        actorId,
      );
      toast.success("Equipe cadastrada com sucesso.");
      setTeamName("");
      onRefresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível cadastrar a equipe.";
      toast.error(message);
    } finally {
      setSavingTeam(false);
    }
  };

  const handleCreateAgent = async () => {
    if (agentFullName.trim().length < 3) {
      toast.error("Informe um nome válido para o agente.");
      return;
    }
    if (!agentEmail.trim()) {
      toast.error("Informe o e-mail do agente.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentEmail.trim())) {
      toast.error("Informe um e-mail válido para o agente.");
      return;
    }
    if (!agentPhone.trim()) {
      toast.error("Informe o telefone do agente.");
      return;
    }
    if (agentPhone.replace(/\D/g, "").length < 8) {
      toast.error("Informe um telefone válido para o agente.");
      return;
    }

    try {
      setSavingAgent(true);
      const response = await fetch("/api/operational-agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: agentFullName,
          email: agentEmail,
          phone: agentPhone,
          institutionId: agentInstitutionId === "none" ? null : agentInstitutionId,
          teamId: agentTeamId === "none" ? null : agentTeamId,
        }),
      });

      const payload = (await response.json()) as
        | {
            error?: string;
            emailSent?: boolean;
            warning?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Não foi possível cadastrar o agente.");
      }

      if (payload?.emailSent) {
        toast.success("Agente cadastrado e e-mail de acesso enviado com sucesso.");
      } else {
        toast.success("Agente cadastrado com sucesso.");
      }
      if (payload?.warning) {
        toast.warning(payload.warning);
      }

      setAgentFullName("");
      setAgentEmail("");
      setAgentPhone("");
      setAgentInstitutionId("none");
      setAgentTeamId("none");
      onRefresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível cadastrar o agente.";
      toast.error(message);
    } finally {
      setSavingAgent(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-card/60 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Instituições
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {institutions.length}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card/60 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              Equipes
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {teams.length}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card/60 px-4 py-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <Wrench className="h-3.5 w-3.5 text-primary" />
              Agentes
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {agents.length}
            </p>
          </div>
        </div>

        <Tabs defaultValue="institution" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="institution">Instituição</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="agent">Agente</TabsTrigger>
          </TabsList>

          <TabsContent value="institution">
            <div className="space-y-3 rounded-lg border border-border/70 bg-card/60 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                Nova instituição
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institution-name">Nome</Label>
                  <Input
                    id="institution-name"
                    placeholder="Ex.: Secretaria de Obras"
                    value={institutionName}
                    onChange={(event) => setInstitutionName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution-acronym">Sigla (opcional)</Label>
                  <Input
                    id="institution-acronym"
                    placeholder="Ex.: SOI"
                    value={institutionAcronym}
                    onChange={(event) => setInstitutionAcronym(event.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                className="w-full md:w-auto"
                disabled={savingInstitution}
                onClick={() => void handleCreateInstitution()}
              >
                <Plus className="mr-2 h-4 w-4" />
                {savingInstitution ? "Salvando..." : "Criar instituição"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-3 rounded-lg border border-border/70 bg-card/60 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                Nova equipe
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Instituição</Label>
                  <Select value={teamInstitutionId} onValueChange={setTeamInstitutionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar instituição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Selecionar instituição</SelectItem>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-name">Nome da equipe</Label>
                  <Input
                    id="team-name"
                    placeholder="Ex.: Equipe Centro"
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                className="w-full md:w-auto"
                disabled={savingTeam}
                onClick={() => void handleCreateTeam()}
              >
                <Plus className="mr-2 h-4 w-4" />
                {savingTeam ? "Salvando..." : "Criar equipe"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="agent">
            <div className="space-y-3 rounded-lg border border-border/70 bg-card/60 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Wrench className="h-4 w-4 text-primary" />
                Novo agente operacional
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Nome</Label>
                  <Input
                    id="agent-name"
                    placeholder="Ex.: Carlos Almeida"
                    value={agentFullName}
                    onChange={(event) => setAgentFullName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-email">E-mail</Label>
                  <Input
                    id="agent-email"
                    type="email"
                    placeholder="agente@instituicao.gov.br"
                    value={agentEmail}
                    required
                    onChange={(event) => setAgentEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-phone">Telefone</Label>
                  <Input
                    id="agent-phone"
                    placeholder="(33) 99999-9999"
                    value={agentPhone}
                    required
                    onChange={(event) => setAgentPhone(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instituição (opcional)</Label>
                  <Select
                    value={agentInstitutionId}
                    onValueChange={(value) => {
                      setAgentInstitutionId(value);
                      setAgentTeamId("none");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem instituição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem instituição</SelectItem>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Equipe (opcional)</Label>
                  <Select value={agentTeamId} onValueChange={setAgentTeamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sem equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem equipe</SelectItem>
                      {teamOptions.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                className="w-full md:w-auto"
                disabled={savingAgent}
                onClick={() => void handleCreateAgent()}
              >
                <Plus className="mr-2 h-4 w-4" />
                {savingAgent ? "Salvando..." : "Criar agente"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
