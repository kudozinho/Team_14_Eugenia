// Petit fantôme Ghost, dans la couleur d'un agent (même silhouette que le logo, visière sombre, deux yeux).
export default function Fantome({ couleur, taille = 28, actif = false }: { couleur: string; taille?: number; actif?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width={taille} height={taille} aria-hidden="true" className={actif ? "fantome vivant" : "fantome"}>
      <path d="M58 6C80 6 95 24 95 46C95 74 74 92 39 95C44 88 45 80 40 76C34 71 23 72 12 75C22 63 29 49 33 35C38 18 46 6 58 6Z" fill={couleur} />
      <rect x="40" y="25" width="46" height="34" rx="16" fill="#0a1410" />
      <rect x="58" y="33" width="8" height="16" rx="4" fill="#ffffff" />
      <rect x="72" y="33" width="8" height="16" rx="4" fill="#ffffff" />
    </svg>
  );
}
