import Link from 'next/link';
import { portailCourant, VILLES } from '@/lib/portail';
import { listerAnnonces, idsAvecPhoto, urlsPhotos } from '@/lib/store';
import { offres, illustration, photo, euros as eur } from '@/lib/catalogue';
import CarteOffre from '../biens/CarteOffre';
import EnDirect from './EnDirect';
import Vignette from './Vignette';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Annonces publiées' };

const euros = (n: number | null) => (n == null ? '-' : eur(n));
const heure = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
const jour = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' });
const NOUVEAU_MS = 15 * 60 * 1000; // badge « Nouveau » pendant 15 minutes

type Filtres = { projet?: string; type?: string; ville?: string; budget?: string; surface?: string; tri?: string };
type Props = { searchParams: Promise<Filtres> };

export default async function AnnoncesPubliees({ searchParams }: Props) {
  const f = await searchParams;
  const p = portailCourant();
  const annonces = await listerAnnonces(p.nom);
  const avecPhoto = p.code === 'C' ? await idsAvecPhoto() : new Set<string>();
  const vignettes = p.code === 'C' ? await urlsPhotos(annonces.slice(0, 24).map((a) => a.id).filter((id) => avecPhoto.has(id))) : {};
  const maintenant = Date.now();
  const derniere = annonces[0];

  // Offres du catalogue, filtrées par la barre de recherche (formulaire GET, sans script)
  const budget = Number(f.budget) || 0;
  const surfaceMin = Number(f.surface) || 0;
  let liste = offres(p.code).filter((o) =>
    (!f.projet || o.projet === (f.projet === 'louer' ? 'location' : 'vente')) &&
    (!f.type || o.type === f.type) &&
    (!f.ville || o.ville === f.ville) &&
    (!budget || o.prix <= budget) &&
    (!surfaceMin || o.surface >= surfaceMin));
  if (f.tri === 'prix-asc') liste = [...liste].sort((a, b) => a.prix - b.prix);
  if (f.tri === 'prix-desc') liste = [...liste].sort((a, b) => b.prix - a.prix);
  if (f.tri === 'surface') liste = [...liste].sort((a, b) => b.surface - a.surface);
  const filtre = Object.values(f).some(Boolean);

  return (
    <>
      <section className="tete-liste">
        <div>
          <p className="surtitre">{p.nom}</p>
          <h1>Annonces publiées</h1>
          <p className="sous-titre">
            <strong>{annonces.length + offres(p.code).length}</strong> biens en ligne
            {derniere && <> · dernière publication le {jour(derniere.cree_le)} à {heure(derniere.cree_le)}</>}
          </p>
        </div>
        <div className="tete-actions">
          <EnDirect />
          <Link className="bouton" href={p.chemin}>{p.action}</Link>
        </div>
      </section>

      <section className="bloc-liste" aria-labelledby="publications-h">
        <h2 id="publications-h" className="titre-liste">Dernières publications</h2>
        {annonces.length === 0 ? (
          <div className="vide">
            <p className="vide-titre">Aucune publication pour l'instant</p>
            <p>Les annonces déposées par l'agence apparaissent ici dès leur publication.</p>
          </div>
        ) : (
          <div className="grille">
            {annonces.map((a) => {
              const nouveau = maintenant - new Date(a.cree_le).getTime() < NOUVEAU_MS;
              const img = p.code === 'C' ? vignettes[a.id] : photo(illustration(a.id), 500);
              return (
                <article className={`annonce${nouveau ? ' est-nouveau' : ''}`} key={a.id} data-annonce-id={a.id}>
                  <Link href={`/annonces/${a.id}`} className="annonce-lien">
                    <div className="annonce-visuel">
                      <Vignette src={img} initiale={a.ville?.charAt(0) ?? '·'} />
                      {nouveau && <span className="badge-nouveau">Nouveau</span>}
                      <span className="etiquette flottante vente">Vente</span>
                    </div>
                    <div className="annonce-corps">
                      <p className="annonce-prix">{euros(a.prix)}</p>
                      <h3 className="annonce-titre">{a.titre}</h3>
                      <p className="annonce-lieu">{a.ville}{a.surface_m2 ? ` · ${a.surface_m2} m²` : ''}</p>
                      <p className="annonce-meta">
                        {a.prix && a.surface_m2 ? <span>{euros(Math.round(a.prix / a.surface_m2))} / m²</span> : null}
                        {p.code === 'C' && <span>{avecPhoto.has(a.id) ? 'Avec photo' : 'Sans photo'}</span>}
                      </p>
                      {a.description && <p className="annonce-extrait">{a.description}</p>}
                      <p className="annonce-date">Publiée le {jour(a.cree_le)} à {heure(a.cree_le)}</p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="bloc-liste" aria-labelledby="offres-h">
        <h2 id="offres-h" className="titre-liste">Toutes nos offres</h2>
        <form className="recherche" method="get" action="/annonces" role="search" aria-label="Rechercher un bien">
          <div className="onglets-projet" role="radiogroup" aria-label="Projet">
            {[['', 'Tout'], ['acheter', 'Acheter'], ['louer', 'Louer']].map(([v, l]) => (
              <label key={l} className={(f.projet ?? '') === v ? 'actif' : ''}>
                <input type="radio" name="projet" value={v} defaultChecked={(f.projet ?? '') === v} /> {l}
              </label>
            ))}
          </div>
          <label className="filtre">Type de bien
            <select name="type" defaultValue={f.type ?? ''}>
              <option value="">Tous</option><option value="appartement">Appartement</option><option value="maison">Maison</option><option value="studio">Studio</option>
            </select>
          </label>
          <label className="filtre">Ville
            <select name="ville" defaultValue={f.ville ?? ''}>
              <option value="">Toutes</option>{VILLES.map((v) => <option key={v.nom} value={v.nom}>{v.nom}</option>)}
            </select>
          </label>
          <label className="filtre">Budget max (€)
            <input type="number" name="budget" min={0} step={1000} defaultValue={f.budget ?? ''} placeholder="Sans limite" />
          </label>
          <label className="filtre">Surface min (m²)
            <input type="number" name="surface" min={0} step={5} defaultValue={f.surface ?? ''} placeholder="Toutes" />
          </label>
          <label className="filtre">Trier
            <select name="tri" defaultValue={f.tri ?? ''}>
              <option value="">Les plus récents</option><option value="prix-asc">Prix croissant</option><option value="prix-desc">Prix décroissant</option><option value="surface">Plus grande surface</option>
            </select>
          </label>
          <div className="recherche-actions">
            <button className="bouton" type="submit">Rechercher</button>
            {filtre && <Link className="lien-reinit" href="/annonces">Effacer les filtres</Link>}
          </div>
        </form>
        <p className="nb-resultats">{liste.length} bien{liste.length > 1 ? 's' : ''} {filtre ? 'correspondent à votre recherche' : 'disponibles'}</p>
        {liste.length === 0 ? (
          <div className="vide"><p className="vide-titre">Aucun bien ne correspond</p><p>Élargissez la ville, le budget ou la surface.</p></div>
        ) : (
          <div className="grille">{liste.map((o) => <CarteOffre key={o.ref} o={o} />)}</div>
        )}
      </section>
    </>
  );
}
