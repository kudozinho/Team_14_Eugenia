import Link from "next/link";

// Intranet RH d'Atelier Nova : public, sans connexion. Libellés clairs et stables, menu toujours visible,
// aucune animation ni fenêtre surgissante : un agent H lit l'écran.
export default function RHLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bandeau-test">Environnement de test fictif</div>
      <header className="wrap" style={{ padding: "16px 40px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid var(--line)" }}>
        <b style={{ fontFamily: "var(--font-titres)", fontSize: "1.2rem" }}>Atelier Nova · Espace RH et badges</b>
        <nav aria-label="Menu RH" style={{ display: "flex", gap: 20 }}>
          <Link href="/intranet/rh">Accueil RH</Link>
          <Link href="/intranet/rh#personnes">Liste des personnes</Link>
        </nav>
      </header>
      <main className="wrap" style={{ padding: "32px 40px" }}>{children}</main>
    </>
  );
}
