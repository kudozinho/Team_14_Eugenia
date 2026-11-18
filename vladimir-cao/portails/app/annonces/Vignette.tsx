'use client';

import { useState } from 'react';

// Photo de l'annonce ; si elle ne se charge pas (fichier de test, lien expiré), on montre l'initiale de la ville.
export default function Vignette({ src, initiale }: { src?: string; initiale: string }) {
  const [echec, setEchec] = useState(false);
  if (!src || echec) return <span className="annonce-initiale" aria-hidden="true">{initiale}</span>;
  return <img src={src} alt="" onError={() => setEchec(true)} onLoad={(e) => { if (e.currentTarget.naturalWidth < 40) setEchec(true); }} />;
}
