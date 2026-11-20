import type { SupabaseClient } from "@supabase/supabase-js";

// Crée la tâche détectée et la proposition pour la prochaine arrivée « nouvelle ».
// Le texte dit ce qui est vrai : « tu viens de préparer Léa » seulement si Ghost a réellement lu des écrans pendant cette session.
// Léa existe dans la base comme onboarding terminé (modèle), c'est ce que les agents reproduisent pour Karim.
export async function creerProposition(
  admin: SupabaseClient,
  sessionId: string,
  opts: { libelle: string; confiance: number; secours?: boolean },
): Promise<{ id: string; texte: string } | null> {
  const { data: arrivee } = await admin.from("arrivees").select("id").eq("statut", "nouvelle").limit(1).maybeSingle();
  if (!arrivee) return null;
  const { data: deja } = await admin.from("taches_detectees").select("id").eq("session_id", sessionId).eq("declencheur_arrivee_id", arrivee.id).maybeSingle();
  if (deja) return null;

  const { data: lues } = await admin.from("captures_lues").select("resume_holo").eq("session_id", sessionId).eq("memoire", false);
  const vus = lues?.length ?? 0;
  const NOMS: Record<string, string> = { rh: "l'espace RH", messagerie: "la messagerie", wiki: "le wiki" };
  const espaces = [...new Set((lues ?? []).map((l) => /^\[(rh|messagerie|wiki)\]/.exec(l.resume_holo ?? "")?.[1]).filter(Boolean) as string[])];
  const texte = espaces.length >= 2
    ? `Je t'ai vue travailler dans ${espaces.map((e) => NOMS[e]).join(", ")} (${vus} écrans lus). L'arrivée de Karim est là : je prépare son onboarding comme celui de Léa ?`
    : vus >= 3
      ? `Je t'ai vue travailler (${vus} écrans lus). L'arrivée de Karim est là : je prépare son onboarding comme celui de Léa ?`
      : "L'arrivée de Karim est là. Je prépare son onboarding comme celui de Léa, déjà complet dans l'intranet ?";

  const libelle = (opts.secours ? "[secours] " : "") + (opts.libelle || "Préparer l'onboarding");
  const { data: tache } = await admin.from("taches_detectees")
    .insert({ session_id: sessionId, libelle, outils: ["Espace RH"], confiance: opts.confiance, declencheur_arrivee_id: arrivee.id })
    .select("id").single();
  if (!tache) return null;
  const { data: p } = await admin.from("propositions").insert({ tache_id: tache.id, texte }).select("id").single();
  return p ? { id: p.id, texte } : null;
}
