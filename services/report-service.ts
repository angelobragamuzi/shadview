import { formatDate } from "@/lib/occurrence-utils";
import type { OccurrenceWithRelations } from "@/types";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export function exportOccurrencesCsv(occurrences: OccurrenceWithRelations[]) {
  const csvData = occurrences.map((occurrence) => ({
    protocolo: occurrence.id,
    título: occurrence.title,
    categoria: occurrence.category,
    status: occurrence.status,
    bairro: occurrence.neighborhood ?? "Não informado",
    criado_em: formatDate(occurrence.created_at),
    atualizado_em: formatDate(occurrence.updated_at),
    responsável: occurrence.assignee?.full_name ?? "Não atribuído",
  }));

  const csv = Papa.unparse(csvData, { delimiter: ";" });
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `shadboard-relatorio-${Date.now()}.csv`);
}

export function exportOccurrencesPdf(occurrences: OccurrenceWithRelations[]) {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.text("ShadBoard - Relatório de Demandas Urbanas", 14, 15);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${formatDate(new Date().toISOString())}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [
      [
        "Protocolo",
        "Categoria",
        "Status",
        "Bairro",
        "Criado em",
        "Atualizado em",
        "Responsável",
      ],
    ],
    body: occurrences.map((occurrence) => [
      occurrence.id.slice(0, 8),
      occurrence.category,
      occurrence.status,
      occurrence.neighborhood ?? "Não informado",
      formatDate(occurrence.created_at),
      formatDate(occurrence.updated_at),
      occurrence.assignee?.full_name ?? "Não atribuído",
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

  doc.save(`shadboard-relatorio-${Date.now()}.pdf`);
}

