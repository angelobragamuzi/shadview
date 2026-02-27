import { resolveAgentApiContext } from "@/lib/agent/api-context";
import type { Institution, Team } from "@/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { context, response } = await resolveAgentApiContext(request, {
    requireActive: false,
  });

  if (!context) {
    return response as NextResponse;
  }

  const { supabaseAdmin, user, profile, agent } = context;

  if (!agent.is_active) {
    return NextResponse.json(
      { error: "Conta de agente inativa. Contate o gestor responsável." },
      { status: 403 },
    );
  }

  const [institutionResult, teamResult] = await Promise.all([
    agent.institution_id
      ? supabaseAdmin
          .from("institutions")
          .select("id, name, acronym")
          .eq("id", agent.institution_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    agent.team_id
      ? supabaseAdmin.from("teams").select("id, name").eq("id", agent.team_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  await supabaseAdmin
    .from("operational_agents")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", agent.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? agent.email ?? null,
    },
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      role: profile.role,
    },
    agent: {
      ...agent,
      institution: (institutionResult.data as Pick<Institution, "id" | "name" | "acronym"> | null) ??
        null,
      team: (teamResult.data as Pick<Team, "id" | "name"> | null) ?? null,
    },
    mustChangePassword: agent.must_change_password,
  });
}
