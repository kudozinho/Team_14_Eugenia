'use client';

import { useEffect, useRef, useState } from 'react';
import { VILLES } from '@/lib/portail';

// Un seul <form> : l'étape 1 est masquée (attribut hidden) mais ses champs partent bien avec l'envoi.
export default function FormulaireC({ photo }: { photo: boolean }) {
  const [etape, setEtape] = useState<1 | 2>(1);
  const [envoi, setEnvoi] = useState(false);
  const [recap, setRecap] = useState({ accroche: '', localisation: '', surface: '' });
  const etape1 = useRef<HTMLElement>(null);

  // Retour arrière depuis la page d'erreur (cache du navigateur) : on réactive le bouton.
  useEffect(() => {
    const f = () => setEnvoi(false);
    window.addEventListener('pageshow', f);
    return () => window.removeEventListener('pageshow', f);
  }, []);

  function suivant() {
    const champs = Array.from(etape1.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select') ?? []);
    for (const c of champs) if (!c.reportValidity()) return;
    const val = (n: string) => champs.find((c) => c.name === n)?.value ?? '';
    setRecap({ accroche: val('accroche'), localisation: val('localisation'), surface: val('surface_habitable') });
    setEtape(2);
    window.scrollTo({ top: 0 });
  }

  return (
    <form
      className="carte"
      method="post"
      action="/api/annonces"
      encType="multipart/form-data"
      onSubmit={() => setEnvoi(true)}
    >
      <div className="etapes" aria-label="Progression">
        <span className={etape === 1 ? 'active' : ''}>Étape 1 sur 2 · Le bien</span>
        <span className={etape === 2 ? 'active' : ''}>Étape 2 sur 2 · Mise en ligne</span>
      </div>

      <section ref={etape1} hidden={etape !== 1}>
        <div className="champ">
          <label htmlFor="accroche">Accroche</label>
          <input id="accroche" name="accroche" type="text" required maxLength={120} />
          <span className="aide">Le titre affiché en tête d'annonce.</span>
        </div>
        <div className="champ">
          <label htmlFor="localisation">Localisation</label>
          <select id="localisation" name="localisation" required defaultValue="">
            <option value="" disabled>Choisir…</option>
            {VILLES.map((v) => (
              <option key={v.nom} value={v.nom}>{`${v.nom} (${v.cp})`}</option>
            ))}
          </select>
        </div>
        <div className="champ">
          <label htmlFor="surface_habitable">Surface habitable (m²)</label>
          <input id="surface_habitable" name="surface_habitable" type="number" min={1} step={1} required />
        </div>
        <div className="actions">
          <button className="bouton" type="button" onClick={suivant}>Suivant</button>
        </div>
      </section>

      <section hidden={etape !== 2}>
        <div className="recap">
          <strong>{recap.accroche}</strong> · {recap.localisation} · {recap.surface} m²
        </div>
        <div className="champ">
          <label htmlFor="prix_fai">Prix de vente FAI (€)</label>
          <input id="prix_fai" name="prix_fai" type="number" min={1} step={1} required={etape === 2} />
          <span className="aide">Frais d'agence inclus.</span>
        </div>
        <div className="champ">
          <label htmlFor="descriptif">Descriptif détaillé</label>
          <textarea id="descriptif" name="descriptif" required={etape === 2} maxLength={2000} />
        </div>
        {photo && (
          <div className="champ">
            <label htmlFor="photo">Photo principale</label>
            <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required={etape === 2} />
            <span className="aide">JPG, PNG ou WebP, 4 Mo maximum.</span>
          </div>
        )}
        <label className="case" htmlFor="certification">
          <input id="certification" name="certification" type="checkbox" value="oui" required={etape === 2} />
          <span>Je certifie que l'agence détient un mandat en cours de validité pour ce bien.</span>
        </label>
        <div className="actions">
          <button className="bouton secondaire" type="button" onClick={() => setEtape(1)}>Retour</button>
          <button className="bouton" type="submit" disabled={envoi}>{envoi ? 'Envoi…' : 'Mettre en ligne'}</button>
        </div>
      </section>
    </form>
  );
}
