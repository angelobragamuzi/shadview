import { buildOperationalAgentAccessEmail } from "@/lib/email/templates/operational-agent-access";
import { sendSmtpMail } from "@/lib/email/smtp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Institution, Team } from "@/types";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
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

function generateTemporaryPassword(length = 12) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
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

  const temporaryPassword = generateTemporaryPassword();

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

  const { data: createdAuthData, error: authCreateError } = await adminSupabase.auth.admin.createUser(
    {
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    },
  );

  if (authCreateError || !createdAuthData.user) {
    return NextResponse.json(
      {
        error:
          authCreateError?.message ??
          "Não foi possível criar o usuário de autenticação para o agente.",
      },
      { status: 400 },
    );
  }

  const createdAuthUserId = createdAuthData.user.id;

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
    await adminSupabase.auth.admin.deleteUser(createdAuthUserId);

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
    await adminSupabase.auth.admin.deleteUser(createdAuthUserId);

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
