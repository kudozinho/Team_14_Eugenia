import type { Metadata } from 'next';
import Link from 'next/link';
import { portailCourant } from '@/lib/portail';
import { modeLocal } from '@/lib/store';
import './globals.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const p = portailCourant();
  // Titre de fenêtre attendu par le Recorder : « Portail A - Déposer une annonce » (contrat §1)
  return { title: { template: `${p.nom} - %s`, default: p.nom }, robots: { index: false, follow: false } };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const p = portailCourant();
  return (
    <html lang="fr">
      <body data-portail={p.code}>
        <header className="entete">
          <div className="cadre entete-ligne">
            <Link href="/" className="logo">
              <span className="pastille">{p.code}</span> {p.nom}
            </Link>
            <nav className="menu">
              <Link href={p.chemin}>{p.action}</Link>
              <Link href="/annonces">Annonces publiées</Link>
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
