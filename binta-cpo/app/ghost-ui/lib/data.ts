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
  heures_an: number; duree_humaine_s: number; score: Score; outil: string; vigilance: string; provisoire?: boolean;
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

// Une exécution compte seulement si l'agent a fini ET que les annonces sont vérifiées sur les portails
// (« Vérifiée sur : aucun » ou « Absente ou fausse » = échec de vérification, même si le statut est « completed »).
export function executionValide(l: { statut: string; duree_s: number | null; resume: string }): boolean {
  return l.statut === "completed" && !!l.duree_s && !/absente ou fausse|vérifiée sur : aucun/i.test(l.resume);
}

export function mediane(valeurs: number[]): number | null {
  if (!valeurs.length) return null;
  const v = valeurs.slice().sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
}

// ---- Tâches détectées lues dans Supabase (tableau de bord et rapport) ----
export type SourceDonnees = "base" | "exemple";

type LigneTache = {
  id: string; audit_id?: string | null; nom: string; sequence: string[] | null; occurrences: number | null; duree_moyenne_s: number | null;
  methode: string | null; gain_estime_h_semaine: number | null; confiance: number | null;
  score: (Partial<Score> & { heures_an?: number; hypotheses?: string[] }) | null;
  fiche: { metier?: unknown; technique?: unknown } | null; instructions_agent: string | null; cree_le: string;
};

function accesBase() {
  const url = process.env.SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && cle ? { url, entetes: { apikey: cle, Authorization: `Bearer ${cle}` } } : null;
}

async function lireTaches(filtre = ""): Promise<LigneTache[] | null> {
  const a = accesBase();
  if (!a) return null;
  try {
    const r = await fetch(`${a.url}/rest/v1/taches_detectees?select=*&order=cree_le.desc${filtre}`, { headers: a.entetes, cache: "no-store" });
    if (!r.ok) return null;
    // Exemples du kit (tâche d'exemple du 17/11, 49 h, 12 min) : jamais mélangés aux vraies tâches de l'audit.
    // On ne les efface pas de la base (traces à sauvegarder) : on les masque ici.
    const kit = ["tache_001"].filter((id) => id !== process.env.TACHE_ID);
    return ((await r.json()) as LigneTache[]).filter((l) => !kit.includes(l.id));
  } catch {
    return null;
  }
}

const METHODES: Record<string, Tache["methode"]> = { agent_h: "agent_h", les_deux: "agent_h", n8n: "n8n", outil_existant: "rien", rien: "rien" };

function nomCourt(nom: string): string {
  const base = nom.split(" — ")[0].replace(/^Recopier une annonce sur 3 sites sans passerelle$/, "Recopie 3 sites");
  return base.length > 24 ? `${base.slice(0, 23)}…` : base;
}

function versTache(l: LigneTache): Tache | null {
  const s = l.score;
  if (!s || typeof s.total !== "number") return null; // pas encore noté par Henriquet
  return {
    id: l.id, nom: l.nom, court: nomCourt(l.nom),
    methode: METHODES[l.methode ?? "rien"] ?? "rien",
    heures_an: Math.round(s.heures_an ?? (l.gain_estime_h_semaine ?? 0) * 46),
    duree_humaine_s: l.duree_moyenne_s ?? 0,
    score: {
      gain: s.gain ?? 3, facilite: s.facilite ?? 3, effort: s.effort ?? 3, risque: s.risque ?? 3,
      confiance: s.confiance ?? 3, total: s.total, quadrant: s.quadrant ?? "",
    },
    outil: LABEL_METHODE[METHODES[l.methode ?? "rien"] ?? "rien"],
    provisoire: (s.hypotheses ?? []).some((h) => /vérifier|provisoire/i.test(h)),
    vigilance: (l.fiche?.technique as { vigilance?: string[] } | undefined)?.vigilance?.[0] ?? "À préciser dans la fiche de la tâche",
  };
}

export async function chargerTaches(): Promise<{ source: SourceDonnees; taches: Tache[]; total: number; enAttente: number; maj: string }> {
  const maj = new Date().toISOString();
  const lignes = await lireTaches();
  const taches = (lignes ?? []).map(versTache).filter((t): t is Tache => t !== null).sort((a, b) => b.score.total - a.score.total);
  if (!lignes || taches.length === 0) {
    const ex = getTaches();
    return { source: "exemple", taches: ex, total: getTotalHeures(), enAttente: lignes?.length ?? 0, maj };
  }
  const total = taches.filter((t) => t.methode !== "rien").reduce((s, t) => s + t.heures_an, 0);
  return { source: "base", taches, total, enAttente: (lignes?.length ?? 0) - taches.length, maj };
}

