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
