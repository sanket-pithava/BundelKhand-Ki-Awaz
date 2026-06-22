import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AdminAuthState = {
  user: User | null;
  isAdmin: boolean;
  isReporter: boolean;
  loading: boolean;
};

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isReporter: false,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const check = async (user: User | null) => {
      if (!user) {
        if (mounted)
          setState({
            user: null,
            isAdmin: false,
            isReporter: false,
            loading: false,
          });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roles = data?.map((r) => r.role) || [];
      const isAdmin = roles.includes("admin");
      const isReporter = roles.includes("editor"); // Map editor to reporter

      if (mounted) setState({ user, isAdmin, isReporter, loading: false });
    };

    supabase.auth
      .getSession()
      .then(({ data }) => check(data.session?.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
