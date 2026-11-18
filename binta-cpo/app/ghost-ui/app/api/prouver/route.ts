// Pont entre le bouton « Prouver » et le script d'Alejandro (attendre_prouver.py).
// La clé « service » de Supabase reste ICI, côté serveur : jamais dans le navigateur.
// Le navigateur ne choisit pas la tâche : on utilise celle configurée (TACHE_ID), pour qu'un visiteur
// ne puisse pas lancer l'agent sur n'importe quoi.
import { tacheIdConfiguree } from "@/lib/tache";

export const dynamic = "force-dynamic";

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
export async function POST() {
  const c = config();
  if (!c) return Response.json({ mode: "exemple" }); // pas de clés : l'interface joue la simulation
  const r = await fetch(c.base, {
    method: "POST",
    headers: { ...c.entetes, Prefer: "return=representation" },
    body: JSON.stringify({ tache_id: tacheIdConfiguree(), statut: "en_cours" }),
  });
  if (!r.ok) return Response.json({ erreur: `Supabase a refusé la demande (${r.status})`, detail: await r.text() }, { status: 502 });
  const [ligne] = await r.json();
  return Response.json({ mode: "reel", id: ligne.id });
}

// Relit CETTE ligne par son identifiant.
export async function GET(req: Request) {
  const c = config();
  if (!c) return Response.json({ mode: "exemple" });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[\w-]{1,64}$/.test(id)) return Response.json({ erreur: "identifiant invalide" }, { status: 400 });
  const r = await fetch(`${c.base}?id=eq.${encodeURIComponent(id)}`, { headers: c.entetes, cache: "no-store" });
  if (!r.ok) return Response.json({ erreur: `Lecture impossible (${r.status})` }, { status: 502 });
  const [ligne] = await r.json();
  if (!ligne) return Response.json({ erreur: "ligne introuvable" }, { status: 404 });
  return Response.json({ mode: "reel", ligne });
}
