import { createClient } from "@supabase/supabase-js";
import { redirect } from "@tanstack/react-router";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);

export async function requireAuth() {
  if (typeof window === "undefined") return;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw redirect({ to: "/login" });
  }
}

export async function redirectIfAuthenticated() {
  if (typeof window === "undefined") return;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    throw redirect({ to: "/dashboard" });
  }
}
