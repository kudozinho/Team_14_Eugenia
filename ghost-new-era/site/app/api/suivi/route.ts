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
  return NextResponse.json({ runs: runs ?? [], evenements: evenements ?? [], decisions: decisions ?? [] });
}
