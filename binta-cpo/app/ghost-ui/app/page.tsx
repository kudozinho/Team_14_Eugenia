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

      <section className="hero" aria-label="Heures récupérables">
        <div>
          <div className="big num">{total}<small>h / an</small></div>
          <p>récupérables sur 3 tâches, justifiées une par une.</p>
          <div className="split-bar" role="img" aria-label={`${agentH} heures par l'agent H, ${n8n} heures par n8n`}>
            <i style={{ flex: agentH, background: "#7ee0b4" }} />
            <i style={{ flex: n8n, background: "#c9c9ff" }} />
          </div>
          <div className="legend">
            <span><span className="dot" style={{ background: "#7ee0b4" }} /><b className="num">{agentH} h</b> par l'agent H</span>
            <span><span className="dot" style={{ background: "#c9c9ff" }} /><b className="num">{n8n} h</b> par n8n</span>
          </div>
        </div>
        <div className="facts">
          <div className="fact"><b className="num">{taches.length}</b><span>tâches classées par score</span></div>
          <div className="fact"><b>0</b><span>donnée par personne affichée</span></div>
        </div>
      </section>

      <div className="grid split" style={{ marginTop: 18 }}>
        <section className="card">
          <h2>Tâches classées par score</h2>
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
                  <div className="muted" style={{ marginTop: 6 }}>Vigilance : {t.vigilance}</div>
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
          <h2>Matrice gain / effort</h2>
          <Matrice taches={taches} />
          <p className="muted" style={{ marginTop: 10 }}>Taille du point : heures par an · couleur : outil recommandé. Survolez un point pour le détail.</p>
        </section>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
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
