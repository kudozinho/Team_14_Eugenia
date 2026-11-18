import { getFiche, getExecution, formatDuree } from "@/lib/data";
import { Rich, splitDetail, splitTitre, phrases } from "@/lib/rich";
import Prouver from "../prouver";

function Anneau({ valeur }: { valeur: number }) {
  const r = 40, c = 2 * Math.PI * r;
  return (
    <svg width="116" height="116" viewBox="0 0 116 116" role="img" aria-label={`Score ${valeur} sur 100`}>
      <circle cx="58" cy="58" r={r} fill="none" stroke="#e1e9e4" strokeWidth="11" />
      <circle cx="58" cy="58" r={r} fill="none" stroke="url(#ag)" strokeWidth="11" strokeLinecap="round"
        strokeDasharray={`${(valeur / 100) * c} ${c}`} transform="rotate(-90 58 58)" />
      <defs><linearGradient id="ag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#12a874" /><stop offset="1" stopColor="#0b7a55" /></linearGradient></defs>
      <text x="58" y="62" textAnchor="middle" fontSize="32" fontWeight="800" fill="#0e1b14" style={{ fontFamily: "var(--font-jakarta)" }}>{valeur}</text>
      <text x="58" y="80" textAnchor="middle" fontSize="11" fill="#66756c">sur 100</text>
    </svg>
  );
}

function Titre({ id, n, children, sub }: { id: string; n: string; children: React.ReactNode; sub: string }) {
  return (
    <div className="sec-title" id={id}>
      <span className="sec-n">{n}</span>
      <div><h2>{children}</h2><p className="muted">{sub}</p></div>
    </div>
  );
}

