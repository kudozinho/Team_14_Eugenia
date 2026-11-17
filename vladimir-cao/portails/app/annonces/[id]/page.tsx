import Link from 'next/link';
import { notFound } from 'next/navigation';
import { portailCourant } from '@/lib/portail';
import { lireAnnonce, urlPhoto, aUnePhoto } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Annonce' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ publiee?: string }> };

export default async function Annonce({ params, searchParams }: Props) {
  const { id } = await params;
  const { publiee } = await searchParams;
  const p = portailCourant();
  const a = await lireAnnonce(p.nom, id);
  if (!a) notFound();
  const [photo, avecPhoto] = p.code === 'C' ? await Promise.all([urlPhoto(id), aUnePhoto(id)]) : [null, false];

  return (
    <>
      {publiee && (
        <div className="succes" role="status" id="confirmation">
          Annonce publiée sur {p.nom}. Référence : <strong>{a.id}</strong>
        </div>
      )}
      <article className="carte">
        <h1>{a.titre}</h1>
        <dl className="fiche">
          <dt>Prix</dt><dd>{a.prix?.toLocaleString('fr-FR')} €</dd>
          <dt>Surface</dt><dd>{a.surface_m2} m²</dd>
          <dt>Ville</dt><dd>{a.ville}</dd>
          <dt>Description</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{a.description}</dd>
          {p.code === 'C' && (<><dt>Photo</dt><dd>{avecPhoto ? 'Oui' : 'Non'}</dd></>)}
        </dl>
        {photo && <img className="photo" src={photo} alt={`Photo : ${a.titre}`} />}
      </article>
      <div className="actions" style={{ marginTop: 20 }}>
        <Link className="bouton" href="/annonces">Voir toutes les annonces publiées</Link>
        <Link className="bouton secondaire" href={p.chemin}>{p.action}</Link>
      </div>
    </>
  );
}
