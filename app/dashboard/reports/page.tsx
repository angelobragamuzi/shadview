"use client";

import { Button } from "@/components/ui/button";
import { ProtocolQuickViewDialog } from "@/components/occurrences/protocol-quick-view-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/occurrence-utils";
import { fetchDashboardOccurrences } from "@/services/occurrence-service";
import { exportOccurrencesCsv, exportOccurrencesPdf } from "@/services/report-service";
import type { OccurrenceWithRelations } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const REPORT_PAGE_SIZE = 8;

export default function DashboardReportsPage() {
  const [occurrences, setOccurrences] = useState<OccurrenceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"table" | "ranking">("table");
  const [pageIndex, setPageIndex] = useState(0);
  const [protocolPreviewOccurrence, setProtocolPreviewOccurrence] =
    useState<OccurrenceWithRelations | null>(null);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardOccurrences({
        from: filters.from ? new Date(`${filters.from}T00:00:00`).toISOString() : undefined,
        to: filters.to ? new Date(`${filters.to}T23:59:59`).toISOString() : undefined,
      });
      setOccurrences(data);
      setPageIndex(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const neighborhoodRanking = useMemo(() => {
    const bucket: Record<string, number> = {};
    for (const occurrence of occurrences) {
      const neighborhood = occurrence.neighborhood ?? "Não informado";
      bucket[neighborhood] = (bucket[neighborhood] ?? 0) + 1;
    }
    return Object.entries(bucket)
      .map(([name, total]) => ({ name, total }))
      .sort((left, right) => right.total - left.total);
  }, [occurrences]);

  const totalPages = Math.max(1, Math.ceil(occurrences.length / REPORT_PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const start = safePageIndex * REPORT_PAGE_SIZE;
  const end = start + REPORT_PAGE_SIZE;
  const pageRows = occurrences.slice(start, end);
  const bestNeighborhood = neighborhoodRanking[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Relatórios executivos</h1>
          <p className="text-sm text-muted-foreground">
            Período, exportação e leitura rápida por tabela ou ranking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => exportOccurrencesCsv(occurrences)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => exportOccurrencesPdf(occurrences)}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
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
            <Button onClick={() => void loadData()}>
              <Download className="mr-2 h-4 w-4" />
              Atualizar período
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-card/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Ocorrências no período
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground">{occurrences.length}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Bairros no relatório
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground">{neighborhoodRanking.length}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/70 px-4 py-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            Mais afetado
          </p>
          <p className="mt-1 line-clamp-1 text-xl font-semibold text-foreground">
            {bestNeighborhood ? bestNeighborhood.name : "Sem dados"}
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "table" | "ranking")}
        className="space-y-3"
      >
        <TabsList className="grid h-auto w-full max-w-[280px] grid-cols-2">
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Relatório por período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        <LoadingState label="Carregando relatório..." className="min-h-[140px]" />
                      </TableCell>
                    </TableRow>
                  ) : occurrences.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum registro no período selecionado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageRows.map((occurrence) => (
                      <TableRow key={occurrence.id}>
                        <TableCell className="font-mono text-xs">
                          <button
                            type="button"
                            onClick={() => setProtocolPreviewOccurrence(occurrence)}
                            className="underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                            title={occurrence.id}
                          >
                            {occurrence.id.slice(0, 10)}
                          </button>
                        </TableCell>
                        <TableCell>{CATEGORY_LABELS[occurrence.category]}</TableCell>
                        <TableCell>{STATUS_LABELS[occurrence.status]}</TableCell>
                        <TableCell>{occurrence.neighborhood ?? "Não informado"}</TableCell>
                        <TableCell>{formatDate(occurrence.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {occurrences.length === 0 ? 0 : start + 1} a{" "}
                  {Math.min(end, occurrences.length)} de {occurrences.length}.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPageIndex((previous) => Math.max(0, previous - 1))}
                    disabled={safePageIndex === 0}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[90px] text-center text-sm text-muted-foreground">
                    Página {totalPages === 0 ? 0 : safePageIndex + 1} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setPageIndex((previous) => Math.min(totalPages - 1, previous + 1))
                    }
                    disabled={safePageIndex >= totalPages - 1}
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-amber-500 dark:text-amber-400" />
                Ranking de bairros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {neighborhoodRanking.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados de bairros.</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {neighborhoodRanking.slice(0, 12).map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 px-3 py-2"
                    >
                      <p className="line-clamp-1 text-sm font-medium">
                        {index + 1}. {item.name}
                      </p>
                      <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        {item.total}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProtocolQuickViewDialog
        occurrence={protocolPreviewOccurrence}
        open={Boolean(protocolPreviewOccurrence)}
        onOpenChange={(open) => {
          if (!open) {
            setProtocolPreviewOccurrence(null);
          }
        }}
      />
    </div>
  );
}
