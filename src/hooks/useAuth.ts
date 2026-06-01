import type { AuthError, Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthResult = {
  error: AuthError | Error | null;
};

const missingConfigError = () =>
  new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.");

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: missingConfigError() };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) return { error: missingConfigError() };

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };

    if (data.user && data.user.identities?.length === 0) {
      return { error: new Error("An account with this email already exists.") };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return {
    session,
    user: (session?.user ?? null) as User | null,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
