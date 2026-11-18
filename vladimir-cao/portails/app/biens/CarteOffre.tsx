import Link from 'next/link';
import type { Offre } from '@/lib/catalogue';
import { euros, photo } from '@/lib/catalogue';

const TYPE = { appartement: 'Appartement', maison: 'Maison', studio: 'Studio' } as const;

// Carte d'une offre du catalogue, dans les listes et les « biens similaires ».
export default function CarteOffre({ o }: { o: Offre }) {
  const location = o.projet === 'location';
  return (
    <article className="annonce" data-offre-ref={o.ref}>
      <Link href={`/biens/${o.ref}`} className="annonce-lien">
        <div className="annonce-visuel">
          <img src={photo(o.photos[0], 500)} srcSet={`${photo(o.photos[0], 500)} 500w, ${photo(o.photos[0], 960)} 960w`} sizes="(max-width: 640px) 100vw, 360px" alt={o.titre} loading="lazy" />
          <span className={`etiquette flottante ${location ? 'location' : 'vente'}`}>{location ? 'Location' : 'Vente'}</span>
          <span className="annonce-nbphotos">{o.photos.length} photo{o.photos.length > 1 ? 's' : ''}</span>
        </div>
        <div className="annonce-corps">
          <p className="annonce-prix">{euros(o.prix)}{location && <small> / mois</small>}</p>
          <h3 className="annonce-titre">{TYPE[o.type]} {o.pieces} pièce{o.pieces > 1 ? 's' : ''} · {o.surface} m²</h3>
          <p className="annonce-lieu">{o.ville} · {o.quartier}</p>
          <p className="annonce-meta">
            {o.chambres > 0 && <span>{o.chambres} ch.</span>}
            {o.exterieur && <span>{(/terrasse|jardin|loggia|balcon/i.exec(o.exterieur)?.[0] ?? 'Extérieur').replace(/^./, (c) => c.toUpperCase())}</span>}
            {o.stationnement && <span>Parking</span>}
            <span className={`pastille-dpe dpe-${o.dpe}`}>DPE {o.dpe}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
