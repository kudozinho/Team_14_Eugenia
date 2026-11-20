// Créer une page du wiki (par exemple « Bienvenue Karim »).
import Link from "next/link";
import Entete, { Retour } from "../../_commun/Entete";
import { creerPage } from "../actions";
import s from "../../_commun/intranet.module.css";

export default async function NouvellePage({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const { ok, erreur } = await searchParams;
  return (
    <>
      <Entete actif="wiki" />
      <main className={s.page}>
        <p><Link href="/intranet/wiki">Retour au wiki</Link></p>
        <h1 style={{ marginTop: 12 }}>Créer une page</h1>
        <Retour ok={ok} erreur={erreur} />
        <section className={s.bloc} style={{ marginTop: 24 }}>
          <form action={creerPage} className={s.formulaire}>
            <label>
              Titre
              <input name="titre" required placeholder="ex. Bienvenue Karim" />
            </label>
            <label>
              Espace
              <select name="espace" defaultValue="Accueil">
                <option>Accueil</option>
                <option>Général</option>
                <option>RH</option>
                <option>Tech</option>
                <option>Ventes</option>
              </select>
            </label>
            <label>
              Rôle visé
              <input name="role_cible" placeholder="ex. Commercial" />
            </label>
            <label>
              Mots-clés (séparés par des virgules)
              <input name="tags" placeholder="ex. accueil, onboarding" />
            </label>
            <label>
              Auteur
              <input name="cree_par" defaultValue="Ghost, pour Sophie Durand" />
            </label>
            <label>
              Contenu
              <textarea name="contenu" placeholder="Le texte de la page" />
            </label>
            <button type="submit" className={s.bouton}>Créer la page</button>
          </form>
        </section>
      </main>
    </>
  );
}
