import Link from 'next/link';
import type { Classe, Offre } from '@/lib/catalogue';
import { euros, prixM2, photo, srcset } from '@/lib/catalogue';
import { portailCourant } from '@/lib/portail';
import Galerie from './Galerie';
import Energie from './Energie';
import CarteOffre from './CarteOffre';

export type DonneesFiche = {
  ref: string;
  projet?: 'vente' | 'location';
  typeLabel: string;
  titre: string;
  prix: number | null;
  charges?: number;
  surface: number | null;
  terrain?: number;
  pieces?: number;
  chambres?: number;
  etage?: string;
  ville: string | null;
  quartier?: string;
  dpe?: Classe;
  ges?: Classe;
  annee?: number;
  exterieur?: string;
  stationnement?: string;
  atouts?: string[];
  description: string | null;
  honoraires?: string;
  images: { src: string; srcSet?: string; alt: string }[];
  mentionPhoto?: string;
  publieeLe?: string;
  confirmation?: boolean;
  similaires: Offre[];
};

const date = (d: string) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' });

export default function Fiche({ f }: { f: DonneesFiche }) {
  const p = portailCourant();
  const location = f.projet === 'location';
  const contact = `contact@portail-${p.code.toLowerCase()}.example`;
  const faits: [string, string | undefined][] = [
    ['Surface', f.surface ? `${f.surface} m²` : undefined],
    ['Pièces', f.pieces ? String(f.pieces) : undefined],
    ['Chambres', f.chambres !== undefined ? String(f.chambres) : undefined],
    ['Terrain', f.terrain ? `${f.terrain} m²` : undefined],
    ['Étage', f.etage],
    ['Construction', f.annee ? String(f.annee) : undefined],
  ];

  return (
    <>
      {f.confirmation && (
        <div className="succes" role="status" id="confirmation">
          Annonce publiée sur {p.nom}. Référence : <strong>{f.ref}</strong>
        </div>
      )}

      <nav className="fil" aria-label="Fil d'Ariane">
        <Link href="/annonces">Annonces</Link>
        <span aria-hidden="true">›</span>
        <span>{f.ville ?? 'Annonce'}</span>
        <span aria-hidden="true">›</span>
        <span>Réf. {f.ref}</span>
      </nav>

      <div className="fiche-grille">
        <div className="fiche-principale">
          <Galerie images={f.images} mention={f.mentionPhoto} />

          <header className="fiche-tete">
            <p className="fiche-type">
              {f.projet && <span className={`etiquette ${location ? 'location' : 'vente'}`}>{location ? 'Location' : 'Vente'}</span>}
              {f.typeLabel}
              {f.ville && <> · {f.ville}{f.quartier ? ` (${f.quartier})` : ''}</>}
            </p>
            <h1>{f.titre}</h1>
          </header>

          <dl className="faits">
            {faits.filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>

          <section className="fiche-bloc">
            <h2>Description</h2>
            <p className="fiche-description">{f.description || 'Aucune description fournie.'}</p>
            {f.atouts && f.atouts.length > 0 && (
              <ul className="atouts">{f.atouts.map((a) => <li key={a}>{a}</li>)}</ul>
            )}
          </section>

          {(f.exterieur || f.stationnement) && (
            <section className="fiche-bloc">
              <h2>Extérieur et stationnement</h2>
              <dl className="caracteristiques">
                {f.exterieur && <div><dt>Extérieur</dt><dd>{f.exterieur}</dd></div>}
                {f.stationnement && <div><dt>Stationnement</dt><dd>{f.stationnement}</dd></div>}
              </dl>
            </section>
          )}

          <section className="fiche-bloc">
            <h2>Performance énergétique</h2>
            <div className="energies">
              <Energie type="dpe" classe={f.dpe} />
              <Energie type="ges" classe={f.ges} />
            </div>
          </section>

          <section className="fiche-bloc">
            <h2>Informations financières</h2>
            <dl className="caracteristiques">
              {f.prix != null && <div><dt>{location ? 'Loyer charges comprises' : 'Prix honoraires inclus'}</dt><dd>{euros(f.prix)}{location ? ' / mois' : ''}</dd></div>}
              {location && f.charges != null && <div><dt>Dont provision sur charges</dt><dd>{euros(f.charges)} / mois</dd></div>}
              {!location && f.charges != null && <div><dt>Charges de copropriété</dt><dd>{euros(f.charges)} / mois</dd></div>}
              {!location && f.prix != null && f.surface ? <div><dt>Prix au m²</dt><dd>{euros(prixM2(f.prix, f.surface))}</dd></div> : null}
              <div><dt>Honoraires</dt><dd>{f.honoraires ?? "Non précisés par l'agence"}</dd></div>
            </dl>
            <p className="mention">Barème des honoraires disponible auprès de l'agence. Les informations sur les risques auxquels ce bien est exposé sont disponibles sur le site Géorisques.</p>
          </section>
        </div>

        <aside className="fiche-cote">
          <div className="carte-prix">
            <p className="prix-grand">{f.prix != null ? euros(f.prix) : 'Prix non communiqué'}{location && <small> / mois CC</small>}</p>
            {!location && f.prix != null && f.surface ? <p className="prix-m2">{euros(prixM2(f.prix, f.surface))} / m²</p> : null}
            <p className="prix-resume">{[f.surface && `${f.surface} m²`, f.pieces && `${f.pieces} pièce${f.pieces > 1 ? 's' : ''}`, f.ville].filter(Boolean).join(' · ')}</p>
            <a className="bouton bouton-plein" href={`mailto:${contact}?subject=${encodeURIComponent(`Réf. ${f.ref} : ${f.titre}`)}`}>Contacter l'agence</a>
            <a className="bouton secondaire bouton-plein" href={`mailto:${contact}?subject=${encodeURIComponent(`Visite, réf. ${f.ref}`)}`}>Demander une visite</a>
            <p className="ref">Référence {f.ref}{f.publieeLe ? ` · publiée le ${date(f.publieeLe)}` : ''}</p>
          </div>
        </aside>
      </div>

      {f.similaires.length > 0 && (
        <section className="similaires">
          <h2>Biens similaires</h2>
          <div className="grille">{f.similaires.map((o) => <CarteOffre key={o.ref} o={o} />)}</div>
        </section>
      )}
    </>
  );
}

export const imagesDe = (ids: string[], titre: string) =>
  ids.map((id, k) => ({ src: photo(id, 960), srcSet: srcset(id), alt: k === 0 ? titre : `${titre}, photo ${k + 1}` }));
