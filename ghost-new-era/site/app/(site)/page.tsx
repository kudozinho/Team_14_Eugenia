import Link from "next/link";
import Plans from "@/components/Plans";
import Fantome from "@/components/portail/Fantome";
import DemoAnimee from "@/components/landing/DemoAnimee";
import Roi from "@/components/landing/Roi";
import { agentInfo } from "@/lib/agents";

const parcours = [
  { quand: "Avant l'arrivée", agent: "acces", titre: "Accès, badge, matériel", texte: "Fiche RH, accès adaptés au poste, demande de badge. La commande de matériel attend ta validation.", etat: "Disponible" },
  { quand: "La veille", agent: "equipe", titre: "Équipe et parrain", texte: "Message de bienvenue dans le bon canal, annonce, demande de parrain au manager, café d'accueil proposé.", etat: "Disponible" },
  { quand: "Jour 1", agent: "docs", titre: "Wiki et checklist", texte: "Les 5 documents utiles au poste, une page « Bienvenue » à son nom, une checklist jour 1, semaine 1, mois 1.", etat: "Disponible" },
  { quand: "Semaine 1", agent: "suivi", titre: "Suivi des 7 premiers jours", texte: "Un point à J+1, J+3 et J+7 avec la personne, une relance du parrain, un résumé au manager.", etat: "Bientôt" },
];

const faq = [
  { q: "Ghost agit-il sans me demander ?", r: "Non. Il propose, et il n'agit qu'après ton accord. Avant toute action irréversible, comme une commande de matériel, il attend ta validation." },
  { q: "Que se passe-t-il s'il manque une information ?", r: "L'agent s'arrête et te pose la question au lieu d'inventer. Par exemple, si le manager d'un nouvel arrivant n'est pas renseigné." },
  { q: "Comment savoir que le travail est vraiment fait ?", r: "Chaque action est vérifiée dans l'outil lui-même, pas seulement annoncée par l'agent. Le rapport final liste ce qui est prouvé, et dit ce qui ne l'est pas." },
  { q: "Que voit Ghost de mon écran ?", r: "Seulement l'onglet que tu partages. Aucune image n'est conservée : seul un court résumé en texte l'est. Une pastille reste visible, avec un bouton pause." },
  { q: "Et si mes outils n'ont pas d'API ?", r: "C'est le cas d'usage de départ : les agents H travaillent dans le navigateur, comme une personne, y compris dans les outils anciens ou maison." },
];

