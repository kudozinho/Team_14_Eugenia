import Link from "next/link";
import Logo from "@/components/Logo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, backgroundImage: "none" }}>
          <Logo />
          <span style={{ fontFamily: "var(--font-titres)", fontWeight: 800, fontSize: "1.4rem", color: "var(--ink)" }}>Ghost</span>
        </Link>
        <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/connexion">Se connecter</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="wrap" style={{ padding: "40px", color: "var(--mute)", fontSize: "0.9rem" }}>
        See the work. Ghost the task. · Projet de hackathon, données fictives.
      </footer>
    </>
  );
}
