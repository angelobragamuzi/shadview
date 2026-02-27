"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/occurrence-utils";
import { fetchDashboardOccurrences } from "@/services/occurrence-service";
import { exportOccurrencesCsv, exportOccurrencesPdf } from "@/services/report-service";
import type { OccurrenceWithRelations } from "@/types";
import { Download, FileSpreadsheet, FileText, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function DashboardReportsPage() {
  const [occurrences, setOccurrences] = useState<OccurrenceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-blue-950">Relatórios executivos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Exporte dados em CSV/PDF e acompanhe ranking de bairros mais afetados.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
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
            <Button className="bg-blue-800 hover:bg-blue-700" onClick={() => void loadData()}>
              <Download className="mr-2 h-4 w-4" />
              Atualizar período
            </Button>
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
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Relatório por período ({occurrences.length} ocorrências)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
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
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : occurrences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum registro no período selecionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  occurrences.slice(0, 20).map((occurrence) => (
                    <TableRow key={occurrence.id}>
                      <TableCell className="font-mono text-xs">
                        {occurrence.id.slice(0, 10)}
                      </TableCell>
                      <TableCell>{occurrence.category}</TableCell>
                      <TableCell>{occurrence.status}</TableCell>
                      <TableCell>{occurrence.neighborhood ?? "Não informado"}</TableCell>
                      <TableCell>{formatDate(occurrence.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-amber-500" />
              Ranking de bairros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {neighborhoodRanking.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados de bairros.</p>
            ) : (
              neighborhoodRanking.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
                >
                  <p className="text-sm font-medium">
                    {index + 1}. {item.name}
                  </p>
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    {item.total}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

