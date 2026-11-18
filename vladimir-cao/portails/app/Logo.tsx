import type { Code } from '@/lib/portail';

// Un monogramme par portail (fictifs, aucune ressemblance voulue avec une marque réelle). Aplats, pas de dégradé.
export default function Logo({ code }: { code: Code }) {
  if (code === 'A') {
    return (
      <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="var(--accent)" />
        <path d="M9 20.5 20 11l11 9.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 29 20 16.5 25.5 29M16.6 24.6h6.8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (code === 'B') {
    return (
      <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="6" fill="var(--accent)" />
        <path d="M8 31h24M11 31V17l9-6 9 6v14" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="1.6" strokeLinejoin="round" />
        <text x="20" y="28" textAnchor="middle" style={{ fontFamily: 'var(--font-titre)' }} fontSize="15" fill="#fff">B</text>
      </svg>
    );
  }
  return (
    <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="var(--accent)" />
      <path d="M11 19.5 20 12l9 7.5V28a1 1 0 0 1-1 1H12a1 1 0 0 1-1-1z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="m16.3 21.6 2.6 2.6 4.8-5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
