// En-tête commun de l'intranet de test : bandeau visible et navigation entre les 3 espaces.
import Link from "next/link";
import s from "./intranet.module.css";

type Espace = "rh" | "messagerie" | "wiki";

export default function Entete({ actif }: { actif: Espace }) {
  const lien = (cle: Espace, href: string, libelle: string) => (
    <Link href={href} className={`${s.navLien} ${actif === cle ? s.navActif : ""}`}>
      {libelle}
    </Link>
  );
  return (
    <>
      <div className="bandeau-test">Environnement de test fictif : Atelier Nova n&apos;existe pas</div>
      <nav className={s.nav} aria-label="Espaces de l'intranet">
        <strong>Intranet Atelier Nova</strong>
        {lien("rh", "/intranet/rh", "Espace RH")}
        {lien("messagerie", "/intranet/messagerie", "Messagerie")}
        {lien("wiki", "/intranet/wiki", "Wiki")}
      </nav>
    </>
  );
}

export function Retour({ ok, erreur }: { ok?: string; erreur?: string }) {
  if (erreur) return <p className={s.erreur} role="alert">Erreur : {erreur}</p>;
  if (ok) return <p className={s.succes} role="status">{ok}</p>;
  return null;
}
