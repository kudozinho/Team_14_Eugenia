import Link from "next/link";
import { getAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type Personne = { id: string; prenom: string; nom: string; poste: string; equipe: string; date_arrivee: string | null; statut: string };

export default async function AccueilRH() {
  const admin = getAdmin();
  if (!admin) {
    return <p role="alert">La connexion à la base n'est pas configurée sur ce serveur (clé de service absente).</p>;
  }
  const [{ data: personnes, error }, { data: arrivees }] = await Promise.all([
    admin.from("personnes").select("*").order("nom"),
    admin.from("arrivees").select("*").neq("statut", "terminee"),
  ]);
  if (error) return <p role="alert">Erreur de lecture : {error.message}</p>;
  const liste = (personnes ?? []) as Personne[];
  const parId = new Map(liste.map((p) => [p.id, p]));

  return (
    <>
      <h1>Accueil RH</h1>

      <section style={{ margin: "24px 0" }}>
        <h2>Notifications d'arrivée</h2>
        {(arrivees ?? []).length === 0 && <p style={{ marginTop: 8 }}>Aucune arrivée à préparer.</p>}
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {(arrivees ?? []).map((a) => {
            const p = parId.get(a.personne_id);
            if (!p) return null;
            return (
              <article key={a.id} className="card">
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

      <section id="personnes" style={{ margin: "32px 0" }}>
        <h2>Liste des personnes</h2>
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
            <thead>
              <tr>{["Prénom", "Nom", "Poste", "Équipe", "Statut", "Fiche"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--line-2)" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {liste.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{p.prenom}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{p.nom}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{p.poste}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{p.equipe}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>{p.statut === "arrivee_prevue" ? "Arrivée prévue" : "En poste"}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}><Link href={`/intranet/rh/personnes/${p.id}`}>Ouvrir la fiche</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
