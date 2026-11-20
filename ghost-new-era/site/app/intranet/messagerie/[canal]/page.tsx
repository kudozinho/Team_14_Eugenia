// Un canal : les messages du plus ancien au plus récent, puis le formulaire « Écrire un message ».
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Entete, { Retour } from "../../_commun/Entete";
import ListeCanaux, { chargerCanaux } from "../_canaux";
import { supabaseServeur, dateHeure } from "../../_commun/serveur";
import { publierMessage } from "../actions";
import s from "../../_commun/intranet.module.css";

export default async function PageCanal({
  params,
  searchParams,
}: {
  params: Promise<{ canal: string }>;
  searchParams: Promise<{ ok?: string; erreur?: string }>;
}) {
  await connection();
  const { canal } = await params;
  const { ok, erreur } = await searchParams;
  const canaux = await chargerCanaux();
  const courant = canaux.find((c) => c.id === canal);
  if (!courant) notFound();

  const { data: messages, error } = await supabaseServeur()
    .from("msg_messages")
    .select("id, auteur, texte, cree_le")
    .eq("canal_id", canal)
    .order("cree_le", { ascending: true });
  if (error) throw new Error(error.message);

  return (
    <>
      <Entete actif="messagerie" />
      <main className={s.page}>
        <h1>{courant.nom}</h1>
        <p>{courant.description}</p>
        <Retour ok={ok} erreur={erreur} />
        <div className={s.grille}>
          <ListeCanaux canaux={canaux} actif={canal} />
          <div>
            <section className={s.bloc} aria-label="Messages du canal">
              <h2>Messages</h2>
              {messages && messages.length > 0 ? (
                <ul className={s.liste}>
                  {messages.map((m) => (
                    <li key={m.id}>
                      <strong>{m.auteur}</strong> <span className={s.meta}>· {dateHeure(m.cree_le)}</span>
                      <p className={s.contenu}>{m.texte}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucun message dans ce canal pour l&apos;instant.</p>
              )}
            </section>
            <section className={s.bloc}>
              <h2>Écrire un message</h2>
              <form action={publierMessage} className={s.formulaire}>
                <input type="hidden" name="canal" value={canal} />
                <label>
                  Auteur
                  <input name="auteur" defaultValue="Ghost, pour Sophie Durand" required />
                </label>
                <label>
                  Message
                  <textarea name="texte" required placeholder="Écris ton message ici" />
                </label>
                <button type="submit" className={s.bouton}>Publier le message</button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
