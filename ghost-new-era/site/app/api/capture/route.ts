import { NextResponse } from "next/server";
import { lireCapture } from "@/lib/holo";
import { utilisateurDepuisRequete } from "@/lib/auth-serveur";

export const maxDuration = 30;

// Reçoit une capture (JPEG en base64), la fait lire par Holo, ne garde que le RÉSUMÉ (jamais l'image).
// Une proposition n'est créée que si Holo voit la notification ET si la base confirme une arrivée « nouvelle »
// ET si l'espace RH est autorisé par la personne.
export async function POST(req: Request) {
  const { admin, user } = await utilisateurDepuisRequete(req);
  if (!admin) return NextResponse.json({ erreur: "Base non configurée sur le serveur." }, { status: 500 });
  if (!user) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  const { session_id, image } = (await req.json().catch(() => ({}))) as { session_id?: string; image?: string };
  if (!session_id || !image) return NextResponse.json({ erreur: "session_id et image requis." }, { status: 400 });

  const { data: session } = await admin.from("sessions_audit").select("id,user_id,outils_autorises,statut").eq("id", session_id).maybeSingle();
  if (!session || session.user_id !== user.id) return NextResponse.json({ erreur: "Session introuvable." }, { status: 404 });
  if (session.statut !== "en_cours") return NextResponse.json({ erreur: "Session terminée." }, { status: 409 });

  let lecture;
  try {
    lecture = await lireCapture(image.replace(/^data:image\/\w+;base64,/, ""));
  } catch (e) {
    return NextResponse.json({ erreur: e instanceof Error ? e.message : "Lecture impossible." }, { status: 502 });
  }

  await admin.from("captures_lues").insert({ session_id, resume_holo: lecture.resume, latence_ms: lecture.latence_ms, memoire: false });

  let proposition: { id: string; texte: string } | null = null;
  if (lecture.declencheur === "arrivee_karim" && (session.outils_autorises as string[]).includes("rh")) {
    const { data: arrivee } = await admin.from("arrivees").select("id").eq("statut", "nouvelle").limit(1).maybeSingle();
    if (arrivee) {
      const { data: deja } = await admin.from("taches_detectees").select("id").eq("session_id", session_id).eq("declencheur_arrivee_id", arrivee.id).maybeSingle();
      if (!deja) {
        const { data: tache } = await admin.from("taches_detectees")
          .insert({ session_id, libelle: lecture.tache || "Préparer l'onboarding", outils: ["Espace RH"], confiance: lecture.confiance, declencheur_arrivee_id: arrivee.id })
          .select("id").single();
        if (tache) {
          const texte = "Je prépare l'onboarding de Karim comme pour Léa ?";
          const { data: p } = await admin.from("propositions").insert({ tache_id: tache.id, texte }).select("id").single();
          if (p) proposition = { id: p.id, texte };
        }
      }
    }
  }

  return NextResponse.json({ resume: lecture.resume, tache: lecture.tache, latence_ms: lecture.latence_ms, proposition });
}
