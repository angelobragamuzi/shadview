import { resolveAgentApiContext } from "@/lib/agent/api-context";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const changePasswordBodySchema = z.object({
  newPassword: z
    .string()
    .min(8, "A nova senha deve conter pelo menos 8 caracteres.")
    .max(128, "A nova senha deve conter no máximo 128 caracteres."),
});

export async function POST(request: Request) {
  const { context, response } = await resolveAgentApiContext(request);

  if (!context) {
    return response as NextResponse;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsedBody = changePasswordBodySchema.safeParse(payload);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { supabaseAdmin, user, agent } = context;

  const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: parsedBody.data.newPassword,
  });

  if (passwordError) {
    return NextResponse.json({ error: passwordError.message }, { status: 500 });
  }

  const { error: updateAgentError } = await supabaseAdmin
    .from("operational_agents")
    .update({
      must_change_password: false,
      last_login_at: new Date().toISOString(),
    })
    .eq("id", agent.id);

  if (updateAgentError) {
    return NextResponse.json({ error: updateAgentError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mustChangePassword: false });
}
