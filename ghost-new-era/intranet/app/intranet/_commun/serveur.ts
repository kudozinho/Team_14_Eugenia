// Client Supabase côté serveur uniquement (clé service_role).
// Ce fichier n'est importé que par des composants serveur et des Server Actions : la clé ne part jamais au navigateur.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabaseServeur(): SupabaseClient {
  if (typeof window !== "undefined") throw new Error("supabaseServeur() est réservé au serveur.");
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !cle) throw new Error("Variables Supabase serveur manquantes (NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY).");
    client = createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

export type Personne = {
  id: string;
  prenom: string;
  nom: string;
  poste: string;
  equipe: string;
  manager_id: string | null;
  statut: string;
};

export async function listerPersonnes(): Promise<Personne[]> {
  const { data, error } = await supabaseServeur()
    .from("personnes")
    .select("id, prenom, nom, poste, equipe, manager_id, statut")
    .order("equipe")
    .order("prenom");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function texte(form: FormData, champ: string, max = 2000): string {
  return String(form.get(champ) ?? "").trim().slice(0, max);
}

export function dateHeure(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
