import { notFound } from 'next/navigation';
import { portailCourant } from '@/lib/portail';

export const metadata = { title: 'Déposer une annonce' };

// Site A (niveau 1) : formulaire simple, 5 champs, libellés évidents, un seul bouton.
export default function DeposerA() {
  if (portailCourant().code !== 'A') notFound();
  return (
    <>
      <h1>Déposer une annonce</h1>
      <p className="sous-titre">Remplissez les 5 champs puis cliquez sur « Publier ».</p>
      <form className="carte" method="post" action="/api/annonces">
        <div className="champ">
          <label htmlFor="titre">Titre</label>
          <input id="titre" name="titre" type="text" required maxLength={120} />
        </div>
        <div className="champ">
          <label htmlFor="prix">Prix (€)</label>
          <input id="prix" name="prix" type="number" min={1} step={1} required />
        </div>
        <div className="champ">
          <label htmlFor="surface_m2">Surface (m²)</label>
          <input id="surface_m2" name="surface_m2" type="number" min={1} step={1} required />
        </div>
        <div className="champ">
          <label htmlFor="ville">Ville</label>
          <input id="ville" name="ville" type="text" required maxLength={80} />
        </div>
        <div className="champ">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" required maxLength={2000} />
        </div>
        <div className="actions">
          <button className="bouton" type="submit">Publier</button>
        </div>
      </form>
    </>
  );
}
