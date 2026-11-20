// Checklists d'arrivée : jour 1, semaine 1, mois 1, pour une personne choisie.
import Link from "next/link";
import { connection } from "next/server";
import Entete, { Retour } from "../../_commun/Entete";
import { supabaseServeur, listerPersonnes } from "../../_commun/serveur";
import { ajouterLigne, basculerLigne } from "../actions";
import s from "../../_commun/intranet.module.css";

const PERIODES = [
  { id: "jour1", libelle: "Jour 1" },
  { id: "semaine1", libelle: "Semaine 1" },
  { id: "mois1", libelle: "Mois 1" },
];

export default async function Checklists({
  searchParams,
}: {
  searchParams: Promise<{ personne?: string; ok?: string; erreur?: string }>;
}) {
  await connection();
  const { personne = "", ok, erreur } = await searchParams;
  const personnes = await listerPersonnes();
  const choisie = personnes.find((p) => p.id === personne);

  const { data: lignes, error } = choisie
    ? await supabaseServeur()
        .from("wiki_checklists")
        .select("id, periode, libelle, coche")
        .eq("personne_id", choisie.id)
        .order("id")
    : { data: [], error: null };
  if (error) throw new Error(error.message);

  return (
    <>
      <Entete actif="wiki" />
      <main className={s.page}>
        <p><Link href="/intranet/wiki">Retour au wiki</Link></p>
        <h1 style={{ marginTop: 12 }}>Checklists d&apos;arrivée</h1>
        <Retour ok={ok} erreur={erreur} />
        <section className={s.bloc} style={{ marginTop: 24 }}>
          <h2>Choisir une personne</h2>
          <form method="get" className={s.formulaire}>
            <label>
              Personne
              <select name="personne" defaultValue={personne}>
                <option value="">Choisir une personne</option>
                {personnes.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom} ({p.poste})</option>
                ))}
              </select>
            </label>
            <button type="submit" className={s.bouton}>Afficher sa checklist</button>
          </form>
        </section>

        {choisie && (
          <>
            {PERIODES.map((per) => {
              const items = (lignes ?? []).filter((l) => l.periode === per.id);
              return (
                <section key={per.id} className={s.bloc}>
                  <h2>{per.libelle} : {choisie.prenom} {choisie.nom}</h2>
                  {items.length === 0 ? (
                    <p>Aucune ligne pour cette période.</p>
                  ) : (
                    <ul className={s.liste}>
                      {items.map((l) => (
                        <li key={l.id}>
                          <form action={basculerLigne} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <input type="hidden" name="id" value={l.id} />
                            <input type="hidden" name="personne_id" value={choisie.id} />
                            <input type="hidden" name="coche" value={l.coche ? "non" : "oui"} />
                            <span className={s.badge}>{l.coche ? "Fait" : "À faire"}</span>
                            <span>{l.libelle}</span>
                            <button type="submit" className={s.boutonSecondaire}>{l.coche ? "Décocher" : "Cocher"}</button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
            <section className={s.bloc}>
              <h2>Ajouter une ligne</h2>
              <form action={ajouterLigne} className={s.formulaire}>
                <input type="hidden" name="personne_id" value={choisie.id} />
                <label>
                  Période
                  <select name="periode" defaultValue="jour1">
                    {PERIODES.map((p) => (
                      <option key={p.id} value={p.id}>{p.libelle}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Libellé
                  <input name="libelle" required placeholder="ex. Récupérer son badge" />
                </label>
                <button type="submit" className={s.bouton}>Ajouter la ligne</button>
              </form>
            </section>
          </>
        )}
      </main>
    </>
  );
}
