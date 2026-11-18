import type { Metadata } from 'next';
import Link from 'next/link';
import { Newsreader, Hanken_Grotesk } from 'next/font/google';
import { portailCourant } from '@/lib/portail';
import { modeLocal } from '@/lib/store';
import Logo from './Logo';
import './globals.css';
import './immobilier.css';

// Typographies tirées par le skill design-taste-frontend (start.mjs deal --page service --trade agency) :
// A et B : Newsreader (titres) + Hanken Grotesk (texte) ; C : Hanken Grotesk partout.
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const p = portailCourant();
  // Titre de fenêtre attendu par le Recorder : « Portail A - Déposer une annonce » (contrat §1)
  return { title: { template: `${p.nom} - %s`, default: p.nom }, robots: { index: false, follow: false } };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const p = portailCourant();
  return (
    <html lang="fr" className={`${newsreader.variable} ${hanken.variable}`}>
      <body data-portail={p.code}>
        <header className="entete">
          <div className="cadre entete-ligne">
            <Link href="/" className="logo" aria-label={`${p.nom}, accueil`}>
              <Logo code={p.code} />
              <span className="logo-texte">
                <span className="logo-nom">{p.nom}</span>
                <span className="logo-slogan">{p.slogan}</span>
              </span>
            </Link>
            <nav className="menu">
              <Link href="/annonces?projet=acheter#offres-h">Acheter</Link>
              <Link href="/annonces?projet=louer#offres-h">Louer</Link>
              <Link href="/annonces">Annonces publiées</Link>
              <Link href={p.chemin}>{p.action}</Link>
            </nav>
          </div>
        </header>
        {modeLocal() && (
          <div className="bandeau-local">Mode local : les annonces sont gardées en mémoire, pas dans Supabase.</div>
        )}
        <main className="cadre">{children}</main>
        <footer className="cadre pied">Site de test fictif · hackathon Build The Future · données fictives uniquement</footer>
      </body>
    </html>
  );
}
