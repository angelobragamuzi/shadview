import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { createClient, type User } from "@supabase/supabase-js";

function getSupabaseAnonEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não está configurada.");
  }

  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY não está configurada.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

function getBearerToken(request: Request) {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function getAuthenticatedUserFromRequest(request: Request): Promise<{
  user: User | null;
  error: string | null;
}> {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseAnonEnv();
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: "Token inválido ou expirado. Faça login novamente.",
      };
    }

    return {
      user,
      error: null,
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: "Sessão inválida. Faça login novamente.",
    };
  }

  return {
    user,
    error: null,
  };
}
