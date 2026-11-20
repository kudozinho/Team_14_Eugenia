import Link from "next/link";
import Logo from "@/components/Logo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "20px 40px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, backgroundImage: "none" }}>
          <Logo />
          <span style={{ fontFamily: "var(--font-titres)", fontWeight: 800, fontSize: "1.4rem", color: "var(--ink)" }}>Ghost</span>
        </Link>
        <nav aria-label="Navigation principale" style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/#comment-ca-marche">Comment ça marche</Link>
          <Link href="/#confiance">Confiance</Link>
          <Link href="/tarifs">Tarifs</Link>
          <Link href="/connexion">Se connecter</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="wrap" style={{ padding: "40px", color: "var(--mute)", fontSize: "0.9rem" }}>
        See the work. Ghost the task. · Projet de hackathon, données fictives, aucun paiement réel.
      </footer>
    </>
  );
}
