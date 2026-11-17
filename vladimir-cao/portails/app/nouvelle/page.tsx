import { notFound } from 'next/navigation';
import { portailCourant, VILLES } from '@/lib/portail';

export const metadata = { title: 'Nouvelle annonce' };

// Site B (niveau 2) : autres libellés, autre ordre des champs, commune dans un menu déroulant,
// prix en champ texte (« 289 000 € » accepté), bouton d'envoi en bas à droite.
export default function NouvelleB() {
  if (portailCourant().code !== 'B') notFound();
  return (
    <>
      <h1>Nouvelle annonce</h1>
      <p className="sous-titre">Tous les champs sont obligatoires.</p>
      <form className="carte" method="post" action="/api/annonces">
        <div className="champ">
          <label htmlFor="commune">Commune du bien</label>
          <select id="commune" name="commune" required defaultValue="">
            <option value="" disabled>Sélectionner une commune</option>
            {VILLES.map((v) => (
              <option key={v.nom} value={v.nom}>{v.nom}</option>
            ))}
          </select>
        </div>
        <div className="champ">
          <label htmlFor="intitule">Intitulé de l'annonce</label>
          <input id="intitule" name="intitule" type="text" required maxLength={120} />
        </div>
        <div className="champ">
          <label htmlFor="superficie">Superficie</label>
          <input id="superficie" name="superficie" type="text" inputMode="numeric" pattern="[0-9 ]+" required placeholder="en m²" />
          <span className="aide">En mètres carrés, chiffres uniquement.</span>
        </div>
        <div className="champ">
          <label htmlFor="montant">Montant demandé</label>
          <input id="montant" name="montant" type="text" inputMode="numeric" required placeholder="ex. 250 000 €" />
        </div>
        <div className="champ">
          <label htmlFor="texte">Texte de l'annonce</label>
          <textarea id="texte" name="texte" required maxLength={2000} />
        </div>
        <div className="actions">
          <button className="bouton" type="submit">Enregistrer l'annonce</button>
        </div>
      </form>
    </>
  );
}
