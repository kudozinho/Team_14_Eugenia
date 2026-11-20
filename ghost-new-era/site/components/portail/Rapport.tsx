// Rapport final : uniquement des chiffres lus dans la base. Ce qui n'est pas mesuré est écrit comme tel.
export type DonneesRapport = {
  runs: { agent: string; statut: string; debut: string; fin: string | null; actions_verifiees: number; actions_total: number; cout_credits: number | null }[];
  evenements: { outil: string | null; statut: string }[];
  decisions: { libelle: string; statut: string }[];
  rapport: { personne: { prenom: string; nom: string; poste: string } | null; preuve: Record<string, boolean>; onboardings_par_an: number | null; materiel: { article: string; statut: string }[] } | null;
};

const ELEMENTS: [string, string, string][] = [
  ["fiche", "Fiche RH créée", "Espace RH"], ["acces", "Accès du poste demandés", "Espace RH"], ["badge", "Badge demandé", "Espace RH"],
  ["canal", "Bienvenue dans le canal de l'équipe", "Messagerie"], ["message", "Annonce dans # accueil", "Messagerie"],
  ["parrain", "Parrain demandé au manager", "Messagerie"], ["cafe", "Café d'accueil proposé", "Messagerie"],
  ["page_wiki", "Page de bienvenue créée", "Wiki"], ["checklist", "Checklist jour 1, semaine 1, mois 1", "Wiki"],
];
const NOMS: Record<string, string> = { acces: "Accès", equipe: "Équipe", docs: "Docs" };
const HEURES_REFERENCE = 2; // HYPOTHÈSE de l'équipe : environ 2 h par arrivée, non encore chronométrée.

const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, "0")} s` : `${Math.round(s)} s`);
const sec = (a: string, b: string | null) => (b ? (new Date(b).getTime() - new Date(a).getTime()) / 1000 : 0);

export default function Rapport({ d, onFermer }: { d: DonneesRapport; onFermer: () => void }) {
  const r = d.rapport;
  const prenom = r?.personne?.prenom ?? "La personne";
  const preuve = r?.preuve ?? {};
  const presents = ELEMENTS.filter(([k]) => preuve[k]).length;
  const pret = presents === ELEMENTS.length;
  const debut = Math.min(...d.runs.map((x) => new Date(x.debut).getTime()));
  const fin = Math.max(...d.runs.map((x) => (x.fin ? new Date(x.fin).getTime() : 0)));
  const parallele = (fin - debut) / 1000;
  const cumule = d.runs.reduce((t, x) => t + sec(x.debut, x.fin), 0);
  const verifiees = d.runs.reduce((t, x) => t + x.actions_verifiees, 0);
  const total = d.runs.reduce((t, x) => t + x.actions_total, 0);
  const reussis = d.runs.filter((x) => x.statut === "termine").length;
  const outils = new Set(d.evenements.map((e) => e.outil).filter(Boolean)).size;
  const validees = d.decisions.filter((x) => x.statut === "validee").length;
  const commande = r?.materiel?.[0];
  const heuresAn = r?.onboardings_par_an ? Math.round(r.onboardings_par_an * HEURES_REFERENCE * 10) / 10 : null;

  const carte = (valeur: string, texte: string) => (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontFamily: "var(--font-titres)", fontWeight: 800, fontSize: "1.9rem", color: "var(--g-900)", lineHeight: 1.1 }}>{valeur}</div>
      <p style={{ marginTop: 6 }}>{texte}</p>
    </div>
  );

  return (
    <article aria-label="Rapport final" style={{ display: "grid", gap: 16 }}>
      <header style={{ background: "var(--g-900)", color: "#fff", borderRadius: 22, padding: 28 }}>
        <span style={{ color: "var(--o-400)", fontFamily: "var(--font-titres)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.8rem" }}>Rapport final</span>
        <h2 style={{ color: "#fff", fontSize: "2rem", margin: "8px 0" }}>{pret ? `${prenom} est prêt pour son jour 1` : `${prenom} : préparation incomplète`}</h2>
        <p style={{ color: "#fff", opacity: 0.9 }}>
          {pret ? "Accès, badge, parrain, page de bienvenue : chaque élément a été confirmé dans l'outil, pas seulement annoncé par l'agent."
                : `${presents} éléments sur ${ELEMENTS.length} confirmés dans les outils. Voir le détail ci-dessous : rien n'est compté sans preuve.`}
        </p>
      </header>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        {carte(`${presents}/${ELEMENTS.length}`, "éléments confirmés dans la base")}
        {carte(`${verifiees}/${total}`, `actions des agents vérifiées dans ${outils} outils`)}
        {carte(fmt(parallele), `pour les ${d.runs.length} agents en parallèle, contre ${fmt(cumule)} l'un après l'autre`)}
        {carte(`${reussis}/${d.runs.length}`, "agents terminés avec succès sur ce run")}
        {carte(`${validees}/${d.decisions.length}`, "décisions humaines prises (question de l'agent, commande)")}
      </div>
      <p style={{ fontSize: "0.9rem", color: "var(--mute)" }}>Les durées incluent le temps où les agents ont attendu tes réponses.</p>

      <section className="card">
        <h3>Ce qui a été fait, et prouvé dans l&apos;outil</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 6 }}>
          {ELEMENTS.map(([k, libelle, outil]) => (
            <li key={k}>{preuve[k] ? "☑" : "☐"} {libelle} <span style={{ color: "var(--mute)" }}>· {outil}</span></li>
          ))}
          {commande && <li>{commande.statut === "valide" ? "☑" : "⏸"} {commande.article} : {commande.statut === "valide" ? "commande validée par toi" : "en attente de ta validation"} <span style={{ color: "var(--mute)" }}>· décision humaine</span></li>}
        </ul>
      </section>

      <section className="card" style={{ borderColor: "var(--ochre-700)" }}>
        <h3>Ce qui n&apos;est pas mesuré, ou pas prouvé</h3>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "grid", gap: 6, color: "var(--ink-2)" }}>
          <li><b>Coût en crédits H</b> : non mesuré pour ce run.</li>
          <li><b>Gain de temps</b> : l&apos;hypothèse de l&apos;équipe est d&apos;environ {HEURES_REFERENCE} h par arrivée à la main, <b>non chronométrée</b>. {heuresAn ? `Avec tes ${r?.onboardings_par_an} onboardings par an, cela ferait environ ${heuresAn} h par an : une estimation, pas une mesure.` : ""}</li>
          <li><b>Taux de réussite</b> : ce rapport décrit un seul run, il ne permet pas d&apos;en tirer un taux.</li>
        </ul>
      </section>

      <p><button className="btn btn-secondary" onClick={onFermer}>Revenir à l&apos;intranet</button></p>
    </article>
  );
}
