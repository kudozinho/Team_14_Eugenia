// Accueil de la messagerie : liste des canaux et rôle de chacun.
import Link from "next/link";
import { connection } from "next/server";
import Entete from "../_commun/Entete";
import ListeCanaux, { chargerCanaux } from "./_canaux";
import s from "../_commun/intranet.module.css";

export default async function Messagerie() {
  await connection();
  const canaux = await chargerCanaux();
  return (
    <>
      <Entete actif="messagerie" />
      <main className={s.page}>
        <h1>Messagerie d&apos;équipe</h1>
        <p>Choisis un canal pour lire et publier des messages, ou ouvre les demandes de parrain et de café.</p>
        <div className={s.grille}>
          <ListeCanaux canaux={canaux} />
          <section className={s.bloc}>
            <h2>Tous les canaux</h2>
            <table className={s.tableau}>
              <thead>
                <tr><th>Canal</th><th>À quoi il sert</th></tr>
              </thead>
              <tbody>
                {canaux.map((c) => (
                  <tr key={c.id}>
                    <td><Link href={`/intranet/messagerie/${c.id}`}>{c.nom}</Link></td>
                    <td>{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </>
  );
}
