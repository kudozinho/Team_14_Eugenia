import Link from "next/link";
import Logo from "@/components/Logo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="entete">
        <div className="wrap entete-in">
          <Link href="/" className="entete-marque">
            <Logo />
            <span>Ghost</span>
          </Link>
          <nav aria-label="Navigation principale" className="entete-nav">
            <Link href="/#parcours">Comment ça marche</Link>
            <Link href="/#confiance">Confiance</Link>
            <Link href="/#roi">Temps gagné</Link>
            <Link href="/tarifs">Tarifs</Link>
          </nav>
          <div className="entete-actions">
            <Link href="/connexion" className="lien-discret">Se connecter</Link>
            <Link href="/inscription" className="btn btn-sombre">Commencer</Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="wrap pied">
        <span>Ghost · See the work. Ghost the task.</span>
        <span>Projet de hackathon · données fictives · aucun paiement réel</span>
      </footer>
    </>
  );
}
