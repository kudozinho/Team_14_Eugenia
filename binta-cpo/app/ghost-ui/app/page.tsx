import { getTaches, getTotalHeures, getOrganisation, getPistes, formatDuree, LABEL_METHODE } from "@/lib/data";
import Matrice from "./matrice";
import Link from "next/link";

export default function Dashboard() {
  const taches = getTaches();
  const total = getTotalHeures();
  const pistes = getPistes();
  const agentH = taches.filter((t) => t.methode === "agent_h").reduce((s, t) => s + t.heures_an, 0);
  const n8n = taches.filter((t) => t.methode === "n8n").reduce((s, t) => s + t.heures_an, 0);

  return (
    <>
      <p className="eyebrow">Compte rendu d'audit · {getOrganisation()}</p>
      <h1>Ce que Ghost a trouvé</h1>
      <p className="sub">
        Les tâches répétitives de l'agence, classées par score, avec le bon outil pour chacune.
        Ghost classe des tâches, jamais des personnes.
      </p>

      <section className="kpis" aria-label="Chiffres clés">
        <div className="hero">
          <span className="hero-label">Heures récupérables</span>
          <div className="big num">{total}<small>h / an</small></div>
          <p>sur {taches.length} tâches, justifiées une par une.</p>
          <div className="split-bar" role="img" aria-label={`${agentH} heures par l'agent H, ${n8n} heures par n8n`}>
            <i style={{ flex: agentH, background: "var(--g-300)" }} />
            <i style={{ flex: n8n, background: "var(--o-400)" }} />
          </div>
          <div className="legend">
            <span><span className="dot" style={{ background: "var(--g-300)" }} /><b className="num">{agentH} h</b> par l'agent H</span>
            <span><span className="dot" style={{ background: "var(--o-400)" }} /><b className="num">{n8n} h</b> par n8n</span>
          </div>
        </div>
        <div className="kpi">
          <b className="num">{taches.length}</b>
          <span>tâches répétitives mesurées pendant l'audit</span>
        </div>
        <div className="kpi">
          <b>0</b>
          <span>donnée par personne : Ghost classe des tâches, jamais des gens</span>
        </div>
      </section>

      <div className="sec-title">
        <div><h2>Les tâches répétitives</h2><p className="sec-sub">Le score sur 100 combine gain, facilité, effort, risque et confiance.</p></div>
      </div>

      <div className="grid split">
        <section className="card">
          <div className="card-head"><h3>Classement</h3><p className="card-sub">La plus rentable en premier.</p></div>
          <ol className="rank">
            {taches.map((t, i) => (
              <li key={t.id}>
                <span className="n">{i + 1}</span>
                <div>
                  <div className="t">{t.id === "tache_001" ? <Link href="/rapport">{t.nom}</Link> : t.nom}</div>
                  <div className="meta">
                    <span className={`pill ${t.methode}`}>{LABEL_METHODE[t.methode]}</span>
                    <span className="chip num">{t.heures_an} h / an</span>
                    <span className="chip num">{formatDuree(t.duree_humaine_s)} aujourd'hui</span>
                  </div>
                  <div className="vig-line"><b>Vigilance</b> {t.vigilance}</div>
                </div>
                <div className="score">
                  <b className="num">{t.score.total}</b><span>/100</span>
                  <div className="scorebar"><i style={{ width: `${t.score.total}%` }} /></div>
                </div>
              </li>
            ))}
          </ol>
          <p className="note">Règle d'outil : API disponible → n8n · pas d'API → agent H · déjà couvert par le logiciel → rien à construire.</p>
        </section>

        <section className="card">
          <div className="card-head"><h3>Gain et effort</h3><p className="card-sub">En haut à gauche : beaucoup de gain pour peu d'effort.</p></div>
          <Matrice taches={taches} />
        </section>
      </div>

      <div className="sec-title">
        <div><h2>Les autres pistes</h2><p className="sec-sub">Repérées pendant l'audit, mais pas comptées dans les {total} h.</p></div>
      </div>

      <div className="stack">
        <details className="fold">
          <summary><span>Autres pistes à confirmer pendant l'audit <span className="chip num">{pistes.totalAConfirmer} h / an possibles</span></span></summary>
          <div className="body">
            <p className="muted">Ces heures ne sont <b>jamais additionnées</b> aux {total} h ci-dessus : elles restent à mesurer.</p>
            {pistes.aConfirmer.map((p) => (
              <div className="list-row" key={p.id}>
                <div>{p.nom}<div className="muted">{p.pourquoi}</div></div>
                <div className="row" style={{ flexWrap: "nowrap" }}>
                  <span className={`pill ${p.methode}`}>{LABEL_METHODE[p.methode ?? "rien"]}</span>
                  <span className="num" style={{ minWidth: 48, textAlign: "right" }}>{p.heures_an} h</span>
                </div>
              </div>
            ))}
          </div>
        </details>

        <details className="fold">
          <summary><span>Déjà couvert par votre logiciel : rien à construire</span></summary>
          <div className="body">
            {pistes.dejaCouvert.map((p) => (
              <div className="list-row" key={p.id}>
                <div>{p.nom}<div className="muted">{p.pourquoi}</div></div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}
