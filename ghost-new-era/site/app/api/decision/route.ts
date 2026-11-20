import { NextResponse } from "next/server";
import { utilisateurDepuisRequete } from "@/lib/auth-serveur";
import { utilisateurDeProposition } from "@/lib/proprietaire";

// La personne répond à une question de l'agent, ou valide une action irréversible (commande de matériel).
export async function POST(req: Request) {
  const { admin, user } = await utilisateurDepuisRequete(req);
  if (!admin) return NextResponse.json({ erreur: "Base non configurée sur le serveur." }, { status: 500 });
  if (!user) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  const { id, reponse } = (await req.json().catch(() => ({}))) as { id?: string; reponse?: string };
  if (!id) return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });

  const { data: d } = await admin.from("decisions_humaines").select("*").eq("id", id).maybeSingle();
  const { data: run } = d?.run_id ? await admin.from("agents_runs").select("proposition_id").eq("id", d.run_id).maybeSingle() : { data: null };
  if (!d || !run?.proposition_id || (await utilisateurDeProposition(admin, run.proposition_id)) !== user.id)
    return NextResponse.json({ erreur: "Décision introuvable." }, { status: 404 });
  if (d.statut === "validee") return NextResponse.json({ ok: true });

  const validation = String(d.libelle).startsWith("Valider la commande");
  if (!validation && !reponse?.trim()) return NextResponse.json({ erreur: "Une réponse est nécessaire." }, { status: 400 });

  if (validation) {
    // Action irréversible : seule cette route, appelée par la personne connectée, passe le matériel à « valide ».
    const { data: p } = await admin.from("propositions").select("tache_id").eq("id", run.proposition_id).maybeSingle();
    const { data: t } = await admin.from("taches_detectees").select("declencheur_arrivee_id").eq("id", p?.tache_id ?? "").maybeSingle();
    const { data: a } = await admin.from("arrivees").select("personne_id").eq("id", t?.declencheur_arrivee_id ?? "").maybeSingle();
    if (a) await admin.from("rh_materiel").update({ statut: "valide" }).eq("personne_id", a.personne_id).eq("statut", "a_valider");
  }
  const { error } = await admin.from("decisions_humaines").update({ statut: "validee", reponse: validation ? "validée" : reponse!.trim() }).eq("id", id);
  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
