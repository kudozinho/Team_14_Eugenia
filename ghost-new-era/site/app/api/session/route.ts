import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase-admin";

const OUTILS = ["rh", "messagerie", "wiki", "navigateur", "notion", "slack", "gmail"];

// Crée une session d'observation et enregistre l'accord outil par outil.
// L'identité vient du jeton de connexion de la personne, vérifié côté serveur.
export async function POST(req: Request) {
  const admin = getAdmin();
  if (!admin) return NextResponse.json({ erreur: "Base non configurée sur le serveur." }, { status: 500 });

  const jeton = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  const { data: u } = await admin.auth.getUser(jeton);
  if (!u.user) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  const corps = (await req.json().catch(() => ({}))) as { accordes?: string[] };
  const accordes = (corps.accordes ?? []).filter((o) => OUTILS.includes(o));

  const { data: s, error } = await admin
    .from("sessions_audit")
    .insert({ user_id: u.user.id, outils_autorises: accordes, statut: "en_cours" })
    .select("id")
    .single();
  if (error || !s) return NextResponse.json({ erreur: error?.message ?? "Erreur" }, { status: 500 });

  const { error: e2 } = await admin
    .from("consentements")
    .insert(OUTILS.map((outil) => ({ session_id: s.id, outil, accorde: accordes.includes(outil) })));
  if (e2) return NextResponse.json({ erreur: e2.message }, { status: 500 });

  return NextResponse.json({ session_id: s.id, outils: accordes });
}
