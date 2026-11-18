// Logo Ghost : fantôme bleu nuit, visière noire, deux yeux (redessiné en SVG d'après le logo de l'équipe).
export function GhostMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M58 6C80 6 95 24 95 46C95 74 74 92 39 95C44 88 45 80 40 76C34 71 23 72 12 75C22 63 29 49 33 35C38 18 46 6 58 6Z"
        fill="#0d1b3e"
      />
      <rect x="40" y="25" width="46" height="34" rx="16" fill="#050608" />
      <rect x="58" y="33" width="8" height="16" rx="4" fill="#24407f" />
      <rect x="72" y="33" width="8" height="16" rx="4" fill="#24407f" />
    </svg>
  );
}

export default function Logo() {
  return (
    <>
      <span className="logo-mark"><GhostMark /></span>
      <span className="logo-word">Ghost</span>
    </>
  );
}
