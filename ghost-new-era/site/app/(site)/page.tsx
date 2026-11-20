import Link from "next/link";
import Plans from "@/components/Plans";

const temps = [
  { n: "1", titre: "Il observe", texte: "Ghost regarde ton écran, uniquement dans les outils que tu as cochés. Une pastille reste affichée et tu peux le mettre en pause à tout moment." },
  { n: "2", titre: "Il propose", texte: "Quand il voit que tu refais la même chose, il te le dit : « Je prépare l'onboarding de Karim comme pour Léa ? »" },
  { n: "3", titre: "Il agit après ton accord", texte: "Si tu dis oui, des agents H Company prennent la main sous tes yeux. Chaque action est vérifiée dans l'outil. Si tu dis non, tu continues." },
];

const faq = [
  { q: "Ghost agit-il sans me demander ?", r: "Non. Il propose, et il n'agit qu'après ton accord. Avant toute action irréversible, comme une commande de matériel, il attend ta validation." },
  { q: "Que se passe-t-il s'il manque une information ?", r: "Il te pose la question au lieu d'inventer. Par exemple, si le manager d'un nouvel arrivant n'est pas renseigné." },
  { q: "Quels outils Ghost peut-il utiliser ?", r: "Seulement ceux que tu autorises, un par un : logiciel RH et badges, messagerie, wiki interne. Les autres lui restent fermés." },
  { q: "Est-ce que Ghost suit mes collègues ?", r: "Non. Il suit des tâches, jamais des personnes." },
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

      <section id="probleme" className="wrap" style={{ padding: "24px 40px" }}>
        <h2>Un oubli, et le nouveau arrive sans accès ni badge</h2>
        <p style={{ margin: "8px 0 0", maxWidth: 720 }}>
          Dans une PME de 50 personnes, préparer une arrivée demande de jongler entre plusieurs outils : fiche RH, accès,
          badge, messagerie, wiki. Chaque étape est simple, mais l'ensemble prend du temps et un oubli se voit dès le premier jour.
        </p>
      </section>

      <section id="comment-ca-marche" className="wrap" style={{ padding: "24px 40px 40px" }}>
        <h2>Comment ça marche</h2>
        <p style={{ margin: "8px 0 24px" }}>Trois temps, et c'est toi qui décides à chaque fois.</p>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {temps.map((t) => (
            <article key={t.n} className="card">
              <span className="eyebrow">Temps {t.n}</span>
              <h3 style={{ margin: "10px 0 8px" }}>{t.titre}</h3>
              <p>{t.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="exemple" className="wrap" style={{ padding: "24px 40px 40px" }}>
        <h2>Un exemple : l'arrivée de Karim</h2>
        <p style={{ margin: "8px 0 20px", maxWidth: 720 }}>Sophie, office manager, vient de préparer l'arrivée de Léa. Quand celle de Karim apparaît, Ghost le remarque et se propose.</p>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <article className="card"><span className="eyebrow">Accès</span><h3 style={{ margin: "10px 0 8px" }}>Fiche, accès, badge</h3><p>Les accès adaptés au poste de commercial, et la demande de badge.</p></article>
          <article className="card"><span className="eyebrow">Équipe</span><h3 style={{ margin: "10px 0 8px" }}>Accueil dans la messagerie</h3><p>Message de bienvenue, demande de parrain, créneau pour le café d'accueil.</p></article>
          <article className="card"><span className="eyebrow">Docs</span><h3 style={{ margin: "10px 0 8px" }}>Page de bienvenue</h3><p>Les documents utiles et une checklist pour le jour 1, la semaine 1, le mois 1.</p></article>
        </div>
      </section>

      <section id="confiance" className="wrap" style={{ padding: "24px 40px 40px" }}>
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

      <section id="tarifs" className="wrap" style={{ padding: "24px 40px 40px" }}>
        <h2>Tarifs</h2>
        <p style={{ margin: "8px 0 8px" }}>Sans engagement.</p>
        <p style={{ margin: "0 0 24px", color: "var(--ochre-700)", fontWeight: 600 }}>Tarifs de démonstration : le prix définitif n'est pas encore fixé.</p>
        <Plans />
      </section>

      <section id="faq" className="wrap" style={{ padding: "24px 40px 40px" }}>
        <h2>Questions fréquentes</h2>
        <div style={{ display: "grid", gap: 12, marginTop: 20, maxWidth: 820 }}>
          {faq.map((f) => (
            <details key={f.q} className="card">
              <summary style={{ cursor: "pointer", fontFamily: "var(--font-titres)", fontWeight: 700, color: "var(--ink)" }}>{f.q}</summary>
              <p style={{ marginTop: 10 }}>{f.r}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ padding: "24px 40px 56px" }}>
        <h2>Prête à ne plus rien oublier ?</h2>
        <p style={{ margin: "8px 0 20px" }}>Crée ton compte en quelques secondes.</p>
        <Link href="/inscription" className="btn btn-secondary">Commencer</Link>
      </section>
    </>
  );
}
