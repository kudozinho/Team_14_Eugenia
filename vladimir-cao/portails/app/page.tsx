import Link from 'next/link';
import { portailCourant } from '@/lib/portail';

export default function Accueil() {
  const p = portailCourant();
  return (
    <section className="accueil">
      <h1>{p.nom}</h1>
      <p className="sous-titre">{p.slogan}</p>
      <div className="actions" style={{ justifyContent: 'center' }}>
        <Link className="bouton" href={p.chemin}>{p.action}</Link>
        <Link className="bouton secondaire" href="/annonces">Annonces publiées</Link>
      </div>
    </section>
  );
}
