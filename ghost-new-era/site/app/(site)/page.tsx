import Link from "next/link";

const temps = [
  { n: "1", titre: "Il observe", texte: "Ghost regarde ton écran, uniquement dans les outils que tu as cochés. Une pastille reste affichée et tu peux le mettre en pause à tout moment." },
  { n: "2", titre: "Il propose", texte: "Quand il voit que tu refais la même chose, il te le dit : « Je prépare l'onboarding de Karim comme pour Léa ? »" },
  { n: "3", titre: "Il agit après ton accord", texte: "Si tu dis oui, des agents H Company prennent la main sous tes yeux. Chaque action est vérifiée dans l'outil. Si tu dis non, tu continues." },
];

export default function Accueil() {
  return (
    <>
      <section className="wrap" style={{ padding: "56px 40px 40px", display: "grid", gap: 24, maxWidth: 980, margin: 0 }}>
        <span className="eyebrow">Pour les RH et les office managers</span>
        <h1>L'arrivée d'un nouveau salarié ne devrait plus te prendre 2 heures.</h1>
        <p style={{ fontSize: "1.15rem", maxWidth: 680 }}>
          Ghost regarde ton travail, repère ce que tu répètes et s'en occupe quand tu l'autorises. Accès, badge, message
          d'accueil, page de bienvenue : rien n'est oublié.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/inscription" className="btn btn-primary">Commencer</Link>
          <Link href="/connexion" className="btn btn-secondary">Se connecter</Link>
        </div>
      </section>

      <section className="wrap" style={{ padding: "24px 40px 40px" }}>
        <h2>Comment ça marche</h2>
        <p style={{ margin: "8px 0 24px" }}>Trois temps, et c'est toi qui décides à chaque fois.</p>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {temps.map((t) => (
            <article key={t.n} className="card">
              <span className="eyebrow" style={{ marginBottom: 10 }}>Temps {t.n}</span>
              <h3 style={{ margin: "10px 0 8px" }}>{t.titre}</h3>
              <p>{t.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ padding: "24px 40px 56px" }}>
        <div style={{ background: "var(--g-900)", borderRadius: 22, padding: "32px", color: "#fff" }}>
          <h2 style={{ color: "#fff" }}>Ce que Ghost voit, et ne voit jamais</h2>
          <ul style={{ margin: "16px 0 0", paddingLeft: 20, display: "grid", gap: 8, color: "#fff" }}>
            <li>Il ne regarde que les outils que tu as autorisés, un par un.</li>
            <li>Une pastille est toujours visible, avec un bouton pause.</li>
            <li>Il suit des tâches, jamais des personnes.</li>
            <li>Il s'arrête avant toute action irréversible et te demande.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
