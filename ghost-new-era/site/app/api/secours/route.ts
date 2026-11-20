import { NextResponse } from "next/server";
import { utilisateurDepuisRequete } from "@/lib/auth-serveur";
import { creerProposition } from "@/lib/proposer";

// Bouton de secours : si le partage d'écran n'est pas possible (navigateur, salle, réseau), la personne déclenche elle-même
// la proposition. Tout le reste est réel : vraie proposition, vrais agents H, vraies vérifications dans la base.
// La tâche est marquée « [secours] » et le rapport final le dit : la détection n'a alors pas été faite par Holo.
export async function POST(req: Request) {
  const { admin, user } = await utilisateurDepuisRequete(req);
  if (!admin) return NextResponse.json({ erreur: "Base non configurée sur le serveur." }, { status: 500 });
  if (!user) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  const { session_id } = (await req.json().catch(() => ({}))) as { session_id?: string };
  const { data: session } = await admin.from("sessions_audit").select("id,user_id,statut,outils_autorises").eq("id", session_id ?? "").maybeSingle();
  if (!session || session.user_id !== user.id) return NextResponse.json({ erreur: "Session introuvable." }, { status: 404 });
  if (session.statut !== "en_cours") return NextResponse.json({ erreur: "Session terminée." }, { status: 409 });
  if (!(session.outils_autorises as string[]).includes("rh")) return NextResponse.json({ erreur: "L'espace RH n'est pas autorisé." }, { status: 403 });

  const proposition = await creerProposition(admin, session.id, { libelle: "Arrivée de Karim (déclenchement manuel)", confiance: 1, secours: true });
  if (!proposition) return NextResponse.json({ erreur: "Aucune arrivée « nouvelle » : remets la démo à zéro (voir le README des agents)." }, { status: 409 });
  return NextResponse.json({ proposition });
}
