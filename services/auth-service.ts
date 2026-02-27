import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { LoginFormValues, RegisterFormValues } from "@/lib/schemas/auth";
import type { Profile, UserRole } from "@/types";

export async function signInWithEmail(values: LoginFormValues) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInAsGestor(values: LoginFormValues) {
  const data = await signInWithEmail(values);
  const user = data.user;

  if (!user) {
    throw new Error("Falha ao autenticar.");
  }

  const profile = await getProfile(user.id);

  if (!profile || profile.role !== "gestor") {
    await signOut();
    throw new Error("Acesso permitido apenas para usuários com perfil gestor.");
  }

  return data;
}

export async function signUpWithEmail(values: RegisterFormValues) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    await ensureProfile(data.user.id, values.fullName);
  }

  return data;
}

export async function signOut() {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return data.user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Profile | null) ?? null;
}

export async function ensureProfile(
  userId: string,
  fullName?: string,
  role: UserRole = "citizen",
): Promise<Profile> {
  const supabase = createBrowserSupabaseClient();
  const existing = await getProfile(userId);
  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      full_name: fullName ?? null,
      role,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
}

