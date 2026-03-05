import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/occurrence-utils";
import type { OccurrenceCategory, OccurrenceWithRelations } from "@/types";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export interface ReportExportContext {
  from?: string;
  to?: string;
  categories?: OccurrenceCategory[];
}

function buildReportFileSuffix(context: ReportExportContext) {
  const suffix: string[] = [];

  if (context.categories && context.categories.length > 0) {
    suffix.push(`topicos-${context.categories.join("-")}`);
  }

  if (context.from || context.to) {
    suffix.push(`periodo-${context.from ?? "inicio"}-${context.to ?? "fim"}`);
  }

  return suffix.length > 0 ? `-${suffix.join("_")}` : "";
}

function formatReportFilters(context: ReportExportContext) {
  const periodLabel =
    context.from || context.to
      ? `Periodo: ${context.from ?? "inicio"} ate ${context.to ?? "fim"}`
      : "Periodo: completo";

  const categoriesLabel =
    context.categories && context.categories.length > 0
      ? `Topicos: ${context.categories
          .map((category) => CATEGORY_LABELS[category])
          .join(", ")}`
      : "Topicos: todos";

  return `${periodLabel} | ${categoriesLabel}`;
}

export function exportOccurrencesCsv(
  occurrences: OccurrenceWithRelations[],
  context: ReportExportContext = {},
) {
  const csvData = occurrences.map((occurrence) => ({
    protocolo: occurrence.id,
    titulo: occurrence.title,
    categoria: CATEGORY_LABELS[occurrence.category],
    status: STATUS_LABELS[occurrence.status],
    bairro: occurrence.neighborhood ?? "Nao informado",
    criado_em: formatDate(occurrence.created_at),
    atualizado_em: formatDate(occurrence.updated_at),
    responsavel: occurrence.assignee?.full_name ?? "Nao atribuido",
  }));

  const csv = Papa.unparse(csvData, { delimiter: ";" });
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `shadboard-relatorio${buildReportFileSuffix(context)}-${Date.now()}.csv`);
}

export function exportOccurrencesPdf(
  occurrences: OccurrenceWithRelations[],
  context: ReportExportContext = {},
) {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.text("ShadBoard - Relatorio de Demandas Urbanas", 14, 15);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${formatDate(new Date().toISOString())}`, 14, 22);
  doc.text(formatReportFilters(context), 14, 28);

  autoTable(doc, {
    startY: 34,
    head: [
      [
        "Protocolo",
        "Categoria",
        "Status",
        "Bairro",
        "Criado em",
        "Atualizado em",
        "Responsavel",
      ],
    ],
    body: occurrences.map((occurrence) => [
      occurrence.id.slice(0, 8),
      CATEGORY_LABELS[occurrence.category],
      STATUS_LABELS[occurrence.status],
      occurrence.neighborhood ?? "Nao informado",
      formatDate(occurrence.created_at),
      formatDate(occurrence.updated_at),
      occurrence.assignee?.full_name ?? "Nao atribuido",
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [15, 36, 76],
      textColor: [255, 255, 255],
    },
  });

  doc.save(`shadboard-relatorio${buildReportFileSuffix(context)}-${Date.now()}.pdf`);
}
