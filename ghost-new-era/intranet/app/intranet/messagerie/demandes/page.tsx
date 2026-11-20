// Demandes de parrain et de café d'accueil, avec l'annuaire pour trouver le manager de chacun.
import { connection } from "next/server";
import Entete, { Retour } from "../../_commun/Entete";
import ListeCanaux, { chargerCanaux } from "../_canaux";
import { supabaseServeur, listerPersonnes, dateHeure } from "../../_commun/serveur";
import { demanderParrain, proposerCafe } from "../actions";
import s from "../../_commun/intranet.module.css";

export default async function Demandes({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  await connection();
  const { ok, erreur } = await searchParams;
  const [canaux, personnes] = await Promise.all([chargerCanaux(), listerPersonnes()]);
  const { data: demandes, error } = await supabaseServeur()
    .from("msg_demandes")
    .select("id, type, personne_id, destinataire_id, statut, creneau")
    .order("id");
  if (error) throw new Error(error.message);

  const nom = (id: string | null) => {
    const p = personnes.find((x) => x.id === id);
    return p ? `${p.prenom} ${p.nom}` : "non renseigné";
  };
  const option = (p: (typeof personnes)[number]) => (
    <option key={p.id} value={p.id}>
      {p.prenom} {p.nom} ({p.poste}, {p.equipe})
    </option>
  );

  return (
    <>
      <Entete actif="messagerie" />
      <main className={s.page}>
        <h1>Demandes : parrain et café d&apos;accueil</h1>
        <p>Pour chaque arrivée : demander un parrain, puis proposer un créneau pour le café d&apos;accueil.</p>
        <Retour ok={ok} erreur={erreur} />
        <div className={s.grille}>
          <ListeCanaux canaux={canaux} actif="demandes" />
          <div>
            <section className={s.bloc}>
              <h2>Demander un parrain</h2>
              <form action={demanderParrain} className={s.formulaire}>
                <label>
                  Personne qui arrive
                  <select name="personne_id" required defaultValue="">
                    <option value="" disabled>Choisir une personne</option>
                    {personnes.map(option)}
                  </select>
                </label>
                <label>
                  Envoyer la demande à
                  <select name="destinataire_id" required defaultValue="">
                    <option value="" disabled>Choisir un destinataire</option>
                    {personnes.map(option)}
                  </select>
                </label>
                <button type="submit" className={s.bouton}>Envoyer la demande de parrain</button>
              </form>
            </section>

            <section className={s.bloc}>
              <h2>Proposer un café d&apos;accueil</h2>
              <form action={proposerCafe} className={s.formulaire}>
                <label>
                  Personne qui arrive
                  <select name="personne_id" required defaultValue="">
                    <option value="" disabled>Choisir une personne</option>
                    {personnes.map(option)}
                  </select>
                </label>
                <label>
                  Inviter
                  <select name="destinataire_id" defaultValue="">
                    <option value="">Toute l&apos;équipe</option>
                    {personnes.map(option)}
                  </select>
                </label>
                <label>
                  Créneau (heure de Paris)
                  <input type="datetime-local" name="creneau" required />
                </label>
                <button type="submit" className={s.bouton}>Proposer le café</button>
              </form>
            </section>

            <section className={s.bloc}>
              <h2>Demandes envoyées</h2>
              <table className={s.tableau}>
                <thead>
                  <tr><th>Type</th><th>Pour</th><th>Envoyée à</th><th>Créneau</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {(demandes ?? []).map((d) => (
                    <tr key={d.id}>
                      <td>{d.type === "parrain" ? "Parrain" : "Café"}</td>
                      <td>{nom(d.personne_id)}</td>
                      <td>{d.destinataire_id ? nom(d.destinataire_id) : "Toute l'équipe"}</td>
                      <td>{d.creneau ? dateHeure(d.creneau) : "-"}</td>
                      <td><span className={s.badge}>{d.statut === "acceptee" ? "Acceptée" : "Envoyée"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className={s.bloc}>
              <h2>Annuaire</h2>
              <table className={s.tableau}>
                <thead>
                  <tr><th>Personne</th><th>Poste</th><th>Équipe</th><th>Manager</th></tr>
                </thead>
                <tbody>
                  {personnes.map((p) => (
                    <tr key={p.id}>
                      <td>{p.prenom} {p.nom}{p.statut === "arrivee_prevue" ? " (arrivée prévue)" : ""}</td>
                      <td>{p.poste}</td>
                      <td>{p.equipe}</td>
                      <td>{p.manager_id ? nom(p.manager_id) : "Non renseigné"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