export default function Rapport() {
  const f = getFiche();
  const m = f.metier;
  const t = f.technique;
  const exec = getExecution();

  const [freq, freqDetail] = splitDetail(m.frequence);
  const [duree, dureeDetail] = splitDetail(m.duree_aujourdhui);
  const gain = phrases(m.gain_attendu);
  const recette = t.recette.split(/,\s*/);
  const dureeAgent = t.preuve.duree_agent_s;
  const dureeHumaine = t.preuve.duree_humaine_s;

  return (
    <>
      <p className="eyebrow">Fiche d'opportunité n°{f.numero}</p>
      <h1>{f.titre}</h1>

      <section className="card lead-card">
        <div className="report-head">
          <Anneau valeur={f.score} />
          <div>
            <p className="lead">
              L'agent H recopie l'annonce sur les 3 sites en <strong>{formatDuree(dureeAgent)}</strong> au lieu de{" "}
              <strong>{formatDuree(dureeHumaine)}</strong> à la main : <strong>{m.heures_an} h</strong> récupérées par an.
            </p>
            <div className="row">
              <span className="pill ok">Gain rapide</span>
              <span className="pill agent_h">Agent H</span>
              <span className="chip">Confiance {f.confiance}/5</span>
              <span className="chip">{m.qui}</span>
            </div>
          </div>
        </div>
        <div className="stats">
          <div className="stat"><b className="num">{m.heures_an} h</b><span>récupérables par an</span></div>
          <div className="stat"><b className="num">{m.temps_par_an_h} h</b><span>passées aujourd'hui par an</span></div>
          <div className="stat"><b>1 jour</b><span>de mise en place</span></div>
          <div className="stat"><b>≈ 90 $</b><span>de coût d'exécution par an</span></div>
        </div>
      </section>

      <nav className="anchors" aria-label="Sections du rapport">
        <a href="#metier">1 · Métier</a>
        <a href="#technique">2 · Technique</a>
        <a href="#preuve">3 · Preuve</a>
      </nav>

      {/* ---------- AXE MÉTIER ---------- */}
      <Titre id="metier" n="1" sub="Ce que vit l'équipe, en clair, sans jargon.">Axe métier</Titre>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Le process aujourd'hui</h3>
        <p className="lead-text"><Rich>{m.process}</Rich></p>
        <div className="facts-row">
          <div className="fr"><span>Déclencheur</span><b>{m.declencheur}</b></div>
          <div className="fr"><span>Fréquence</span><b><Rich>{freq}</Rich></b>{freqDetail && <em><Rich>{freqDetail}</Rich></em>}</div>
          <div className="fr"><span>Durée aujourd'hui</span><b><Rich>{duree}</Rich></b>{dureeDetail && <em>{dureeDetail}</em>}</div>
        </div>
      </section>

      <div className="grid g2" style={{ marginTop: 18 }}>
        <section className="callout good">
          <h3>Gain attendu</h3>
          <ul className="bullets">{gain.map((g) => <li key={g}><Rich>{g}</Rich></li>)}</ul>
        </section>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Pour l'équipe</h3>
          <ul className="bullets">{phrases(m.impact_equipe).map((p) => <li key={p}><Rich>{p}</Rich></li>)}</ul>
          <h3>Le temps libéré sert à</h3>
          <p style={{ margin: 0 }}><Rich>{m.temps_libere}</Rich></p>
        </section>
      </div>

      <section className="callout info" style={{ marginTop: 18 }}>
        <h3>À vérifier avec l'agence</h3>
        <p style={{ margin: 0 }}><Rich>{m.hypotheses}</Rich></p>
      </section>

      {/* ---------- AXE TECHNIQUE ---------- */}
      <Titre id="technique" n="2" sub="Ce qu'il faut construire, avec quoi, et comment vérifier que ça marche.">Axe technique</Titre>

      <div className="grid g2">
        <section className="card tool">
          <h3 style={{ marginTop: 0 }}>Outil recommandé</h3>
          <div className="row"><span className="pill agent_h big">Agent H</span></div>
          <p className="lead-text" style={{ marginTop: 10 }}>{t.raison}</p>
          <h3>Options écartées</h3>
          <div className="rejects">
            {t.options_ecartees.map((o: string) => {
              const [titre, corps] = splitTitre(o);
              return <div key={o} className="reject"><span aria-hidden="true">✕</span><div><b>{titre}</b>{corps && <p>{corps}</p>}</div></div>;
            })}
          </div>
        </section>

        <section className="card">
          <h3 style={{ marginTop: 0 }}>Étapes de l'automatisation</h3>
          <ol className="steps">{t.etapes.map((e: string) => <li key={e}>{e}</li>)}</ol>
        </section>
      </div>

      <div className="flow" style={{ marginTop: 18 }}>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Données en entrée</h3>
          <p style={{ margin: 0 }}>{t.entrees}</p>
        </section>
        <div className="flow-arrow" aria-hidden="true">→</div>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Données en sortie</h3>
          <p style={{ margin: 0 }}>{t.sorties}</p>
        </section>
      </div>

      <div className="grid g2" style={{ marginTop: 18 }}>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Comment on sait que ça marche</h3>
          <ul className="checks">{recette.map((r: string) => <li key={r}><Rich>{r}</Rich></li>)}</ul>
          <div className="stats">
            <div className="stat"><b>1 jour</b><span><Rich>{t.effort}</Rich></span></div>
            <div className="stat"><b>Junior</b><span>{t.competence.replace(/^Junior : /, "")}</span></div>
          </div>
          <p className="muted" style={{ marginTop: 12 }}>Maintenance : <Rich>{t.maintenance}</Rich></p>
        </section>

        <section className="callout warn">
          <h3>Points de vigilance</h3>
          <ul className="vigil">
            {t.vigilance.map((v: string) => {
              const [titre, corps] = splitTitre(v);
              return <li key={v}><b>{titre}</b>{corps && <> : {corps}</>}</li>;
            })}
          </ul>
        </section>
      </div>

      {/* ---------- PREUVE ---------- */}
      <Titre id="preuve" n="3" sub="On ne promet pas : on mesure, en direct.">Preuve</Titre>
      <Prouver exemple={exec} />
    </>
  );
}
