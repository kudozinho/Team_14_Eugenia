import Link from 'next/link';
import { portailCourant } from '@/lib/portail';
import { listerAnnonces, idsAvecPhoto } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Annonces publiées' };

const euros = (n: number | null) => (n == null ? '-' : `${n.toLocaleString('fr-FR')} €`);

export default async function AnnoncesPubliees() {
  const p = portailCourant();
  const [annonces, photos] = await Promise.all([
    listerAnnonces(p.nom),
    p.code === 'C' ? idsAvecPhoto() : Promise.resolve(new Set<string>()),
  ]);
  return (
    <>
      <h1>Annonces publiées</h1>
      <p className="sous-titre">
        {annonces.length} annonce{annonces.length > 1 ? 's' : ''} sur {p.nom}, la plus récente en premier.
      </p>
      {annonces.length === 0 ? (
        <div className="vide">
          Aucune annonce pour l'instant. <Link href={p.chemin}>{p.action}</Link>
        </div>
      ) : (
        <div className="liste">
          {annonces.map((a) => (
            <article className="annonce" key={a.id} data-annonce-id={a.id}>
              <h2><Link href={`/annonces/${a.id}`}>{a.titre}</Link></h2>
              <div className="meta">
                <span className="prix">{euros(a.prix)}</span>
                <span>{a.surface_m2} m²</span>
                <span>{a.ville}</span>
                {p.code === 'C' && <span>{photos.has(a.id) ? 'Avec photo' : 'Sans photo'}</span>}
                <span>{new Date(a.cree_le).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
