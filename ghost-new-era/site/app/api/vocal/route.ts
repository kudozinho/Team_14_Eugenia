import { NextResponse } from "next/server";
import { utilisateurDepuisRequete } from "@/lib/auth-serveur";

// Enregistre ce que la personne a dit (transcription faite dans son navigateur). Aucun son n'est envoyé ni conservé.
export async function POST(req: Request) {
  const { admin, user } = await utilisateurDepuisRequete(req);
  if (!admin) return NextResponse.json({ erreur: "Base non configurée sur le serveur." }, { status: 500 });
  if (!user) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  const { session_id, texte } = (await req.json().catch(() => ({}))) as { session_id?: string; texte?: string };
  const t = (texte ?? "").trim().slice(0, 1000);
  if (!session_id || !t) return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  const { data: s } = await admin.from("sessions_audit").select("user_id").eq("id", session_id).maybeSingle();
  if (!s || s.user_id !== user.id) return NextResponse.json({ erreur: "Session introuvable." }, { status: 404 });

  const { error } = await admin.from("vocaux").insert({ session_id, transcription: t });
  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
