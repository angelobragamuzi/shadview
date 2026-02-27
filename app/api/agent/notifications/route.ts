import { resolveAgentApiContext } from "@/lib/agent/api-context";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AgentNotification = {
  id: string;
  type: "assignment" | "status_update" | "comment";
  occurrenceId: string;
  protocol: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export async function GET(request: Request) {
  const { context, response } = await resolveAgentApiContext(request);

  if (!context) {
    return response as NextResponse;
  }

  const { supabaseAdmin, agent } = context;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20") || 20));

  const { data: assignmentRows, error: assignmentError } = await supabaseAdmin
    .from("occurrence_assignments")
    .select("id, occurrence_id, assigned_at")
    .eq("agent_id", agent.id);

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 500 });
  }

  if (!assignmentRows || assignmentRows.length === 0) {
    return NextResponse.json({
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
      unreadCount: 0,
      notifications: [],
    });
  }

  const occurrenceIds = assignmentRows.map((assignment) => assignment.occurrence_id);

  const [occurrenceRows, logRows] = await Promise.all([
    supabaseAdmin
      .from("occurrences")
      .select("id, title")
      .in("id", occurrenceIds),
    supabaseAdmin
      .from("occurrence_logs")
      .select("id, occurrence_id, status, comment, created_at")
      .in("occurrence_id", occurrenceIds)
      .order("created_at", { ascending: false })
      .limit(400),
  ]);

  if (occurrenceRows.error) {
    return NextResponse.json({ error: occurrenceRows.error.message }, { status: 500 });
  }

  if (logRows.error) {
    return NextResponse.json({ error: logRows.error.message }, { status: 500 });
  }

  const lastReadAt = agent.last_notification_read_at
    ? new Date(agent.last_notification_read_at).getTime()
    : null;
  const occurrenceMap = new Map(
    (occurrenceRows.data ?? []).map((occurrence) => [
      occurrence.id,
      { title: occurrence.title, protocol: occurrence.id },
    ]),
  );

  const notifications: AgentNotification[] = [];

  for (const assignment of assignmentRows) {
    const occurrenceMeta = occurrenceMap.get(assignment.occurrence_id);
    if (!occurrenceMeta) {
      continue;
    }

    const createdAt = assignment.assigned_at;
    const createdAtTimestamp = new Date(createdAt).getTime();

    notifications.push({
      id: `assignment-${assignment.id}`,
      type: "assignment",
      occurrenceId: assignment.occurrence_id,
      protocol: occurrenceMeta.protocol,
      title: occurrenceMeta.title,
      message: "Nova ocorrência vinculada ao agente.",
      createdAt,
      read: lastReadAt !== null ? createdAtTimestamp <= lastReadAt : false,
    });
  }

  for (const log of logRows.data ?? []) {
    const occurrenceMeta = occurrenceMap.get(log.occurrence_id);
    if (!occurrenceMeta) {
      continue;
    }

    const createdAtTimestamp = new Date(log.created_at).getTime();
    const hasComment = Boolean(log.comment && log.comment.trim().length > 0);

    notifications.push({
      id: `log-${log.id}`,
      type: hasComment ? "comment" : "status_update",
      occurrenceId: log.occurrence_id,
      protocol: occurrenceMeta.protocol,
      title: occurrenceMeta.title,
      message: hasComment
        ? log.comment ?? "Novo comentário registrado."
        : `Status atualizado para ${log.status}.`,
      createdAt: log.created_at,
      read: lastReadAt !== null ? createdAtTimestamp <= lastReadAt : false,
    });
  }

  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const total = notifications.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const pagedNotifications = notifications.slice(start, start + limit);
  const unreadCount = notifications.reduce(
    (count, notification) => (notification.read ? count : count + 1),
    0,
  );

  return NextResponse.json({
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    unreadCount,
    notifications: pagedNotifications,
  });
}

export async function POST(request: Request) {
  const { context, response } = await resolveAgentApiContext(request);

  if (!context) {
    return response as NextResponse;
  }

  const { supabaseAdmin, agent } = context;
  const nowIso = new Date().toISOString();

  const { error: updateError } = await supabaseAdmin
    .from("operational_agents")
    .update({ last_notification_read_at: nowIso })
    .eq("id", agent.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    lastNotificationReadAt: nowIso,
  });
}
