import tachesJson from "@/data/taches-demo.json";
import ficheJson from "@/data/fiche-001.json";
import executionJson from "@/data/execution-exemple.json";
import pistesJson from "@/data/pistes.json";

export type Score = {
  gain: number; facilite: number; effort: number; risque: number; confiance: number;
  total: number; quadrant: string;
};
export type Tache = {
  id: string; nom: string; court: string; methode: "agent_h" | "n8n" | "rien";
  heures_an: number; duree_humaine_s: number; score: Score; outil: string; vigilance: string;
};
export type Execution = {
  tache_id: string; session_id: string; statut: string; duree_s: number;
  duree_humaine_s: number; portails_publies: string[]; resume: string;
};

// Aujourd'hui : fichiers d'exemple. Jeudi : lecture Supabase (même forme, voir commun/contrats.md).
export function getTaches(): Tache[] {
  return (tachesJson.taches as Tache[]).slice().sort((a, b) => b.score.total - a.score.total);
}
export function getTotalHeures(): number {
  return tachesJson.total_heures_an;
}
export function getOrganisation(): string {
  return tachesJson.organisation;
}
export function getFiche() {
  return ficheJson;
}
export function getExecution(): Execution {
  return executionJson as Execution;
}

export function formatDuree(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r} s`;
  return r === 0 ? `${m} min` : `${m} min ${String(r).padStart(2, "0")}`;
}

export const LABEL_METHODE: Record<string, string> = {
  agent_h: "Agent H",
  n8n: "n8n",
  rien: "Rien à construire",
};

export type Piste = { id: string; nom: string; court: string; methode?: string; heures_an?: number; heures_an_aujourdhui?: number; pourquoi: string };
// Pistes à mesurer pendant l'audit : jamais additionnées au chiffre principal.
export function getPistes() {
  const aConfirmer = pistesJson.a_confirmer as Piste[];
  return {
    aConfirmer,
    totalAConfirmer: aConfirmer.reduce((s, p) => s + (p.heures_an ?? 0), 0),
    dejaCouvert: pistesJson.deja_couvert as Piste[],
  };
}

// Dernière exécution TERMINÉE de l'agent pour la tâche de démo, lue dans Supabase (côté serveur uniquement).
// Sans clés, ou si la base ne répond pas : null, et la page garde les valeurs d'exemple.
export async function getExecutionMesuree(tacheId: string): Promise<Execution | null> {
  const url = process.env.SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) return null;
  try {
    const r = await fetch(
      `${url}/rest/v1/executions_agent?tache_id=eq.${encodeURIComponent(tacheId)}&statut=eq.completed&order=cree_le.desc&limit=1`,
      { headers: { apikey: cle, Authorization: `Bearer ${cle}` }, cache: "no-store" },
    );
    if (!r.ok) return null;
    const [l] = await r.json();
    if (!l || !l.duree_s) return null;
    return {
      tache_id: l.tache_id, session_id: l.session_id ?? "", statut: l.statut, duree_s: l.duree_s,
      duree_humaine_s: l.duree_humaine_s ?? 720, portails_publies: l.portails_publies ?? [], resume: l.resume ?? "",
    };
  } catch {
    return null;
  }
}

// ---- Rapport des exécutions de l'agent (lu dans Supabase, côté serveur uniquement) ----
export type LigneExecution = {
  id: string; tache_id: string; session_id: string; statut: string; duree_s: number | null;
  duree_humaine_s: number | null; portails_publies: string[]; resume: string; cree_le: string;
};
export type Historique = {
  etat: "pas_de_cles" | "erreur" | "vide" | "autre_tache" | "ok";
  lignes: LigneExecution[];
  detail?: string;
};

export async function getHistoriqueExecutions(tacheId: string): Promise<Historique> {
  const url = process.env.SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) return { etat: "pas_de_cles", lignes: [] };
  const entetes = { apikey: cle, Authorization: `Bearer ${cle}` };
  const base = `${url}/rest/v1/executions_agent`;
  try {
    const r = await fetch(`${base}?tache_id=eq.${encodeURIComponent(tacheId)}&order=cree_le.desc&limit=10`, { headers: entetes, cache: "no-store" });
    if (!r.ok) return { etat: "erreur", lignes: [], detail: `Supabase a répondu ${r.status}` };
    const lignes = ((await r.json()) as LigneExecution[]).map((l) => ({ ...l, portails_publies: l.portails_publies ?? [], resume: l.resume ?? "", session_id: l.session_id ?? "" }));
    if (lignes.length) return { etat: "ok", lignes };
    // Aucune ligne pour cette tâche : y en a-t-il pour d'autres ? (TACHE_ID mal réglé)
    const t = await fetch(`${base}?select=tache_id&limit=1`, { headers: entetes, cache: "no-store" });
    const autres = t.ok ? ((await t.json()) as { tache_id: string }[]) : [];
    return autres.length
      ? { etat: "autre_tache", lignes: [], detail: autres[0].tache_id }
      : { etat: "vide", lignes: [] };
  } catch (e) {
    return { etat: "erreur", lignes: [], detail: e instanceof Error ? e.message : "inconnue" };
  }
}

export function mediane(valeurs: number[]): number | null {
  if (!valeurs.length) return null;
  const v = valeurs.slice().sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
}
