'use client';

import { useState } from 'react';

type Image = { src: string; srcSet?: string; alt: string };

// Grande photo + vignettes ; un clic sur une vignette change la grande photo.
export default function Galerie({ images, mention }: { images: Image[]; mention?: string }) {
  const [i, setI] = useState(0);
  const [echec, setEchec] = useState<Record<number, boolean>>({});
  const courante = images[i];
  return (
    <div className="galerie">
      <div className="galerie-principale">
        {courante && !echec[i] ? (
          <img
            src={courante.src}
            srcSet={courante.srcSet}
            sizes="(max-width: 900px) 100vw, 700px"
            alt={courante.alt}
            onError={() => setEchec((e) => ({ ...e, [i]: true }))}
            onLoad={(e) => { if (e.currentTarget.naturalWidth < 40) setEchec((x) => ({ ...x, [i]: true })); }}
          />
        ) : (
          <div className="galerie-vide">Photo indisponible</div>
        )}
        {images.length > 1 && <span className="galerie-compteur">{i + 1} / {images.length}</span>}
        {mention && <span className="galerie-mention">{mention}</span>}
      </div>
      {images.length > 1 && (
        <div className="galerie-vignettes" role="list">
          {images.map((im, k) => (
            <button
              key={k}
              type="button"
              role="listitem"
              className={k === i ? 'actif' : ''}
              aria-label={`Voir la photo ${k + 1}`}
              aria-current={k === i}
              onClick={() => setI(k)}
            >
              <img src={im.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
