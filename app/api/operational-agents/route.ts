import { buildOperationalAgentAccessEmail } from "@/lib/email/templates/operational-agent-access";
import { sendSmtpMail } from "@/lib/email/smtp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Institution, Team } from "@/types";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";

const createOperationalAgentBodySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Informe um nome válido para o agente."),
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido."),
  phone: z
    .string()
    .trim()
    .min(8, "Informe um telefone válido."),
  institutionId: z.string().uuid().nullable(),
  teamId: z.string().uuid().nullable(),
});

function getOperationalAgentPassword() {
  const fixedPassword = process.env.OPERATIONAL_AGENT_DEFAULT_PASSWORD?.trim();
  if (!fixedPassword) {
    throw new Error(
      "OPERATIONAL_AGENT_DEFAULT_PASSWORD não está configurada. Defina a senha padrão dos agentes.",
    );
  }

  if (fixedPassword.length < 8) {
    throw new Error(
      "OPERATIONAL_AGENT_DEFAULT_PASSWORD deve ter pelo menos 8 caracteres.",
    );
  }

  return fixedPassword;
}

async function findAuthUserByEmail(
  adminSupabase: ReturnType<typeof createSupabaseAdminClient>,
  email: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const perPage = 200;

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(error.message);
    }

    const users = data.users ?? [];
    const matchedUser = users.find(
      (candidate) => candidate.email?.toLowerCase() === normalizedEmail,
    );

    if (matchedUser) {
      return matchedUser;
    }

    if (users.length < perPage) {
      break;
    }
  }

  return null;
}

async function ensureAgentAuthUser(
  adminSupabase: ReturnType<typeof createSupabaseAdminClient>,
  params: {
    email: string;
    fullName: string;
    password: string;
  },
): Promise<{
  user: User;
  createdNow: boolean;
}> {
  const { email, fullName, password } = params;
  const existingUser = await findAuthUserByEmail(adminSupabase, email);

  if (existingUser) {
    const { data, error } = await adminSupabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existingUser.user_metadata ?? {}),
        full_name: fullName,
      },
    });

    if (error || !data.user) {
      throw new Error(
        error?.message ?? "Não foi possível atualizar as credenciais do usuário existente.",
      );
    }

    return {
      user: data.user,
      createdNow: false,
    };
  }

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error || !data.user) {
    throw new Error(
      error?.message ?? "Não foi possível criar o usuário de autenticação para o agente.",
    );
  }

  return {
    user: data.user,
    createdNow: true,
  };
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsedBody = createOperationalAgentBodySchema.safeParse(payload);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sessão inválida. Faça login novamente." }, { status: 401 });
  }

  const { fullName, email, phone, institutionId, teamId } = parsedBody.data;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profileData?.role !== "gestor") {
    return NextResponse.json(
      { error: "Apenas gestores podem cadastrar agentes operacionais." },
      { status: 403 },
    );
  }

  const { data: existingAgent } = await supabase
    .from("operational_agents")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingAgent) {
    return NextResponse.json(
      { error: "Já existe um agente operacional cadastrado com este e-mail." },
      { status: 409 },
    );
  }

  let temporaryPassword: string;
  try {
    temporaryPassword = getOperationalAgentPassword();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Senha padrão dos agentes não configurada.",
      },
      { status: 500 },
    );
  }

  let adminSupabase: ReturnType<typeof createSupabaseAdminClient>;
  try {
    adminSupabase = createSupabaseAdminClient();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível inicializar o provisionamento do agente.",
      },
      { status: 500 },
    );
  }

  let createdAuthUserId: string;
  let shouldDeleteAuthUserOnRollback = false;

  try {
    const authProvision = await ensureAgentAuthUser(adminSupabase, {
      email,
      fullName,
      password: temporaryPassword,
    });
    createdAuthUserId = authProvision.user.id;
    shouldDeleteAuthUserOnRollback = authProvision.createdNow;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível provisionar o usuário de autenticação do agente.",
      },
      { status: 400 },
    );
  }

  const { data: existingAgentByAuth, error: existingAgentByAuthError } = await adminSupabase
    .from("operational_agents")
    .select("id")
    .eq("auth_user_id", createdAuthUserId)
    .maybeSingle();

  if (existingAgentByAuthError) {
    if (shouldDeleteAuthUserOnRollback) {
      await adminSupabase.auth.admin.deleteUser(createdAuthUserId);
    }

    return NextResponse.json(
      { error: "Não foi possível validar o vínculo operacional do usuário." },
      { status: 500 },
    );
  }

  if (existingAgentByAuth) {
    return NextResponse.json(
      { error: "Este usuário já está vinculado a um agente operacional." },
      { status: 409 },
    );
  }

  const { error: profileUpsertError } = await adminSupabase
    .from("profiles")
    .upsert(
      {
        id: createdAuthUserId,
        full_name: fullName,
        role: "agent",
      },
      { onConflict: "id" },
    );

  if (profileUpsertError) {
    if (shouldDeleteAuthUserOnRollback) {
      await adminSupabase.auth.admin.deleteUser(createdAuthUserId);
    }

    return NextResponse.json(
      { error: "Não foi possível configurar o perfil do agente." },
      { status: 500 },
    );
  }

  const { data: createdAgent, error: insertError } = await supabase
    .from("operational_agents")
    .insert({
      full_name: fullName,
      email,
      phone,
      institution_id: institutionId,
      team_id: teamId,
      auth_user_id: createdAuthUserId,
      must_change_password: true,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (insertError) {
    if (shouldDeleteAuthUserOnRollback) {
      await adminSupabase.auth.admin.deleteUser(createdAuthUserId);
    }

    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const [institutionData, teamData] = await Promise.all([
    institutionId
      ? supabase
          .from("institutions")
          .select("name")
          .eq("id", institutionId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    teamId
      ? supabase.from("teams").select("name").eq("id", teamId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const institutionName = (institutionData.data as Pick<Institution, "name"> | null)?.name ?? null;
  const teamName = (teamData.data as Pick<Team, "name"> | null)?.name ?? null;

  const emailContent = buildOperationalAgentAccessEmail({
    agentName: fullName,
    loginEmail: email,
    loginPhone: phone,
    temporaryPassword,
    institutionName,
    teamName,
  });

  try {
    await sendSmtpMail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return NextResponse.json({
      agent: createdAgent,
      emailSent: true,
    });
  } catch {
    return NextResponse.json({
      agent: createdAgent,
      emailSent: false,
      warning:
        "Agente cadastrado, mas não foi possível enviar o e-mail com as credenciais neste momento.",
      temporaryPassword,
    });
  }
}