// Fiche opportunité : celle de la base si elle existe, sinon composée à partir de la tâche détectée.
// Pour la tâche de démo (recopie d'annonces), on garde les textes de la fiche d'exemple et on remplace les chiffres connus.
// `strict` : la tâche demandée dans l'adresse (?tache=) doit exister, et appartenir à l'audit demandé (?audit=) si on le précise.
// Sinon on ne montre JAMAIS une autre tâche à sa place : source « introuvable ».
export async function chargerFiche(tacheId?: string, opts: { strict?: boolean; audit?: string } = {}) {
  const lignes = await lireTaches();
  if (opts.strict && tacheId) {
    const l0 = lignes?.find((x) => x.id === tacheId);
    if (!l0) return { source: "introuvable" as const, fiche: ficheJson, tacheId, provisoire: false, motif: lignes ? "Cette tâche n'existe pas dans la base." : "La base n'est pas joignable : impossible de vérifier cette tâche." };
    if (opts.audit && l0.audit_id !== opts.audit) return { source: "introuvable" as const, fiche: ficheJson, tacheId, provisoire: false, motif: "Cette tâche n'appartient pas à l'audit demandé." };
  }
  if (!lignes || lignes.length === 0) return { source: "exemple" as SourceDonnees, fiche: ficheJson, tacheId: ficheJson.tache_id, provisoire: false };
  const l = (tacheId && lignes.find((x) => x.id === tacheId)) || lignes.map((x) => ({ x, t: versTache(x) })).filter((a) => a.t).sort((a, b) => b.t!.score.total - a.t!.score.total)[0]?.x || lignes[0];
  if (l.fiche?.metier && l.fiche?.technique) return { source: "base" as SourceDonnees, fiche: l.fiche as typeof ficheJson, tacheId: l.id, provisoire: false };

  const s = l.score ?? {};
  const duree = l.duree_moyenne_s ?? 0;
  const f = JSON.parse(JSON.stringify(ficheJson)) as typeof ficheJson;
  const demo = /^Recopier une annonce/i.test(l.nom);
  f.id = `fiche_${l.id}`; f.tache_id = l.id; f.titre = l.nom.split(" — ")[0];
  f.score = s.total ?? 0; f.quadrant = s.quadrant ?? ""; f.confiance = s.confiance ?? 3;
  f.metier.heures_an = Math.round(s.heures_an ?? 0);
  f.metier.duree_aujourdhui = `${formatDuree(duree)} par opération (chronométré)`;
  f.metier.gain_attendu = `${Math.round(s.heures_an ?? 0)} h par an récupérables, selon les hypothèses ci-dessous.`;
  f.metier.hypotheses = (s.hypotheses ?? []).join(" ; ") || "À vérifier pendant l'audit.";
  f.technique.outil = l.methode ?? "rien";
  f.technique.preuve.duree_humaine_s = duree;
  if (demo) {
    f.metier.temps_par_an_h = Math.round((600 * duree) / 3600);
  } else {
    const etapes = l.sequence ?? [];
    f.metier.process = etapes.join(" → ") || "À décrire";
    f.metier.qui = "À confirmer"; f.metier.declencheur = "À confirmer";
    f.metier.frequence = `${l.occurrences ?? 0} occurrences observées`;
    f.metier.temps_par_an_h = 0;
    f.metier.impact_equipe = "À renseigner."; f.metier.temps_libere = "À renseigner.";
    f.technique.raison = (l.instructions_agent ?? "").slice(0, 160);
    f.technique.options_ecartees = []; f.technique.etapes = etapes;
    f.technique.entrees = "À renseigner."; f.technique.sorties = "À renseigner."; f.technique.vigilance = ["À préciser."];
    f.technique.effort = "À estimer"; f.technique.competence = "À définir : ";
    f.technique.recette = "À définir"; f.technique.cout_execution = "À estimer"; f.technique.maintenance = "À estimer";
  }
  return { source: "base" as SourceDonnees, fiche: f, tacheId: l.id, provisoire: (s.hypotheses ?? []).some((h) => /vérifier|provisoire/i.test(h)) };
}
