import Link from "next/link";
import { getAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type Personne = { id: string; prenom: string; nom: string; poste: string; equipe: string; date_arrivee: string | null; statut: string };

const initiales = (p: Personne) => `${p.prenom[0]}${p.nom[0]}`.toUpperCase();

export default async function AccueilRH() {
  const admin = getAdmin();
  if (!admin) {
    return <p role="alert">La connexion à la base n'est pas configurée sur ce serveur (clé de service absente).</p>;
  }
  const [{ data: personnes, error }, { data: arrivees }, { data: fiches }, { data: badges }, { data: acces }, { data: materiel }] = await Promise.all([
    admin.from("personnes").select("*").order("nom"),
    admin.from("arrivees").select("*"),
    admin.from("rh_fiches").select("personne_id,statut_fiche"),
    admin.from("rh_badges").select("personne_id,statut"),
    admin.from("rh_acces").select("personne_id,statut"),
    admin.from("rh_materiel").select("personne_id,statut"),
  ]);
  if (error) return <p role="alert">Erreur de lecture : {error.message}</p>;
  const liste = (personnes ?? []) as Personne[];
  const parId = new Map(liste.map((p) => [p.id, p]));
  const aPreparer = (arrivees ?? []).filter((a) => a.statut !== "terminee");
  const parEquipe = Object.entries(liste.reduce<Record<string, number>>((m, p) => ({ ...m, [p.equipe]: (m[p.equipe] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...parEquipe.map(([, n]) => n));

  return (
    <>
      <h1>Accueil RH</h1>

      <section style={{ margin: "24px 0" }}>
        <h2>Notifications d'arrivée</h2>
        {aPreparer.length === 0 && <p style={{ marginTop: 8 }}>Aucune arrivée à préparer.</p>}
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {aPreparer.map((a) => {
            const p = parId.get(a.personne_id);
            if (!p) return null;
            return (
              <article key={a.id} className="card notif">
                <h3>Nouvelle arrivée : {p.prenom} {p.nom}</h3>
                <p style={{ margin: "6px 0 12px" }}>
                  Poste : {p.poste}. Équipe : {p.equipe}. Date d'arrivée : {p.date_arrivee ?? "non renseignée"}. Statut : {a.statut}.
                </p>
                <Link href={`/intranet/rh/personnes/${p.id}`} className="btn btn-secondary">Ouvrir la fiche de {p.prenom}</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section style={{ margin: "28px 0" }}>
        <h2>Vue d'ensemble</h2>
        <div className="kpis">
          <div className="kpi"><b>{liste.length}</b><span>personnes dans l'entreprise</span></div>
          <div className="kpi"><b>{aPreparer.length}</b><span>arrivée à préparer</span></div>
          <div className="kpi"><b>{(fiches ?? []).filter((f) => f.statut_fiche === "creee").length}</b><span>fiches RH créées</span></div>
          <div className="kpi"><b>{(acces ?? []).length}</b><span>accès demandés ou accordés</span></div>
          <div className="kpi"><b>{(badges ?? []).filter((b) => b.statut !== "a_demander").length}</b><span>badges demandés ou prêts</span></div>
          <div className="kpi"><b>{(materiel ?? []).filter((m) => m.statut === "a_valider").length}</b><span>commande de matériel à valider</span></div>
        </div>
        <div className="bloc-equipes">
          <h3>Effectif par équipe</h3>
          {parEquipe.map(([e, n]) => (
            <div key={e} className="barre-equipe"><span>{e}</span><i style={{ width: `${(n / max) * 100}%` }} /><b>{n}</b></div>
          ))}
        </div>
      </section>

      <section id="personnes" style={{ margin: "32px 0" }}>
        <h2>Liste des personnes</h2>
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table className="table-rh">
            <thead>
              <tr>{["Prénom", "Nom", "Poste", "Équipe", "Statut", "Fiche"].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {liste.map((p) => (
                <tr key={p.id}>
                  <td><span className="avatar-rh">{initiales(p)}</span>{p.prenom}</td>
                  <td>{p.nom}</td>
                  <td>{p.poste}</td>
                  <td><span className="chip">{p.equipe}</span></td>
                  <td>{p.statut === "arrivee_prevue" ? "Arrivée prévue" : "En poste"}</td>
                  <td><Link href={`/intranet/rh/personnes/${p.id}`}>Ouvrir la fiche</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
