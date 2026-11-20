// Wiki : recherche par rôle et par mot, liste des pages, accès à la création et aux checklists.
import Link from "next/link";
import { connection } from "next/server";
import Entete, { Retour } from "../_commun/Entete";
import { supabaseServeur } from "../_commun/serveur";
import s from "../_commun/intranet.module.css";

export default async function Wiki({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; ok?: string; erreur?: string }>;
}) {
  await connection();
  const { role = "", q = "", ok, erreur } = await searchParams;

  const db = supabaseServeur();
  const { data: roles } = await db.from("wiki_pages").select("role_cible");
  const listeRoles = [...new Set((roles ?? []).map((r) => r.role_cible).filter(Boolean))].sort();

  let requete = db.from("wiki_pages").select("id, titre, espace, role_cible, tags, cree_par").order("espace").order("titre");
  if (role) requete = requete.eq("role_cible", role);
  if (q) requete = requete.or(`titre.ilike.%${q.replace(/[%,()]/g, " ")}%,contenu.ilike.%${q.replace(/[%,()]/g, " ")}%`);
  const { data: pages, error } = await requete;
  if (error) throw new Error(error.message);

  return (
    <>
      <Entete actif="wiki" />
      <main className={s.page}>
        <h1>Wiki d&apos;Atelier Nova</h1>
        <p>
          Les documents de l&apos;entreprise. <Link href="/intranet/wiki/nouvelle">Créer une page</Link> ·{" "}
          <Link href="/intranet/wiki/checklists">Checklists d&apos;arrivée</Link>
        </p>
        <Retour ok={ok} erreur={erreur} />
        <section className={s.bloc} style={{ marginTop: 24 }}>
          <h2>Rechercher</h2>
          <form method="get" className={s.formulaire}>
            <label>
              Rôle
              <select name="role" defaultValue={role}>
                <option value="">Tous les rôles</option>
                {listeRoles.map((r) => (
                  <option key={r} value={r!}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              Mot-clé
              <input name="q" defaultValue={q} placeholder="ex. devis, CRM, sécurité" />
            </label>
            <button type="submit" className={s.bouton}>Rechercher</button>
          </form>
        </section>
        <section className={s.bloc}>
          <h2>Pages ({pages?.length ?? 0})</h2>
          <table className={s.tableau}>
            <thead>
              <tr><th>Titre</th><th>Espace</th><th>Rôle</th><th>Auteur</th></tr>
            </thead>
            <tbody>
              {(pages ?? []).map((p) => (
                <tr key={p.id}>
                  <td><Link href={`/intranet/wiki/page/${p.id}`}>{p.titre}</Link></td>
                  <td>{p.espace}</td>
                  <td>{p.role_cible ?? "-"}</td>
                  <td>{p.cree_par ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
