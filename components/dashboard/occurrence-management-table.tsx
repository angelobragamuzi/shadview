"use client";

import { CategoryBadge } from "@/components/occurrences/category-badge";
import { StatusBadge } from "@/components/occurrences/status-badge";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { OCCURRENCE_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { calculatePriorityScore, formatDate } from "@/lib/occurrence-utils";
import {
  manageOccurrence,
} from "@/services/occurrence-service";
import { canAssignOccurrences } from "@/services/role-service";
import type {
  ManageOccurrenceFormValues,
} from "@/lib/schemas/occurrence";
import { manageOccurrenceSchema } from "@/lib/schemas/occurrence";
import type { OccurrenceWithRelations, Profile, UserRole } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardPen, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function OccurrenceManagementTable({
  occurrences,
  agents,
  userId,
  userRole,
  onRefresh,
}: {
  occurrences: OccurrenceWithRelations[];
  agents: Profile[];
  userId?: string | null;
  userRole?: UserRole | null;
  onRefresh: () => void;
}) {
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<OccurrenceWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sortedOccurrences = useMemo(
    () =>
      [...occurrences].sort(
        (left, right) =>
          calculatePriorityScore(right) - calculatePriorityScore(left),
      ),
    [occurrences],
  );

  const form = useForm<ManageOccurrenceFormValues>({
    resolver: zodResolver(manageOccurrenceSchema),
    defaultValues: {
      status: "em_analise",
      assignedTo: null,
      comment: "",
      isInternal: true,
    },
  });

  useEffect(() => {
    if (!selectedOccurrence) {
      return;
    }

    form.reset({
      status: selectedOccurrence.status,
      assignedTo: selectedOccurrence.assigned_to,
      comment: "",
      isInternal: true,
    });
  }, [form, selectedOccurrence]);

  const handleOpen = (occurrence: OccurrenceWithRelations) => {
    setSelectedOccurrence(occurrence);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: ManageOccurrenceFormValues) => {
    if (!selectedOccurrence) {
      return;
    }

    try {
      await manageOccurrence(selectedOccurrence.id, values, userId);
      toast.success("Ocorrência atualizada.");
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao atualizar ocorrência.";
      toast.error(message);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prioridade</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOccurrences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Nenhuma ocorrência encontrada para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              sortedOccurrences.map((occurrence) => (
                <TableRow key={occurrence.id}>
                  <TableCell>
                    <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                      {calculatePriorityScore(occurrence)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[280px] truncate text-sm font-medium">
                      {occurrence.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={occurrence.category} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={occurrence.status} />
                  </TableCell>
                  <TableCell>{occurrence.neighborhood ?? "Não informado"}</TableCell>
                  <TableCell>
                    {occurrence.assignee?.full_name ?? "Não atribuído"}
                  </TableCell>
                  <TableCell>{formatDate(occurrence.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpen(occurrence)}
                    >
                      <ClipboardPen className="mr-2 h-4 w-4" />
                      Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Atualizar ocorrência</DialogTitle>
            <DialogDescription>
              Ajuste status, atribua agente e registre observações da execução.
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

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agente responsável</FormLabel>
                    <Select
                      value={field.value ?? "unassigned"}
                      onValueChange={(value) =>
                        field.onChange(value === "unassigned" ? null : value)
                      }
                      disabled={!canAssignOccurrences(userRole)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar agente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Não atribuído</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.full_name ?? "Agente"}
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
                className="w-full bg-blue-800 hover:bg-blue-700"
                disabled={form.formState.isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