export default function Accueil() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-centre">
          <a href="#parcours" className="badge-neuf"><i /> Onboarding par agents IA <span>→</span></a>
          <h1>Vos nouveaux arrivants démarrent prêts. <span>Vous n&apos;avez rien à relancer.</span></h1>
          <p className="hero-sous">Accès, badge, bienvenue, parrain, wiki : trois agents préparent chaque arrivée sous vos yeux, après votre accord. Chaque action est vérifiée dans l&apos;outil.</p>
          <div className="hero-actions">
            <Link href="/inscription" className="btn btn-primary btn-grand">Commencer</Link>
            <Link href="#parcours" className="lien-fleche">Voir comment ça marche <span>→</span></Link>
          </div>
          <p className="hero-note">Démo avec des données fictives · aucun paiement réel</p>
        </div>
        <div className="wrap hero-visuel"><DemoAnimee /></div>
        <ul className="wrap chiffres" aria-label="Chiffres mesurés">
          <li><b>9</b><span>éléments vérifiés dans les outils</span></li>
          <li><b>≈ 3 min</b><span>pour une arrivée complète (8 essais réels)</span></li>
          <li><b>0</b><span>image conservée</span></li>
          <li><b>1</b><span>validation humaine avant l&apos;irréversible</span></li>
        </ul>
      </section>

      <section id="probleme" className="wrap section">
        <div className="sec-tete"><span className="eyebrow">Le problème</span>
          <h2>Une arrivée, c&apos;est cinq outils et vingt petites tâches.</h2>
          <p className="lead">Chaque étape est simple. C&apos;est l&apos;enchaînement qui coûte du temps, et un oubli se voit dès le premier jour : pas d&apos;accès, pas de badge, personne pour accueillir.</p></div>
        <div className="outils-vrac" aria-label="Les outils d'une arrivée">
          {["Logiciel RH", "Badges", "Messagerie", "Wiki", "Matériel", "Agenda"].map((o) => <span key={o}>{o}</span>)}
        </div>
      </section>

      <section id="parcours" className="wrap section">
        <div className="sec-tete"><span className="eyebrow">Du premier jour à la première semaine</span>
          <h2>Un agent par moment clé de l&apos;onboarding.</h2></div>
        <div className="chronologie">
          {parcours.map((p) => {
            const a = agentInfo(p.agent);
            return (
              <article key={p.quand} className={`etape ${p.etat === "Bientôt" ? "bientot" : ""}`} style={{ ["--c" as string]: a.couleur }}>
                <span className="quand">{p.quand}</span>
                <div className="etape-agent"><Fantome couleur={a.couleur} taille={40} /><div><b>{a.prenom}</b><small>agent {a.role}</small></div></div>
                <h3>{p.titre}</h3>
                <p>{p.texte}</p>
                <span className="etat-etape">{p.etat}</span>
              </article>
            );
          })}
        </div>
      </section>

      <section id="outils" className="wrap section">
        <div className="sec-tete"><span className="eyebrow">Vos outils</span>
          <h2>Là où vos équipes travaillent, avec ou sans API.</h2>
          <p className="lead">Les agents agissent dans le navigateur, comme une personne. Rien à développer pour démarrer.</p></div>
        <div className="integrations">
          <div>
            <h3>Dans la démo aujourd&apos;hui</h3>
            <ul><li>Logiciel RH et badges</li><li>Messagerie d&apos;équipe</li><li>Wiki interne</li></ul>
            <p className="petit">Outils maison d&apos;une entreprise fictive, Atelier Nova, sans API : le cas où l&apos;automatisation classique échoue.</p>
          </div>
          <div>
            <h3>Prévu ensuite</h3>
            <ul className="bientot-liste"><li>Slack et Microsoft Teams</li><li>Notion et Confluence</li><li>Gmail et Outlook</li><li>Google Agenda</li></ul>
            <p className="petit">Feuille de route : non disponible aujourd&apos;hui.</p>
          </div>
        </div>
      </section>

      <section id="confiance" className="wrap section">
        <div className="cockpit bandeau-sombre">
          <span className="eyebrow">Vous gardez la main</span>
          <h2>Un assistant qui montre tout, et demande avant d&apos;agir.</h2>
          <div className="piliers">
            <div><b>Accord outil par outil</b><p>Seuls les outils que vous cochez sont utilisés.</p></div>
            <div><b>Toujours visible</b><p>Une pastille, un bouton pause, l&apos;écran de chaque agent et ses clics en direct.</p></div>
            <div><b>Prouvé, pas annoncé</b><p>Chaque action est contrôlée dans l&apos;outil. Le rapport dit aussi ce qui n&apos;est pas mesuré.</p></div>
            <div><b>L&apos;humain décide</b><p>Question en cas de doute, validation avant toute action irréversible.</p></div>
          </div>
        </div>
      </section>

      <section id="roi" className="wrap section">
        <div className="sec-tete"><span className="eyebrow">Le temps gagné</span><h2>Calculez ce que vous récupérez.</h2></div>
        <Roi />
      </section>

      <section id="tarifs" className="wrap section">
        <div className="sec-tete"><span className="eyebrow">Tarifs</span><h2>Un prix simple, par mois.</h2>
          <p className="lead">Sans engagement. <b style={{ color: "var(--ochre-700)" }}>Tarifs de démonstration : le prix définitif n&apos;est pas encore fixé.</b></p></div>
        <Plans />
      </section>

      <section id="faq" className="wrap section">
        <div className="sec-tete"><span className="eyebrow">Questions fréquentes</span><h2>Avant de se lancer.</h2></div>
        <div className="faq">
          {faq.map((f) => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.r}</p></details>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="cockpit bandeau-final">
          <h2>La prochaine arrivée, vous la préparez en trois minutes.</h2>
          <Link href="/inscription" className="btn btn-primary btn-grand">Commencer</Link>
        </div>
      </section>
    </>
  );
}
