import { resolveAgentApiContext } from "@/lib/agent/api-context";
import type { Occurrence, OccurrenceStatus } from "@/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_STATUSES: readonly OccurrenceStatus[] = [
  "aberto",
  "em_analise",
  "em_execucao",
  "resolvido",
];

function scoreOccurrenceBySlaAndPriority(occurrence: Occurrence) {
  const now = Date.now();
  const slaTimestamp = occurrence.sla_deadline
    ? new Date(occurrence.sla_deadline).getTime()
    : null;

  const isOverdue = slaTimestamp !== null && slaTimestamp < now;
  const msToSla = slaTimestamp === null ? Number.MAX_SAFE_INTEGER : slaTimestamp - now;

  const statusWeight: Record<OccurrenceStatus, number> = {
    aberto: 0,
    em_analise: 1,
    em_execucao: 2,
    resolvido: 3,
  };

  return {
    isOverdue: isOverdue ? 0 : 1,
    msToSla,
    statusWeight: statusWeight[occurrence.status],
    createdAt: new Date(occurrence.created_at).getTime(),
  };
}

export async function GET(request: Request) {
  const { context, response } = await resolveAgentApiContext(request);

  if (!context) {
    return response as NextResponse;
  }

  const { supabaseAdmin, agent } = context;
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20") || 20));

  if (statusFilter && !VALID_STATUSES.includes(statusFilter as OccurrenceStatus)) {
    return NextResponse.json(
      { error: "Status de ocorrência inválido no filtro." },
      { status: 400 },
    );
  }

  const { data: assignmentRows, error: assignmentError } = await supabaseAdmin
    .from("occurrence_assignments")
    .select(
      "id, occurrence_id, institution_id, team_id, notes, assigned_at, created_at, updated_at",
    )
    .eq("agent_id", agent.id);

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 500 });
  }

  if (!assignmentRows || assignmentRows.length === 0) {
    return NextResponse.json({
      metrics: {
        totalAssigned: 0,
        abertas: 0,
        emAnalise: 0,
        emExecucao: 0,
        slaExpiring24h: 0,
      },
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
      occurrences: [],
    });
  }

  const occurrenceIds = assignmentRows.map((assignment) => assignment.occurrence_id);
  let occurrencesQuery = supabaseAdmin
    .from("occurrences")
    .select("*")
    .in("id", occurrenceIds);

  if (statusFilter) {
    occurrencesQuery = occurrencesQuery.eq("status", statusFilter as OccurrenceStatus);
  }

  const { data: occurrenceRows, error: occurrenceError } = await occurrencesQuery;

  if (occurrenceError) {
    return NextResponse.json({ error: occurrenceError.message }, { status: 500 });
  }

  const occurrenceMap = new Map(
    (occurrenceRows ?? []).map((occurrence) => [occurrence.id, occurrence as Occurrence]),
  );

  const institutionIds = Array.from(
    new Set(
      assignmentRows
        .map((assignment) => assignment.institution_id)
        .filter((institutionId): institutionId is string => Boolean(institutionId)),
    ),
  );

  const teamIds = Array.from(
    new Set(
      assignmentRows
        .map((assignment) => assignment.team_id)
        .filter((teamId): teamId is string => Boolean(teamId)),
    ),
  );

  const [institutionRows, teamRows] = await Promise.all([
    institutionIds.length > 0
      ? supabaseAdmin
          .from("institutions")
          .select("id, name, acronym")
          .in("id", institutionIds)
      : Promise.resolve({ data: [], error: null }),
    teamIds.length > 0
      ? supabaseAdmin.from("teams").select("id, name").in("id", teamIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const institutionMap = new Map((institutionRows.data ?? []).map((row) => [row.id, row]));
  const teamMap = new Map((teamRows.data ?? []).map((row) => [row.id, row]));

  const entries = assignmentRows
    .map((assignment) => {
      const occurrence = occurrenceMap.get(assignment.occurrence_id);
      if (!occurrence) {
        return null;
      }

      return {
        ...occurrence,
        protocol: occurrence.id,
        assignment: {
          ...assignment,
          institution: assignment.institution_id
            ? institutionMap.get(assignment.institution_id) ?? null
            : null,
          team: assignment.team_id ? teamMap.get(assignment.team_id) ?? null : null,
        },
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => {
      const scoreA = scoreOccurrenceBySlaAndPriority(a);
      const scoreB = scoreOccurrenceBySlaAndPriority(b);

      if (scoreA.isOverdue !== scoreB.isOverdue) {
        return scoreA.isOverdue - scoreB.isOverdue;
      }

      if (scoreA.msToSla !== scoreB.msToSla) {
        return scoreA.msToSla - scoreB.msToSla;
      }

      if (scoreA.statusWeight !== scoreB.statusWeight) {
        return scoreA.statusWeight - scoreB.statusWeight;
      }

      return scoreB.createdAt - scoreA.createdAt;
    });

  const now = Date.now();
  const metrics = entries.reduce(
    (accumulator, occurrence) => {
      accumulator.totalAssigned += 1;

      if (occurrence.status === "aberto") {
        accumulator.abertas += 1;
      }
      if (occurrence.status === "em_analise") {
        accumulator.emAnalise += 1;
      }
      if (occurrence.status === "em_execucao") {
        accumulator.emExecucao += 1;
      }

      if (
        occurrence.status !== "resolvido" &&
        occurrence.sla_deadline
      ) {
        const msToSla = new Date(occurrence.sla_deadline).getTime() - now;
        if (msToSla > 0 && msToSla <= 24 * 60 * 60 * 1000) {
          accumulator.slaExpiring24h += 1;
        }
      }

      return accumulator;
    },
    {
      totalAssigned: 0,
      abertas: 0,
      emAnalise: 0,
      emExecucao: 0,
      slaExpiring24h: 0,
    },
  );

  const total = entries.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const pagedEntries = entries.slice(start, start + limit);

  return NextResponse.json({
    metrics,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    occurrences: pagedEntries,
  });
}
