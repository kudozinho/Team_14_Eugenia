import Link from "next/link";

export default function Portail() {
  return (
    <main className="wrap" style={{ padding: "40px" }}>
      <span className="eyebrow">Portail Ghost</span>
      <h1 style={{ margin: "12px 0" }}>Hello Sophie, prête à démarrer ?</h1>
      <p>Le portail (accord par outil, pastille, proposition, suivi) sera construit ici.</p>
      <p style={{ marginTop: 16 }}><Link href="/">Retour à l'accueil</Link></p>
    </main>
  );
}
