"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ensureProfile, getProfile } from "@/services/auth-service";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth() {
  const supabase = createBrowserSupabaseClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user ?? null;

      if (!user) {
        setState({
          user: null,
          profile: null,
          loading: false,
        });
        return;
      }

      let profile = await getProfile(user.id);
      if (!profile) {
        profile = await ensureProfile(user.id, user.user_metadata.full_name);
      }

      setState({
        user,
        profile,
        loading: false,
      });
    } catch {
      setState({
        user: null,
        profile: null,
        loading: false,
      });
    }
  }, [supabase.auth]);

  useEffect(() => {
    void refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => subscription.unsubscribe();
  }, [refresh, supabase.auth]);

  return {
    ...state,
    refresh,
  };
}
