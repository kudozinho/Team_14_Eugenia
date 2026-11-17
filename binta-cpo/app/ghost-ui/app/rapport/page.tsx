import { getFiche, getExecution } from "@/lib/data";
import Prouver from "../prouver";

function Ligne({ k, children }: { k: string; children: React.ReactNode }) {
  return <div><dt>{k}</dt><dd>{children}</dd></div>;
}

function Anneau({ valeur }: { valeur: number }) {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" role="img" aria-label={`Score ${valeur} sur 100`}>
      <circle cx="52" cy="52" r={r} fill="none" stroke="#e1e9e4" strokeWidth="10" />
      <circle cx="52" cy="52" r={r} fill="none" stroke="#0b7a55" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${(valeur / 100) * c} ${c}`} transform="rotate(-90 52 52)" />
      <text x="52" y="56" textAnchor="middle" fontSize="28" fontWeight="800" fill="#0e1b14" style={{ fontFamily: "var(--font-jakarta)" }}>{valeur}</text>
      <text x="52" y="72" textAnchor="middle" fontSize="10" fill="#66756c">sur 100</text>
    </svg>
  );
}

export default function Rapport() {
  const f = getFiche();
  const m = f.metier;
  const t = f.technique;
  const exec = getExecution();

  return (
    <>
      <p className="eyebrow">Fiche d'opportunité n°{f.numero}</p>
      <h1>{f.titre}</h1>
      <p className="sub">Une page, deux axes : la personne qui met en place commence sans rappeler personne.</p>

      <section className="card" style={{ marginBottom: 18 }}>
        <div className="report-head">
          <Anneau valeur={f.score} />
          <div>
            <div className="row">
              <span className="pill ok">Gain rapide</span>
              <span className="pill agent_h">Agent H</span>
              <span className="chip">Confiance {f.confiance}/5</span>
            </div>
            <div className="stats">
              <div className="stat"><b className="num">{m.heures_an} h</b><span>récupérables par an</span></div>
              <div className="stat"><b className="num">{m.temps_par_an_h} h</b><span>passées aujourd'hui par an</span></div>
              <div className="stat"><b>1 jour</b><span>de mise en place</span></div>
              <div className="stat"><b>≈ 90 $</b><span>de coût par an</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid g2" style={{ marginBottom: 18 }}>
        <section className="card">
          <h2>Axe métier</h2>
          <dl className="kv">
            <Ligne k="Le process, en clair">{m.process}</Ligne>
            <Ligne k="Déclencheur">{m.declencheur}</Ligne>
            <Ligne k="Fréquence">{m.frequence}</Ligne>
            <Ligne k="Durée aujourd'hui">{m.duree_aujourdhui}</Ligne>
            <Ligne k="Gain attendu">{m.gain_attendu}</Ligne>
            <Ligne k="Impact sur l'équipe">{m.impact_equipe}</Ligne>
            <Ligne k="Le temps libéré sert à">{m.temps_libere}</Ligne>
            <Ligne k="À vérifier">{m.hypotheses}</Ligne>
          </dl>
        </section>

        <section className="card">
          <h2>Axe technique</h2>
          <dl className="kv">
            <Ligne k="Outil recommandé"><b>{t.outil === "agent_h" ? "Agent H" : t.outil}</b>. {t.raison}</Ligne>
            <Ligne k="Options écartées"><ul className="clean">{t.options_ecartees.map((o: string) => <li key={o}>{o}</li>)}</ul></Ligne>
            <Ligne k="Étapes de l'automatisation">
              <ol className="steps">{t.etapes.map((e: string) => <li key={e}>{e}</li>)}</ol>
            </Ligne>
            <Ligne k="Données en entrée">{t.entrees}</Ligne>
            <Ligne k="Données en sortie">{t.sorties}</Ligne>
            <Ligne k="Critère de recette">{t.recette}</Ligne>
            <Ligne k="Compétence">{t.competence}</Ligne>
            <Ligne k="Maintenance">{t.maintenance}</Ligne>
          </dl>
          <div className="alert" style={{ marginTop: 18 }}>
            <h3>Points de vigilance</h3>
            <ul className="clean">{t.vigilance.map((v: string) => <li key={v}>{v}</li>)}</ul>
          </div>
        </section>
      </div>

      <Prouver exemple={exec} />
    </>
  );
}
