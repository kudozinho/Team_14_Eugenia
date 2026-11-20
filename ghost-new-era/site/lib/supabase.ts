import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client navigateur : n'utilise que l'URL et la clé publique (jamais la clé de service).
let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !cle) throw new Error("Variables Supabase manquantes (voir .env.example).");
    client = createClient(url, cle);
  }
  return client;
}
