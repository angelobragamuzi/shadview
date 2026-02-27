import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUserFromRequest } from "@/lib/supabase/request-auth";
import type { OperationalAgent, Profile } from "@/types";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export type AgentRecord = OperationalAgent & {
  auth_user_id: string | null;
  must_change_password: boolean;
  last_login_at: string | null;
  last_notification_read_at: string | null;
};

export interface AgentApiContext {
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>;
  user: User;
  profile: Profile;
  agent: AgentRecord;
}

interface ResolveAgentContextOptions {
  requireActive?: boolean;
}

export async function resolveAgentApiContext(
  request: Request,
  options: ResolveAgentContextOptions = {},
): Promise<{
  context: AgentApiContext | null;
  response: NextResponse | null;
}> {
  const { requireActive = true } = options;
  const { user, error: userError } = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return {
      context: null,
      response: NextResponse.json(
        { error: userError ?? "Não autenticado." },
        { status: 401 },
      ),
    };
  }

  let supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    supabaseAdmin = createSupabaseAdminClient();
  } catch (error) {
    return {
      context: null,
      response: NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Não foi possível inicializar o serviço de autenticação do agente.",
        },
        { status: 500 },
      ),
    };
  }

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profileData) {
    return {
      context: null,
      response: NextResponse.json(
        { error: "Perfil não encontrado para o usuário autenticado." },
        { status: 403 },
      ),
    };
  }

  const profile = profileData as Profile;

  if (profile.role !== "agent") {
    return {
      context: null,
      response: NextResponse.json(
        { error: "Acesso permitido apenas para usuários com perfil agente." },
        { status: 403 },
      ),
    };
  }

  const { data: agentData, error: agentError } = await supabaseAdmin
    .from("operational_agents")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (agentError || !agentData) {
    return {
      context: null,
      response: NextResponse.json(
        {
          error:
            "Cadastro operacional não vinculado ao usuário. Contate o gestor do sistema.",
        },
        { status: 403 },
      ),
    };
  }

  const agent = agentData as AgentRecord;

  if (requireActive && !agent.is_active) {
    return {
      context: null,
      response: NextResponse.json(
        { error: "Conta de agente inativa. Contate o gestor responsável." },
        { status: 403 },
      ),
    };
  }

  return {
    context: {
      supabaseAdmin,
      user,
      profile,
      agent,
    },
    response: null,
  };
}
