import { executionValide, mediane, chargerFiche, getExecution, getExecutionMesuree, getHistoriqueExecutions, formatDuree } from "@/lib/data";
import RapportExecution from "./execution";
import { tacheIdConfiguree } from "@/lib/tache";
import { Rich, splitDetail, splitTitre, phrases } from "@/lib/rich";
import Prouver from "../prouver";
import Direct from "../direct";

export const dynamic = "force-dynamic";

function Anneau({ valeur }: { valeur: number }) {
  const r = 40, c = 2 * Math.PI * r;
  return (
    <svg width="116" height="116" viewBox="0 0 116 116" role="img" aria-label={`Score ${valeur} sur 100`}>
      <circle cx="58" cy="58" r={r} fill="none" stroke="#e8e2d6" strokeWidth="11" />
      <circle cx="58" cy="58" r={r} fill="none" stroke="url(#ag)" strokeWidth="11" strokeLinecap="round"
        strokeDasharray={`${(valeur / 100) * c} ${c}`} transform="rotate(-90 58 58)" />
      <defs><linearGradient id="ag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2e9a63" /><stop offset="1" stopColor="#1d6b47" /></linearGradient></defs>
      <text x="58" y="62" textAnchor="middle" fontSize="32" fontWeight="800" fill="#18201b" style={{ fontFamily: "var(--font-jakarta)" }}>{valeur}</text>
      <text x="58" y="80" textAnchor="middle" fontSize="11" fill="#6e776f">sur 100</text>
    </svg>
  );
}

function Section({ id, titre, sub }: { id: string; titre: string; sub: string }) {
  return (
    <div className="sec-title" id={id}>
      <div><h2>{titre}</h2><p className="sec-sub">{sub}</p></div>
    </div>
  );
}

