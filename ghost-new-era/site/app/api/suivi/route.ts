import { NextResponse } from "next/server";
import { utilisateurDepuisRequete } from "@/lib/auth-serveur";
import { utilisateurDeProposition } from "@/lib/proprietaire";

// Ce que le portail affiche : les agents, leurs événements (déjà vérifiés dans l'outil) et les décisions humaines.
export async function GET(req: Request) {
  const { admin, user } = await utilisateurDepuisRequete(req);
  if (!admin) return NextResponse.json({ erreur: "Base non configurée sur le serveur." }, { status: 500 });
  if (!user) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });

  const proposition = new URL(req.url).searchParams.get("proposition");
  if (!proposition || (await utilisateurDeProposition(admin, proposition)) !== user.id)
    return NextResponse.json({ erreur: "Proposition introuvable." }, { status: 404 });

  const { data: runs } = await admin.from("agents_runs").select("*").eq("proposition_id", proposition).order("debut");
  const ids = (runs ?? []).map((r) => r.id);
  const [{ data: evenements }, { data: decisions }] = ids.length
    ? await Promise.all([
        admin.from("agents_evenements").select("*").in("run_id", ids).order("horodatage"),
        admin.from("decisions_humaines").select("*").in("run_id", ids),
      ])
    : [{ data: [] }, { data: [] }];

  // Données du rapport final : preuve dans la base, profil de la personne, état du matériel.
  const { data: prop } = await admin.from("propositions").select("tache_id").eq("id", proposition).maybeSingle();
  const { data: tache } = await admin.from("taches_detectees").select("declencheur_arrivee_id").eq("id", prop?.tache_id ?? "").maybeSingle();
  const { data: arrivee } = await admin.from("arrivees").select("personne_id").eq("id", tache?.declencheur_arrivee_id ?? "").maybeSingle();
  let rapport = null;
  if (arrivee) {
    const [{ data: lignes }, { data: pers }, { data: profil }, { data: materiel }] = await Promise.all([
      admin.from("v_onboarding").select("element,present").eq("personne_id", arrivee.personne_id),
      admin.from("personnes").select("prenom,nom,poste").eq("id", arrivee.personne_id).maybeSingle(),
      admin.from("profils").select("onboardings_par_an").eq("user_id", user.id).maybeSingle(),
      admin.from("rh_materiel").select("article,statut").eq("personne_id", arrivee.personne_id),
    ]);
    rapport = {
      personne: pers,
      preuve: Object.fromEntries((lignes ?? []).map((l) => [l.element, l.present])),
      onboardings_par_an: profil?.onboardings_par_an ?? null,
      materiel: materiel ?? [],
    };
  }
  return NextResponse.json({ runs: runs ?? [], evenements: evenements ?? [], decisions: decisions ?? [], rapport });
}
