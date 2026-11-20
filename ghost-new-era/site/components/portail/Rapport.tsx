import Fantome from "@/components/portail/Fantome";
import { agentInfo } from "@/lib/agents";

// Rapport final : uniquement des chiffres lus dans la base. Ce qui n'est pas mesuré est écrit comme tel.
export type DonneesRapport = {
  runs: { agent: string; statut: string; debut: string; fin: string | null; actions_verifiees: number; actions_total: number; cout_credits: number | null }[];
  evenements: { outil: string | null; statut: string }[];
  decisions: { libelle: string; statut: string }[];
  rapport: { personne: { prenom: string; nom: string; poste: string } | null; preuve: Record<string, boolean>; onboardings_par_an: number | null; materiel: { article: string; statut: string }[] } | null;
};

const GROUPES: { agent: string; items: [string, string][] }[] = [
  { agent: "acces", items: [["fiche", "Fiche RH créée"], ["acces", "Accès du poste demandés"], ["badge", "Badge demandé"]] },
  { agent: "equipe", items: [["canal", "Bienvenue dans le canal de l'équipe"], ["message", "Annonce dans l'accueil"], ["parrain", "Parrain demandé au manager"], ["cafe", "Café d'accueil proposé"]] },
  { agent: "docs", items: [["page_wiki", "Page de bienvenue créée"], ["checklist", "Checklist jour 1, semaine 1, mois 1"]] },
];
const HEURES_REFERENCE = 2; // HYPOTHÈSE de l'équipe : environ 2 h par arrivée, non chronométrée.

