// Emplacement du logo. Remplacer le contenu de ce composant par le logo définitif (SVG).
export default function Logo() {
  return (
    <>
      <span className="logo-mark" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 21V11a7 7 0 0 1 14 0v10l-3.5-2.5L12 21l-3.5-2.5L5 21Z" fill="#fff" />
          <circle cx="9.6" cy="11" r="1.5" fill="#0b7a55" />
          <circle cx="14.4" cy="11" r="1.5" fill="#0b7a55" />
        </svg>
      </span>
      Ghost
    </>
  );
}
