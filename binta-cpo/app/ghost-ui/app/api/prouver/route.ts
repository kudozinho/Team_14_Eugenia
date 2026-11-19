// Pont entre le site et le worker H hébergé.
// La clé « service » de Supabase reste ICI, côté serveur : jamais dans le navigateur.
// Le navigateur ne choisit pas la tâche : on utilise celle configurée (TACHE_ID), pour qu'un visiteur
// ne puisse pas lancer l'agent sur n'importe quoi.
import { createHash, timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Contrôle d'accès : lancer l'agent coûte de l'argent et publie des annonces.
// - PROUVER_CODE défini (16 caractères ou plus) : le code est exigé (en-tête Authorization: Bearer <code>), en local comme en ligne.
// - PROUVER_CODE absent : le bouton ne marche que sur l'ordinateur de démo (localhost). Sur une adresse publique, il est refusé.
function egal(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}
function refus(req: Request): Response | null {
  const code = process.env.PROUVER_CODE;
  if (code) {
    if (code.length < 16) return Response.json({ erreur: "PROUVER_CODE trop court (16 caractères minimum).", desactive: true }, { status: 503 });
    const fourni = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    return fourni && egal(fourni, code) ? null : Response.json({ erreur: "Code d'accès incorrect ou manquant.", code_requis: true }, { status: 401 });
  }
  const hote = (req.headers.get("host") ?? "").replace(/:\d+$/, "").toLowerCase();
  if (["localhost", "127.0.0.1", "[::1]"].includes(hote)) return null;
  return Response.json({ erreur: "Le bouton « Prouver » est désactivé sur ce site public (aucun code d'accès configuré).", desactive: true }, { status: 401 });
}

function config() {
  const url = process.env.SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) return null;
  return {
    base: `${url}/rest/v1/executions_agent`,
    entetes: { apikey: cle, Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
  };
}

const DEMO_TASK = "tache_a1a0c7545c805f328eba1e25";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function worker() {
  const url = process.env.GHOST_WORKER_URL;
  const token = process.env.GHOST_WORKER_TOKEN;
  if (!url || !token || token.length < 32) return null;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.hostname === "localhost")) return null;
  return { url: url.replace(/\/$/, ""), headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } };
}
function error(message: string, status = 503) { return Response.json({ erreur: message }, { status }); }
async function dispatch(id: string) {
  const w = worker(); if (!w) return;
  try { await fetch(`${w.url}/run`, { method: "POST", headers: w.headers, body: JSON.stringify({ id }), signal: AbortSignal.timeout(6000) }); }
  catch { /* La demande existe : le suivi retentera uniquement cette même prise atomique. */ }
}

export async function POST(req: Request) {
  const non = refus(req); if (non) return non;
  const c = config();
  if (!c || process.env.TACHE_ID !== DEMO_TASK) return error("Configurer la tâche réelle de démonstration et la base.");
  let b;
  try { b = await req.json(); } catch { return error("Demande invalide.", 400); }
  if (!b || typeof b !== "object") return error("Demande invalide.", 400);
  if (!uuid.test(b.cle_demande ?? "") || (b.tache_id && b.tache_id !== DEMO_TASK)) return error("Tâche ou clé de demande invalide.", 400);
  try {
    // Retrouver une demande AVANT toute admission : une réponse perdue ne consomme jamais un second essai.
    const prior = await fetch(`${c.base}?cle_demande=eq.${encodeURIComponent(b.cle_demande)}&tache_id=eq.${DEMO_TASK}`, { headers: c.entetes, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!prior.ok) return error("Migration ou base indisponible.");
    const [existing] = await prior.json();
    if (existing) {
      if (existing.statut === "en_cours" && existing.resume === "HTTP_PENDING") await dispatch(existing.id);
      return Response.json({ mode: "reel", id: existing.id });
    }
    const w = worker(); if (!w) return error("Backend H non configuré. Aucun lancement effectué.");
    try {
      const ready = await fetch(`${w.url}/ready`, { headers: w.headers, signal: AbortSignal.timeout(6000), cache: "no-store" });
      if (!ready.ok) return error("Backend H ou migration indisponible.");
    } catch {
      // Réveil demandé mais aucune ligne créée : le navigateur réessaie la même clé, dans une fenêtre bornée.
      return Response.json({ preparation: true, erreur: "Préparation du service gratuit…" }, { status: 202 });
    }
    const r = await fetch(c.base.replace("executions_agent", "rpc/demander_agent_http"), {
      method: "POST", headers: c.entetes, body: JSON.stringify({ p_tache: DEMO_TASK, p_cle: b.cle_demande }), signal: AbortSignal.timeout(6000),
    });
    const data = await r.json();
    if (!r.ok) {
      if (data.message === "NO_CONFIRMED_CREDITS") return Response.json({ credits_indisponibles: true }, { status: 402 });
      if (data.message === "BUSY_OR_REVIEW") return error("Une exécution est en cours ou nécessite une vérification avant reprise.", 409);
      return error("Lancement refusé par la base. Vérifier le service, la migration et la tâche.");
    }
    const [line] = data;
    if (!line?.id) return error("Réponse de la base incomplète ; conserver la clé de demande.");
    await dispatch(line.id);
    return Response.json({ mode: "reel", id: line.id });
  } catch { return error("Service inaccessible ; la demande a pu être créée. Conservez la même clé pour la retrouver."); }
}

export async function GET(req: Request) {
  const non = refus(req); if (non) return non;
  const c = config(); if (!c || process.env.TACHE_ID !== DEMO_TASK) return error("Service non configuré.");
  const params = new URL(req.url).searchParams;
  const id = params.get("id"), key = params.get("cle_demande");
  if (id ? !/^[\w-]{1,64}$/.test(id) : !uuid.test(key ?? "")) return error("Identifiant invalide.", 400);
  try {
    const filter = id ? `id=eq.${encodeURIComponent(id)}` : `cle_demande=eq.${encodeURIComponent(key!)}`;
    const r = await fetch(`${c.base}?${filter}&tache_id=eq.${DEMO_TASK}`, { headers: c.entetes, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!r.ok) return error("Lecture impossible.");
    const [line] = await r.json(); if (!line) return error("Demande introuvable.", 404);
    if (line.statut === "en_cours" && line.resume === "HTTP_PENDING") await dispatch(line.id);
    return Response.json({ mode: "reel", ligne: line });
  } catch { return error("Lecture temporairement indisponible."); }
}