const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, "0")} s` : `${Math.round(s)} s`);
const ms = (x: string | null) => (x ? new Date(x).getTime() : 0);

export default function Rapport({ d, onFermer }: { d: DonneesRapport; onFermer: () => void }) {
  const r = d.rapport;
  const prenom = r?.personne?.prenom ?? "La personne";
  const preuve = r?.preuve ?? {};
  const total = GROUPES.reduce((n, g) => n + g.items.length, 0);
  const presents = GROUPES.reduce((n, g) => n + g.items.filter(([k]) => preuve[k]).length, 0);
  const pret = presents === total;
  const t0 = Math.min(...d.runs.map((x) => ms(x.debut)));
  const t1 = Math.max(...d.runs.map((x) => ms(x.fin)));
  const duree = Math.max(1, (t1 - t0) / 1000);
  const cumule = d.runs.reduce((n, x) => n + Math.max(0, (ms(x.fin) - ms(x.debut)) / 1000), 0);
  const verifiees = d.runs.reduce((n, x) => n + x.actions_verifiees, 0);
  const totalActions = d.runs.reduce((n, x) => n + x.actions_total, 0);
  const validees = d.decisions.filter((x) => x.statut === "validee").length;
  const jetons = d.runs.reduce((n, x) => n + (x.cout_credits ?? 0), 0);
  const commande = r?.materiel?.[0];
  const heuresAn = r?.onboardings_par_an ? Math.round(r.onboardings_par_an * HEURES_REFERENCE * 10) / 10 : null;
  const rayon = 52, circ = 2 * Math.PI * rayon;
  const connectes = ["Slack", "Gmail", "Notion"].filter((o) => d.evenements.some((e) => e.outil === o && e.statut === "ok"));

  return (
    <article className="rapport2" aria-label="Rapport final">
      <header className="rp-hero">
        <div className="rp-anneau" role="img" aria-label={`${presents} éléments sur ${total} confirmés`}>
          <svg viewBox="0 0 120 120" width="132" height="132">
            <circle cx="60" cy="60" r={rayon} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="9" />
            <circle cx="60" cy="60" r={rayon} fill="none" stroke={pret ? "#2e9a63" : "#f4a261"} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={`${(presents / total) * circ} ${circ}`} transform="rotate(-90 60 60)" />
          </svg>
          <b>{presents}<small>/{total}</small></b>
        </div>
        <div>
          <span className="rp-eyebrow">Rapport final</span>
          <h2>{pret ? `${prenom} est prêt pour son jour 1` : `${prenom} : préparation incomplète`}</h2>
          <p>{pret ? "Accès, badge, parrain, page de bienvenue : chaque élément a été confirmé dans l'outil lui-même, pas seulement annoncé par un agent."
                    : `${presents} éléments sur ${total} sont confirmés dans les outils. Rien n'est compté sans preuve.`}</p>
        </div>
      </header>

      <div className="rp-chiffres">
        <div><b>{fmt(duree)}</b><span>pour les 3 agents en parallèle</span><small>{fmt(cumule)} s&apos;ils étaient passés l&apos;un après l&apos;autre</small></div>
        <div><b>{verifiees}/{totalActions}</b><span>actions vérifiées dans les outils</span></div>
        <div><b>{validees}/{d.decisions.length}</b><span>décisions humaines prises</span><small>question de l&apos;agent, commande</small></div>
        {jetons > 0 && <div><b>≈ {Math.round(jetons / 1000)} k</b><span>jetons H consommés</span><small>pour ce run, quota du compte</small></div>}
      </div>

      <section className="rp-bloc">
        <h3>Les trois agents, en parallèle</h3>
        <div className="rp-frise">
          {d.runs.map((x) => {
            const a = agentInfo(x.agent);
            const gauche = ((ms(x.debut) - t0) / 1000 / duree) * 100;
            const largeur = Math.max(2, ((ms(x.fin) - ms(x.debut)) / 1000 / duree) * 100);
            return (
              <div key={x.agent} className="rp-ligne" style={{ ["--c" as string]: a.couleur }}>
                <span className="rp-qui"><Fantome couleur={a.couleur} taille={24} /><b>{a.prenom}</b><small>{a.role}</small></span>
                <span className="rp-piste"><i style={{ left: `${gauche}%`, width: `${largeur}%` }} /></span>
                <span className="rp-temps">{fmt((ms(x.fin) - ms(x.debut)) / 1000)}</span>
              </div>
            );
          })}
        </div>
        <p className="rp-note">Les durées incluent le temps où les agents ont attendu tes réponses.</p>
      </section>

      <section className="rp-bloc">
        <h3>Ce qui a été fait, et prouvé dans l&apos;outil</h3>
        <div className="rp-preuves">
          {GROUPES.map((g) => {
            const a = agentInfo(g.agent);
            return (
              <div key={g.agent} style={{ ["--c" as string]: a.couleur }}>
                <h4><Fantome couleur={a.couleur} taille={18} />{a.prenom}</h4>
                <ul>{g.items.map(([k, l]) => <li key={k} className={preuve[k] ? "ok" : ""}><span className="coche" />{l}</li>)}</ul>
              </div>
            );
          })}
          <div style={{ ["--c" as string]: "#8fd1a8" }}>
            <h4>Décision humaine</h4>
            <ul>{commande
              ? <li className={commande.statut === "valide" ? "ok" : ""}><span className="coche" />{commande.article} : {commande.statut === "valide" ? "validée par toi" : "en attente de ta validation"}</li>
              : <li><span className="coche" />Aucune commande</li>}</ul>
            {connectes.length > 0 && <><h4>Outils connectés</h4><ul>{connectes.map((o) => <li key={o} className="ok"><span className="coche" />{o}</li>)}</ul></>}
          </div>
        </div>
      </section>

      <section className="rp-bloc rp-limites">
        <h3>Ce qui n&apos;est pas mesuré, ou pas prouvé</h3>
        <ul>
          <li><b>Gain de temps</b> : l&apos;hypothèse de l&apos;équipe est d&apos;environ {HEURES_REFERENCE} h par arrivée à la main, <b>non chronométrée</b>.{heuresAn ? ` Avec tes ${r?.onboardings_par_an} onboardings par an, cela ferait environ ${heuresAn} h : une estimation, pas une mesure.` : ""}</li>
          <li><b>Coût</b> : {jetons > 0 ? "mesuré en jetons H, non converti en euros." : "non mesuré pour ce run."}</li>
          <li><b>Taux de réussite</b> : ce rapport décrit un seul run, il ne permet pas d&apos;en tirer un taux.</li>
        </ul>
      </section>

      <p><button className="btn btn-secondary" onClick={onFermer}>Revenir à l&apos;intranet</button></p>
    </article>
  );
}
