import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getEnv(key: string): string | undefined {
  const val = import.meta.env[key as keyof ImportMetaEnv];
  return typeof val === "string" && val.length > 0 ? val : undefined;
}

function normalizeJwtKey(key: string): string {
  // JWT must start with "eyJ" — fix common copy-paste truncation
  if (key.startsWith("JhbGci")) return `ey${key}`;
  return key;
}

export function createClient(): SupabaseClient | null {
  if (client) return client;

  const url = getEnv("VITE_SUPABASE_URL") || getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const rawKey =
    getEnv("VITE_SUPABASE_ANON_KEY") || getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !rawKey) {
    if (import.meta.env.DEV) {
      console.warn("Supabase credentials not configured.");
    }
    return null;
  }

  const key = normalizeJwtKey(rawKey);
  client = createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
