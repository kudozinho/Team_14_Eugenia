import { NextResponse } from "next/server";
import { utilisateurDepuisRequete } from "@/lib/auth-serveur";

// Enregistre la réponse de la personne (acceptée ou refusée) à une proposition de Ghost.
export async function POST(req: Request) {
  const { admin, user } = await utilisateurDepuisRequete(req);
  if (!admin) return NextResponse.json({ erreur: "Base non configurée sur le serveur." }, { status: 500 });
  if (!user) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  const { id, statut } = (await req.json().catch(() => ({}))) as { id?: string; statut?: string };
  if (!id || (statut !== "acceptee" && statut !== "refusee")) return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });

  // La proposition doit appartenir à une session de cette personne.
  const { data: p } = await admin.from("propositions").select("id,tache_id").eq("id", id).maybeSingle();
  const { data: t } = p ? await admin.from("taches_detectees").select("session_id").eq("id", p.tache_id).maybeSingle() : { data: null };
  const { data: s } = t ? await admin.from("sessions_audit").select("user_id").eq("id", t.session_id).maybeSingle() : { data: null };
  if (!s || s.user_id !== user.id) return NextResponse.json({ erreur: "Proposition introuvable." }, { status: 404 });

  const { error } = await admin.from("propositions").update({ statut }).eq("id", id);
  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
