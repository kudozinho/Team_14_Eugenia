// Pont entre le bouton « Prouver » et le script d'Alejandro (attendre_prouver.py).
// La clé « service » de Supabase reste ICI, côté serveur : jamais dans le navigateur.
// Le navigateur ne choisit pas la tâche : on utilise celle configurée (TACHE_ID), pour qu'un visiteur
// ne puisse pas lancer l'agent sur n'importe quoi.
import { createHash, timingSafeEqual } from "node:crypto";
import { tacheIdConfiguree } from "@/lib/tache";

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

// Crée la demande : une ligne « en_cours ». Le script d'Alejandro la voit et lance l'agent.
export async function POST(req: Request) {
  const c = config();
  if (!c) return Response.json({ mode: "exemple" }); // pas de clés : l'interface joue la simulation
  const non = refus(req); if (non) return non;
  // La tâche demandée doit EXISTER dans taches_detectees (sinon on prend celle configurée).
  let tacheId = tacheIdConfiguree();
  try {
    const { tache_id } = await req.json();
    if (typeof tache_id === "string" && /^[\w-]{1,80}$/.test(tache_id)) {
      const t = await fetch(`${c.base.replace("executions_agent", "taches_detectees")}?select=id&id=eq.${encodeURIComponent(tache_id)}`, { headers: c.entetes, cache: "no-store" });
      if (t.ok && ((await t.json()) as unknown[]).length) tacheId = tache_id;
    }
  } catch { /* corps absent : tâche configurée */ }
  const r = await fetch(c.base, {
    method: "POST",
    headers: { ...c.entetes, Prefer: "return=representation" },
    body: JSON.stringify({ tache_id: tacheId, statut: "en_cours" }),
  });
  if (!r.ok) return Response.json({ erreur: `Supabase a refusé la demande (${r.status})`, detail: await r.text() }, { status: 502 });
  const [ligne] = await r.json();
  return Response.json({ mode: "reel", id: ligne.id });
}

// Relit CETTE ligne par son identifiant.
export async function GET(req: Request) {
  const c = config();
  if (!c) return Response.json({ mode: "exemple" });
  const non = refus(req); if (non) return non;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[\w-]{1,64}$/.test(id)) return Response.json({ erreur: "identifiant invalide" }, { status: 400 });
  const r = await fetch(`${c.base}?id=eq.${encodeURIComponent(id)}`, { headers: c.entetes, cache: "no-store" });
  if (!r.ok) return Response.json({ erreur: `Lecture impossible (${r.status})` }, { status: 502 });
  const [ligne] = await r.json();
  if (!ligne) return Response.json({ erreur: "ligne introuvable" }, { status: 404 });
  return Response.json({ mode: "reel", ligne });
}
