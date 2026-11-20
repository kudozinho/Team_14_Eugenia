import Link from "next/link";
import Image from "next/image";

// Intranet d'Atelier Nova : public, sans connexion. Libellés clairs et stables, menu toujours visible,
// aucune animation ni fenêtre surgissante : un agent H lit l'écran.
export default function RHLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bandeau-test">Environnement de test fictif : Atelier Nova n&apos;existe pas</div>
      <header className="wrap" style={{ padding: "14px 32px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid var(--line)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo-atelier-nova.svg" alt="Atelier Nova" width={36} height={36} />
          <b style={{ fontSize: "1.15rem" }}>Atelier Nova · Intranet</b>
        </span>
        <nav aria-label="Espaces de l'intranet" style={{ display: "flex", gap: 20 }}>
          <Link href="/intranet/rh">Espace RH</Link>
          <Link href="/intranet/messagerie">Messagerie</Link>
          <Link href="/intranet/wiki">Wiki</Link>
        </nav>
      </header>
      <main className="wrap" style={{ padding: "28px 32px" }}>{children}</main>
    </>
  );
}
