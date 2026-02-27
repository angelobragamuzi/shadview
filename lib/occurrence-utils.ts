import {
  CATEGORY_SEVERITY_WEIGHT,
  CATEGORY_SLA_HOURS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { Occurrence, OccurrenceCategory } from "@/types";
import { format, formatDistanceToNowStrict } from "date-fns";

export function calculateSlaDeadline(
  category: OccurrenceCategory,
  startDate: Date = new Date(),
): string {
  const deadline = new Date(startDate);
  deadline.setHours(deadline.getHours() + CATEGORY_SLA_HOURS[category]);
  return deadline.toISOString();
}

export function calculatePriorityScore(occurrence: Occurrence): number {
  const severity = CATEGORY_SEVERITY_WEIGHT[occurrence.category] ?? 1;
  const ageHours =
    (Date.now() - new Date(occurrence.created_at).getTime()) / (1000 * 60 * 60);
  const slaUrgency = occurrence.sla_deadline
    ? Math.max(
        0,
        24 -
          (new Date(occurrence.sla_deadline).getTime() - Date.now()) /
            (1000 * 60 * 60),
      )
    : 0;
  const statusModifier =
    occurrence.status === "aberto"
      ? 1.2
      : occurrence.status === "em_analise"
        ? 1
        : occurrence.status === "em_execucao"
          ? 0.8
          : 0.2;

  return Math.round((severity * 8 + ageHours * 0.35 + slaUrgency * 0.7) * statusModifier);
}

export function formatStatus(status: Occurrence["status"]): string {
  return STATUS_LABELS[status];
}

export function formatDate(date: string): string {
  return format(new Date(date), "dd/MM/yyyy HH:mm");
}

export function formatRelativeDate(date: string): string {
  return formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
  });
}

export function resolutionHours(occurrence: Occurrence): number | null {
  if (occurrence.status !== "resolvido") {
    return null;
  }
  const created = new Date(occurrence.created_at).getTime();
  const updated = new Date(occurrence.updated_at).getTime();
  return Math.max(0, (updated - created) / (1000 * 60 * 60));
}
