"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OCCURRENCE_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { manageOccurrenceSchema, type ManageOccurrenceFormValues } from "@/lib/schemas/occurrence";
import { manageOccurrence } from "@/services/occurrence-service";
import type { Institution, OccurrenceWithRelations, OperationalAgent, Team } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function OccurrenceManageDialog({
  occurrence,
  open,
  onOpenChange,
  institutions,
  teams,
  operationalAgents,
  userId,
  onCatalogRefresh,
  onSaved,
}: {
  occurrence: OccurrenceWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutions: Institution[];
  teams: Team[];
  operationalAgents: OperationalAgent[];
  userId?: string | null;
  onCatalogRefresh: () => void;
  onSaved: () => void;
}) {
  const form = useForm<ManageOccurrenceFormValues>({
    resolver: zodResolver(manageOccurrenceSchema),
    defaultValues: {
      status: "em_analise",
      assignedTo: null,
      institutionId: null,
      teamId: null,
      operationalAgentId: null,
      comment: "",
      isInternal: true,
    },
  });

  useEffect(() => {
    if (!occurrence) {
      return;
    }

    form.reset({
      status: occurrence.status,
      assignedTo: occurrence.assigned_to,
      institutionId: occurrence.assignment?.institution_id ?? null,
      teamId: occurrence.assignment?.team_id ?? null,
      operationalAgentId: occurrence.assignment?.agent_id ?? null,
      comment: "",
      isInternal: true,
    });
  }, [form, occurrence]);

  const selectedInstitutionId = form.watch("institutionId");
  const selectedTeamId = form.watch("teamId");

  const filteredTeams = useMemo(
    () =>
      teams.filter(
        (team) =>
          !selectedInstitutionId || team.institution_id === selectedInstitutionId,
      ),
    [selectedInstitutionId, teams],
  );

  const filteredOperationalAgents = useMemo(
    () =>
      operationalAgents.filter((agent) => {
        const byInstitution =
          !selectedInstitutionId || agent.institution_id === selectedInstitutionId;
        const byTeam = !selectedTeamId || agent.team_id === selectedTeamId;
        return byInstitution && byTeam;
      }),
    [operationalAgents, selectedInstitutionId, selectedTeamId],
  );

  const handleSubmit = async (values: ManageOccurrenceFormValues) => {
    if (!occurrence) {
      return;
    }

    try {
      await manageOccurrence(occurrence.id, values, userId);
      toast.success("Ocorrência atualizada.");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao atualizar ocorrência.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atualizar ocorrência</DialogTitle>
          <DialogDescription>
            Ajuste status, vincule instituição/equipe/agente operacional e registre observações da execução.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as ManageOccurrenceFormValues["status"])
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {OCCURRENCE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 rounded-md border border-border/70 bg-muted/20 p-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name="institutionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instituição</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(value) => {
                        const nextInstitutionId = value === "none" ? null : value;
                        field.onChange(nextInstitutionId);
                        form.setValue("teamId", null);
                        form.setValue("operationalAgentId", null);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar instituição" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem instituição</SelectItem>
                        {institutions.map((institution) => (
                          <SelectItem key={institution.id} value={institution.id}>
                            {institution.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipe</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(value) => {
                        const nextTeamId = value === "none" ? null : value;
                        field.onChange(nextTeamId);
                        form.setValue("operationalAgentId", null);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar equipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem equipe</SelectItem>
                        {filteredTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operationalAgentId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Agente operacional</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar agente operacional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem agente operacional</SelectItem>
                        {filteredOperationalAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Não encontrou o cadastro? Faça o registro na página de cadastro operacional.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link href="/dashboard/operational">Ir para cadastro operacional</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCatalogRefresh}
                      >
                        Atualizar cadastros
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva ação de campo, bloqueios ou encaminhamento."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isInternal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer">Observação interna</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Logs internos não aparecem no portal público.
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || !occurrence}
            >
              <Save className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
