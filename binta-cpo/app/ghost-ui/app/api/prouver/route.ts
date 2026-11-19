// Pont entre le site et le worker H hébergé.
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
  if (!c) return Response.json({ erreur: "Service agent H non configuré.", desactive: true }, { status: 503 });
  const non = refus(req); if (non) return non;
  // Démo publique bornée à la tâche configurée ; file sérialisée côté base.
  try {
  const r = await fetch(`${c.base.replace("executions_agent", "rpc/demander_agent")}`, {
    method: "POST", headers: c.entetes,
    body: JSON.stringify({ p_tache: tacheIdConfiguree() }), signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) return Response.json({ erreur: `Supabase a refusé la demande (${r.status})`, detail: "Vérifier que le service hébergé est connecté et qu’aucune exécution n’est en cours." }, { status: 502 });
  const [ligne] = await r.json();
  return Response.json({ mode: "reel", id: ligne.id });
  } catch { return Response.json({ erreur: "Le service H est momentanément inaccessible." }, { status: 503 }); }
}

// Relit CETTE ligne par son identifiant.
export async function GET(req: Request) {
  const c = config();
  if (!c) return Response.json({ erreur: "Service agent H non configuré.", desactive: true }, { status: 503 });
  const non = refus(req); if (non) return non;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[\w-]{1,64}$/.test(id)) return Response.json({ erreur: "identifiant invalide" }, { status: 400 });
  const r = await fetch(`${c.base}?id=eq.${encodeURIComponent(id)}`, { headers: c.entetes, cache: "no-store" });
  if (!r.ok) return Response.json({ erreur: `Lecture impossible (${r.status})` }, { status: 502 });
  const [ligne] = await r.json();
  if (!ligne) return Response.json({ erreur: "ligne introuvable" }, { status: 404 });
  return Response.json({ mode: "reel", ligne });
}
