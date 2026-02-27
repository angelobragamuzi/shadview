"use client";

import { CategoryBadge } from "@/components/occurrences/category-badge";
import { ProtocolQuickViewDialog } from "@/components/occurrences/protocol-quick-view-dialog";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_LABELS,
  OCCURRENCE_CATEGORIES,
  OCCURRENCE_STATUSES,
  STATUS_LABELS,
} from "@/lib/constants";
import { calculatePriorityScore, formatDate } from "@/lib/occurrence-utils";
import {
  manageOccurrence,
} from "@/services/occurrence-service";
import type {
  ManageOccurrenceFormValues,
} from "@/lib/schemas/occurrence";
import { manageOccurrenceSchema } from "@/lib/schemas/occurrence";
import type {
  Institution,
  OccurrenceCategory,
  OccurrenceStatus,
  OccurrenceWithRelations,
  OperationalAgent,
  Team,
} from "@/types";
import {
  type ColumnDef,
  type FilterFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardPen,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function getResponsibleLabel(occurrence: OccurrenceWithRelations) {
  return (
    occurrence.assignment?.agent?.full_name ??
    occurrence.assignment?.team?.name ??
    occurrence.assignment?.institution?.name ??
    occurrence.assignee?.full_name ??
    "Não atribuído"
  );
}

const globalOccurrenceFilter: FilterFn<OccurrenceWithRelations> = (
  row,
  _columnId,
  filterValue,
) => {
  const query = String(filterValue ?? "").trim().toLowerCase();
  if (!query) {
    return true;
  }

  const searchableContent = [
    row.original.title,
    row.original.neighborhood ?? "",
    getResponsibleLabel(row.original),
    CATEGORY_LABELS[row.original.category],
    STATUS_LABELS[row.original.status],
  ]
    .join(" ")
    .toLowerCase();

  return searchableContent.includes(query);
};

export function OccurrenceManagementTable({
  occurrences,
  institutions,
  teams,
  operationalAgents,
  userId,
  openOccurrenceId,
  onCatalogRefresh,
  onRefresh,
}: {
  occurrences: OccurrenceWithRelations[];
  institutions: Institution[];
  teams: Team[];
  operationalAgents: OperationalAgent[];
  userId?: string | null;
  openOccurrenceId?: string | null;
  onCatalogRefresh: () => void;
  onRefresh: () => void;
}) {
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<OccurrenceWithRelations | null>(null);
  const [protocolPreviewOccurrence, setProtocolPreviewOccurrence] =
    useState<OccurrenceWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handledOpenOccurrenceIdRef = useRef<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "priority", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

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
    if (!selectedOccurrence) {
      return;
    }

    form.reset({
      status: selectedOccurrence.status,
      assignedTo: selectedOccurrence.assigned_to,
      institutionId: selectedOccurrence.assignment?.institution_id ?? null,
      teamId: selectedOccurrence.assignment?.team_id ?? null,
      operationalAgentId: selectedOccurrence.assignment?.agent_id ?? null,
      comment: "",
      isInternal: true,
    });
  }, [form, selectedOccurrence]);

  useEffect(() => {
    if (!openOccurrenceId) {
      return;
    }

    if (handledOpenOccurrenceIdRef.current === openOccurrenceId) {
      return;
    }

    const targetOccurrence = occurrences.find((occurrence) => occurrence.id === openOccurrenceId);
    if (!targetOccurrence) {
      return;
    }

    handledOpenOccurrenceIdRef.current = openOccurrenceId;
    setSelectedOccurrence(targetOccurrence);
    setIsDialogOpen(true);
  }, [openOccurrenceId, occurrences]);

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

  const handleOpen = useCallback((occurrence: OccurrenceWithRelations) => {
    setSelectedOccurrence(occurrence);
    setIsDialogOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<OccurrenceWithRelations>[]>(
    () => [
      {
        id: "priority",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Prioridade
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        accessorFn: (row) => calculatePriorityScore(row),
        cell: ({ getValue }) => (
          <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Título
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="max-w-[280px] truncate text-sm font-medium">
              {row.original.title}
            </p>
            <button
              type="button"
              onClick={() => setProtocolPreviewOccurrence(row.original)}
              className="inline-flex font-mono text-[11px] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
              title={row.original.id}
            >
              {row.original.id.slice(0, 10)}
            </button>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Categoria
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        sortingFn: (leftRow, rightRow) => {
          const leftCategory = leftRow.getValue<OccurrenceCategory>("category");
          const rightCategory = rightRow.getValue<OccurrenceCategory>("category");
          return CATEGORY_LABELS[leftCategory].localeCompare(
            CATEGORY_LABELS[rightCategory],
          );
        },
        filterFn: (row, id, value) => {
          if (!value) {
            return true;
          }
          return row.getValue(id) === value;
        },
        cell: ({ row }) => <CategoryBadge category={row.original.category} />,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        sortingFn: (leftRow, rightRow) => {
          const leftStatus = leftRow.getValue<OccurrenceStatus>("status");
          const rightStatus = rightRow.getValue<OccurrenceStatus>("status");
          return STATUS_LABELS[leftStatus].localeCompare(STATUS_LABELS[rightStatus]);
        },
        filterFn: (row, id, value) => {
          if (!value) {
            return true;
          }
          return row.getValue(id) === value;
        },
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "neighborhood",
        accessorFn: (row) => row.neighborhood ?? "Não informado",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bairro
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
      },
      {
        id: "responsible",
        accessorFn: (row) => getResponsibleLabel(row),
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Responsável
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="line-clamp-1">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Criado em
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button variant="outline" size="sm" onClick={() => handleOpen(row.original)}>
              <ClipboardPen className="mr-2 h-4 w-4" />
              Gerenciar
            </Button>
          </div>
        ),
      },
    ],
    [handleOpen],
  );

  const table = useReactTable({
    data: occurrences,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalOccurrenceFilter,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const categoryColumn = table.getColumn("category");
  const statusColumn = table.getColumn("status");
  const categoryFilterValue = String(categoryColumn?.getFilterValue() ?? "all");
  const statusFilterValue = String(statusColumn?.getFilterValue() ?? "all");

  const filteredRowsCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageStart = filteredRowsCount === 0 ? 0 : pageIndex * pageSize + 1;
  const pageEnd = Math.min((pageIndex + 1) * pageSize, filteredRowsCount);
  const totalPages = table.getPageCount();

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
      <div className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_180px_auto]">
          <Input
            value={globalFilter}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
              table.setPageIndex(0);
            }}
            placeholder="Buscar por título, bairro, categoria, status ou responsável"
          />

          <Select
            value={categoryFilterValue}
            onValueChange={(value) => {
              categoryColumn?.setFilterValue(value === "all" ? undefined : value);
              table.setPageIndex(0);
            }}
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
            value={statusFilterValue}
            onValueChange={(value) => {
              statusColumn?.setFilterValue(value === "all" ? undefined : value);
              table.setPageIndex(0);
            }}
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

          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Itens por página" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setGlobalFilter("");
              categoryColumn?.setFilterValue(undefined);
              statusColumn?.setFilterValue(undefined);
              table.resetSorting();
              table.setPageIndex(0);
            }}
          >
            Limpar filtros
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.id === "actions" ? "text-right" : undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhuma ocorrência encontrada para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {pageStart} a {pageEnd} de {filteredRowsCount} ocorrência
            {filteredRowsCount === 1 ? "" : "s"}
            {filteredRowsCount !== occurrences.length
              ? ` (total: ${occurrences.length})`
              : ""}
            .
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[120px] text-center text-sm text-muted-foreground">
              Página {totalPages === 0 ? 0 : pageIndex + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(Math.max(totalPages - 1, 0))}
              disabled={!table.getCanNextPage()}
              aria-label="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                        Não encontrou o cadastro? Faça o registro na página de cadastro
                        operacional.
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
                disabled={form.formState.isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ProtocolQuickViewDialog
        occurrence={protocolPreviewOccurrence}
        open={Boolean(protocolPreviewOccurrence)}
        onOpenChange={(open) => {
          if (!open) {
            setProtocolPreviewOccurrence(null);
          }
        }}
      />
    </>
  );
}
