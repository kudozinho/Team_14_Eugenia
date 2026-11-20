import type { SupabaseClient } from "@supabase/supabase-js";

// Remonte proposition -> tâche -> session pour savoir à qui elle appartient.
export async function utilisateurDeProposition(admin: SupabaseClient, propositionId: string): Promise<string | null> {
  const { data: p } = await admin.from("propositions").select("tache_id").eq("id", propositionId).maybeSingle();
  if (!p) return null;
  const { data: t } = await admin.from("taches_detectees").select("session_id").eq("id", p.tache_id).maybeSingle();
  if (!t) return null;
  const { data: s } = await admin.from("sessions_audit").select("user_id").eq("id", t.session_id).maybeSingle();
  return s?.user_id ?? null;
}
