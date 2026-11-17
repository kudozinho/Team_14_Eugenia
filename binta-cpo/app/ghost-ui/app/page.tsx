import { getTaches, getTotalHeures, getOrganisation, getPistes, formatDuree, LABEL_METHODE } from "@/lib/data";
import Matrice from "./matrice";
import Link from "next/link";

export default function Dashboard() {
  const taches = getTaches();
  const total = getTotalHeures();
  const agentH = taches.filter((t) => t.methode === "agent_h").reduce((s, t) => s + t.heures_an, 0);
  const pistes = getPistes();
  const n8n = taches.filter((t) => t.methode === "n8n").reduce((s, t) => s + t.heures_an, 0);

  return (
    <>
      <h1>Tableau de bord</h1>
      <p className="sub">
        {getOrganisation()} · les tâches sont classées, jamais les personnes : aucune donnée par personne n'est affichée.
      </p>

      <div className="grid g3" style={{ marginBottom: 14 }}>
        <div className="card kpi"><b>{total} h</b><span>récupérables par an, justifiées tâche par tâche</span></div>
        <div className="card kpi"><b>{taches.length}</b><span>tâches classées</span></div>
        <div className="card kpi"><b>{agentH} h · {n8n} h</b><span>par l'agent H · par n8n</span></div>
      </div>

      <div className="grid g2">
        <section className="card">
          <h2>Tâches classées par score</h2>
          <div className="scroll-x"><table>
            <thead>
              <tr><th>Tâche</th><th>Outil</th><th className="num">Score</th><th className="num">h/an</th><th className="num">Durée aujourd'hui</th></tr>
            </thead>
            <tbody>
              {taches.map((t) => (
                <tr key={t.id}>
                  <td>
                    {t.id === "tache_001" ? <Link href="/rapport">{t.nom}</Link> : t.nom}
                    <div className="muted">{t.vigilance}</div>
                  </td>
                  <td><span className={`pill ${t.methode}`}>{LABEL_METHODE[t.methode]}</span></td>
                  <td className="num"><b>{t.score.total}</b>/100</td>
                  <td className="num">{t.heures_an}</td>
                  <td className="num">{formatDuree(t.duree_humaine_s)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <p className="note">Règle d'outil : API disponible → n8n · pas d'API → agent H · déjà couvert par le logiciel → rien à construire.</p>
        </section>

        <section className="card">
          <h2>Matrice gain / effort</h2>
          <Matrice taches={taches} />
          <p className="muted">Taille du point = heures par an · couleur = risque (vert faible, orange moyen).</p>
        </section>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <section className="card">
          <h2>Autres pistes : à confirmer pendant l'audit</h2>
          <p className="muted">{pistes.totalAConfirmer} h/an possibles, <b>jamais additionnées</b> aux {total} h ci-dessus.</p>
          <div className="scroll-x"><table>
            <tbody>
              {pistes.aConfirmer.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}<div className="muted">{p.pourquoi}</div></td>
                  <td><span className={`pill ${p.methode}`}>{LABEL_METHODE[p.methode ?? "rien"]}</span></td>
                  <td className="num">{p.heures_an} h</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </section>
        <section className="card">
          <h2>Déjà couvert par le logiciel : rien à construire</h2>
          <ul className="clean">
            {pistes.dejaCouvert.map((p) => (
              <li key={p.id}>{p.nom}<div className="muted">{p.pourquoi}</div></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
