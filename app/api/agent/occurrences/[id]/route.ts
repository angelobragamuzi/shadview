import { resolveAgentApiContext } from "@/lib/agent/api-context";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const patchOccurrenceBodySchema = z.object({
  status: z.literal("em_execucao"),
  comment: z.string().trim().max(1000).optional(),
});

async function loadAssignedOccurrence(
  occurrenceId: string,
  agentId: string,
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
) {
  return supabaseAdmin
    .from("occurrence_assignments")
    .select("*")
    .eq("occurrence_id", occurrenceId)
    .eq("agent_id", agentId)
    .maybeSingle();
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { context: agentContext, response } = await resolveAgentApiContext(request);

  if (!agentContext) {
    return response as NextResponse;
  }

  const { id: occurrenceId } = await context.params;
  const { supabaseAdmin, agent } = agentContext;

  const { data: assignmentData, error: assignmentError } = await loadAssignedOccurrence(
    occurrenceId,
    agent.id,
    supabaseAdmin,
  );

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 500 });
  }

  if (!assignmentData) {
    return NextResponse.json(
      { error: "Ocorrência não vinculada ao agente autenticado." },
      { status: 404 },
    );
  }

  const [occurrenceResult, logsResult, imagesResult, institutionResult, teamResult] =
    await Promise.all([
      supabaseAdmin.from("occurrences").select("*").eq("id", occurrenceId).maybeSingle(),
      supabaseAdmin
        .from("occurrence_logs")
        .select("*")
        .eq("occurrence_id", occurrenceId)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("occurrence_images")
        .select("*")
        .eq("occurrence_id", occurrenceId)
        .order("created_at", { ascending: true }),
      assignmentData.institution_id
        ? supabaseAdmin
            .from("institutions")
            .select("id, name, acronym")
            .eq("id", assignmentData.institution_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      assignmentData.team_id
        ? supabaseAdmin
            .from("teams")
            .select("id, name")
            .eq("id", assignmentData.team_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (occurrenceResult.error) {
    return NextResponse.json({ error: occurrenceResult.error.message }, { status: 500 });
  }

  if (!occurrenceResult.data) {
    return NextResponse.json({ error: "Ocorrência não encontrada." }, { status: 404 });
  }

  if (logsResult.error) {
    return NextResponse.json({ error: logsResult.error.message }, { status: 500 });
  }

  if (imagesResult.error) {
    return NextResponse.json({ error: imagesResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...occurrenceResult.data,
    protocol: occurrenceResult.data.id,
    assignment: {
      ...assignmentData,
      institution: institutionResult.data ?? null,
      team: teamResult.data ?? null,
    },
    timeline: logsResult.data ?? [],
    images: imagesResult.data ?? [],
  });
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { context: agentContext, response } = await resolveAgentApiContext(request);

  if (!agentContext) {
    return response as NextResponse;
  }

  const { id: occurrenceId } = await context.params;
  const { supabaseAdmin, agent, user } = agentContext;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsedBody = patchOccurrenceBodySchema.safeParse(payload);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { data: assignmentData, error: assignmentError } = await loadAssignedOccurrence(
    occurrenceId,
    agent.id,
    supabaseAdmin,
  );

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 500 });
  }

  if (!assignmentData) {
    return NextResponse.json(
      { error: "Ocorrência não vinculada ao agente autenticado." },
      { status: 404 },
    );
  }

  const { data: occurrenceData, error: occurrenceError } = await supabaseAdmin
    .from("occurrences")
    .select("*")
    .eq("id", occurrenceId)
    .maybeSingle();

  if (occurrenceError) {
    return NextResponse.json({ error: occurrenceError.message }, { status: 500 });
  }

  if (!occurrenceData) {
    return NextResponse.json({ error: "Ocorrência não encontrada." }, { status: 404 });
  }

  if (occurrenceData.status === "resolvido") {
    return NextResponse.json(
      { error: "Não é possível iniciar execução de ocorrência já resolvida." },
      { status: 409 },
    );
  }

  const { data: updatedOccurrence, error: updateError } = await supabaseAdmin
    .from("occurrences")
    .update({
      status: "em_execucao",
      updated_at: new Date().toISOString(),
    })
    .eq("id", occurrenceId)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: logError } = await supabaseAdmin.from("occurrence_logs").insert({
    occurrence_id: occurrenceId,
    actor_id: user.id,
    status: "em_execucao",
    comment: parsedBody.data.comment?.trim() || "Ocorrência em execução pelo agente.",
    is_internal: true,
  });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  return NextResponse.json({
    occurrence: updatedOccurrence,
  });
}