// Le rapport se lit comme une décision : avant / après (avec la preuve en direct),
// puis ce qu'on gagne, ce qu'il faut construire, et les risques.
export default async function Rapport({ searchParams }: { searchParams?: { tache?: string; audit?: string } }) {
  const demandee = searchParams?.tache;
  const choix = await chargerFiche(demandee || process.env.TACHE_ID || undefined, { strict: !!demandee, audit: searchParams?.audit });
  if (choix.source === "introuvable") {
    return (
      <>
        <p className="eyebrow">Fiche d'opportunité</p>
        <h1>Tâche introuvable</h1>
        <div className="alert" role="alert">
          <p style={{ margin: 0 }}>{"motif" in choix ? choix.motif : "Tâche introuvable."} Aucune autre tâche n'est affichée à sa place.</p>
        </div>
        <p><a className="btn" href="/rapport">Voir le rapport de la tâche configurée</a></p>
      </>
    );
  }
  const f = choix.fiche;
  const m = f.metier;
  const t = f.technique;
  const tacheId = choix.source === "base" ? choix.tacheId : tacheIdConfiguree();
  const mesure = await getExecutionMesuree(tacheId);
  const historique = await getHistoriqueExecutions(tacheId);
  const exec = mesure ?? getExecution();

  const [freq, freqDetail] = splitDetail(m.frequence);
  const [dureeFiche, dureeDetailFiche] = splitDetail(m.duree_aujourdhui);
  const gain = phrases(m.gain_attendu);
  const recette = t.recette.split(/,\s*/);
  // Durée de l'agent : médiane des exécutions terminées (plus fiable qu'un seul essai), sinon l'exemple.
  const terminees = historique.lignes.filter(executionValide);
  const dureeAgent = mediane(terminees.map((l) => l.duree_s as number)) ?? mesure?.duree_s ?? t.preuve.duree_agent_s;
  const dureeHumaine = mesure?.duree_humaine_s ?? t.preuve.duree_humaine_s;
  // Avec une exécution mesurée : la référence « à la main » est celle de la tâche en base, pas les 12 min de l'exemple.
  const duree = mesure ? `${formatDuree(dureeHumaine)} par opération` : dureeFiche;
  const dureeDetail = mesure ? "moyenne chronométrée à la main sur 3 essais" : dureeDetailFiche;

  return (
    <>
      <Direct source={choix.source} maj={new Date().toISOString()} />
      <p className="eyebrow">Fiche d'opportunité n°{f.numero}</p>
      <h1>{f.titre}</h1>

      {/* ---------- LA DÉCISION ---------- */}
      <section className="card lead-card">
        <div className="report-head">
          <Anneau valeur={f.score} />
          <div>
            <p className="lead">
              L'agent H recopie l'annonce sur les 3 sites en <strong>{formatDuree(dureeAgent)}</strong>
              {terminees.length > 1 && <> (médiane de {terminees.length} exécutions)</>}, contre{" "}
              <strong>{formatDuree(dureeHumaine)}</strong> à la main : <strong>{m.heures_an} h</strong> récupérables par an{choix.provisoire ? <> (<strong>gain annuel provisoire</strong>)</> : " selon les hypothèses"}.
            </p>
            <div className="row">
              <span className={`pill ${f.quadrant === "gain_rapide" ? "ok" : "rien"}`}>{({ gain_rapide: "Gain rapide", projet: "Projet", a_regrouper: "À regrouper", a_ecarter: "À écarter" } as Record<string, string>)[f.quadrant] ?? "À classer"}</span>
              <span className="pill agent_h">Agent H</span>
              <span className="chip">Confiance {f.confiance}/5</span>
              <span className="chip">{m.qui}</span>
            </div>
          </div>
        </div>
        <div className="stats">
          <div className="stat"><b className="num">{m.heures_an} h</b><span>récupérables par an{choix.provisoire ? " (gain annuel provisoire)" : ""}</span></div>
          <div className="stat"><b className="num">{m.temps_par_an_h} h</b><span>passées aujourd'hui par an</span></div>
          <div className="stat"><b>1 jour</b><span>de mise en place</span></div>
          <div className="stat"><b>≈ 90 $</b><span>de coût d'exécution par an</span></div>
        </div>
      </section>

      <nav className="anchors" aria-label="Sections du rapport">
        <a href="#avant-apres">Avant, après</a>
        <a href="#gain">Ce qu'on gagne</a>
        <a href="#construire">Ce qu'il faut construire</a>
        <a href="#risques">Les risques</a>
      </nav>

      {/* ---------- AVANT / APRÈS ---------- */}
      <Section id="avant-apres" titre="Avant, après" sub="La même tâche, à la main puis avec l'agent H." />

      <div className="duel">
        <section className="card dcard avant">
          <h4 className="dcard-tag">Aujourd'hui, à la main</h4>
          <div className="dcard-time num">{formatDuree(dureeHumaine)}<span>par opération</span></div>
          <p className="lead-text"><Rich>{m.process}</Rich></p>
          <dl className="dcard-facts">
            <div><dt>Déclencheur</dt><dd>{m.declencheur}</dd></div>
            <div><dt>Fréquence</dt><dd><Rich>{freq}</Rich>{freqDetail && <em><Rich>{freqDetail}</Rich></em>}</dd></div>
            <div><dt>Durée</dt><dd><Rich>{duree}</Rich>{dureeDetail && <em>{dureeDetail}</em>}</dd></div>
          </dl>
        </section>

        <div className="duel-arrow" aria-hidden="true">→</div>

        <section className="card dcard apres">
          <h4 className="dcard-tag">Demain, avec l'agent H</h4>
          <div className="dcard-time num">{formatDuree(dureeAgent)}<span>par opération{terminees.length > 1 ? `, médiane de ${terminees.length}` : ", mesuré"}</span></div>
          <p className="lead-text">{t.raison} L'agent fait le travail, l'assistante valide.</p>
          <ol className="steps">{t.etapes.map((e: string) => <li key={e}>{e}</li>)}</ol>
        </section>
      </div>

      <div id="preuve" className="duel-proof">
        <Prouver exemple={exec} tacheId={tacheId} />
      </div>
      <div style={{ marginTop: 18 }}><RapportExecution h={historique} tacheId={tacheId} /></div>

      {/* ---------- CE QU'ON GAGNE ---------- */}
      <Section id="gain" titre="Ce qu'on gagne" sub="En temps, en argent et pour l'équipe." />

      <div className="grid g2">
        <section className="callout good">
          <h3>Gain attendu</h3>
          <ul className="bullets">{gain.map((g) => <li key={g}><Rich>{g}</Rich></li>)}</ul>
        </section>
        <section className="card">
          <h3>Pour l'équipe</h3>
          <ul className="bullets">{phrases(m.impact_equipe).map((p) => <li key={p}><Rich>{p}</Rich></li>)}</ul>
          <h4>Le temps libéré sert à</h4>
          <p style={{ margin: 0 }}><Rich>{m.temps_libere}</Rich></p>
        </section>
      </div>

      {/* ---------- CE QU'IL FAUT CONSTRUIRE ---------- */}
      <Section id="construire" titre="Ce qu'il faut construire" sub="L'outil, ce qui entre et sort, et comment on sait que ça marche." />

      <div className="flow">
        <section className="card">
          <h3>Données en entrée</h3>
          <p style={{ margin: 0 }}>{t.entrees}</p>
        </section>
        <div className="flow-arrow" aria-hidden="true">→</div>
        <section className="card">
          <h3>Données en sortie</h3>
          <p style={{ margin: 0 }}>{t.sorties}</p>
        </section>
      </div>

      <div className="grid g2" style={{ marginTop: 20 }}>
        <section className="card">
          <h3>Comment on sait que ça marche</h3>
          <ul className="checks">{recette.map((r: string) => <li key={r}><Rich>{r}</Rich></li>)}</ul>
          <div className="stats">
            <div className="stat"><b>1 jour</b><span><Rich>{t.effort}</Rich></span></div>
            <div className="stat"><b>Junior</b><span>{t.competence.replace(/^Junior : /, "")}</span></div>
          </div>
          <p className="muted" style={{ marginTop: 12 }}>Maintenance : <Rich>{t.maintenance}</Rich></p>
        </section>

        <section className="card tool">
          <h3>Pourquoi l'agent H, et pas autre chose</h3>
          <div className="row"><span className="pill agent_h big">Agent H</span></div>
          <h4>Options écartées</h4>
          <div className="rejects">
            {t.options_ecartees.map((o: string) => {
              const [titre, corps] = splitTitre(o);
              return <div key={o} className="reject"><span aria-hidden="true">✕</span><div><b>{titre}</b>{corps && <p>{corps}</p>}</div></div>;
            })}
          </div>
        </section>
      </div>

      {/* ---------- LES RISQUES ---------- */}
      <Section id="risques" titre="Les risques" sub="Ce qu'il faut surveiller, et ce qui reste à vérifier avec l'agence." />

      <div className="grid g2">
        <section className="callout warn">
          <h3>Points de vigilance</h3>
          <ul className="vigil">
            {t.vigilance.map((v: string) => {
              const [titre, corps] = splitTitre(v);
              return <li key={v}><b>{titre}</b>{corps && <> : {corps}</>}</li>;
            })}
          </ul>
        </section>
        <section className="callout info">
          <h3>À vérifier avec l'agence</h3>
          <p style={{ margin: 0 }}><Rich>{m.hypotheses}</Rich></p>
        </section>
      </div>
    </>
  );
}
