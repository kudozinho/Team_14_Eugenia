import Fantome from "@/components/portail/Fantome";
import { agentInfo } from "@/lib/agents";

// La checklist de l'onboarding, cochée en direct d'après la base (vue v_onboarding) : une ligne n'est cochée que si l'outil l'a confirmée.
const GROUPES: { agent: string; items: [string, string][] }[] = [
  { agent: "acces", items: [["fiche", "Fiche RH créée"], ["acces", "Accès du poste demandés"], ["badge", "Badge demandé"]] },
  { agent: "equipe", items: [["canal", "Bienvenue dans le canal de l'équipe"], ["message", "Annonce dans l'accueil"], ["parrain", "Parrain demandé au manager"], ["cafe", "Café d'accueil proposé"]] },
  { agent: "docs", items: [["page_wiki", "Page de bienvenue créée"], ["checklist", "Checklist jour 1, semaine 1, mois 1"]] },
];

const CONNECTES: [string, string][] = [["Slack", "Message de bienvenue dans Slack"], ["Gmail", "E-mail de bienvenue envoyé"], ["Notion", "Page d'onboarding dans Notion"]];

export default function Checklist({ preuve, runs, evenements = [] }: { preuve: Record<string, boolean>; runs: { agent: string; statut: string }[]; evenements?: { outil: string | null; statut: string }[] }) {
  const etat = (o: string) => evenements.find((e) => e.outil === o);
  const total = GROUPES.reduce((n, g) => n + g.items.length, 0);
  const faits = GROUPES.reduce((n, g) => n + g.items.filter(([k]) => preuve[k]).length, 0);
  return (
    <section className="checklist" aria-label="Checklist de l'onboarding">
      <header>
        <h2>Checklist de l&apos;onboarding</h2>
        <b>{faits} / {total}</b>
      </header>
      <div className="barre-prog" aria-hidden="true"><i style={{ width: `${(faits / total) * 100}%` }} /></div>
      {GROUPES.map((g) => {
        const a = agentInfo(g.agent);
        const run = runs.find((r) => r.agent === g.agent);
        return (
          <div key={g.agent} className="groupe" style={{ ["--c" as string]: a.couleur }}>
            <h3><Fantome couleur={a.couleur} taille={20} actif={run?.statut === "en_cours"} />{a.prenom}<small>{a.role}</small>
              <span className={`etat-pt ${run?.statut ?? ""}`}>{run?.statut === "en_cours" ? "au travail" : run?.statut === "termine" ? "terminé" : run ? "à vérifier" : "en attente"}</span></h3>
            <ul>
              {g.items.map(([k, l]) => (
                <li key={k} className={preuve[k] ? "ok" : ""}><span className="coche" />{l}</li>
              ))}
            </ul>
          </div>
        );
      })}
      <div className="groupe" style={{ ["--c" as string]: "#8fd1a8" }}>
        <h3>Outils connectés</h3>
        <ul>
          {CONNECTES.map(([o, l]) => {
            const e = etat(o);
            return <li key={o} className={e?.statut === "ok" ? "ok" : ""}><span className="coche" />{l}{!e && <small className="petit"> · non connecté</small>}{e?.statut === "echec" && <small className="petit"> · échec</small>}</li>;
          })}
        </ul>
      </div>
      <p className="petit">Une ligne n&apos;est cochée que lorsque l&apos;outil lui-même l&apos;a confirmée.</p>
    </section>
  );
}
