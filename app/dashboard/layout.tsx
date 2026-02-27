import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isDashboardRole } from "@/services/role-service";
import type { Profile, UserRole } from "@/types";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  if (!profile || !isDashboardRole(profile.role)) {
    redirect("/occurrence");
  }

  return (
    <DashboardShell
      fullName={profile.full_name ?? user.email ?? "Usuário"}
      role={profile.role as UserRole}
    >
      {children}
    </DashboardShell>
  );
}

