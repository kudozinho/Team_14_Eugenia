import { getFiche, getExecution } from "@/lib/data";
import Prouver from "../prouver";

function Ligne({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr>
      <th scope="row" style={{ width: "34%", textTransform: "none", letterSpacing: 0 }}>{k}</th>
      <td>{children}</td>
    </tr>
  );
}

export default function Rapport() {
  const f = getFiche();
  const m = f.metier;
  const t = f.technique;
  const exec = getExecution();

  return (
    <>
      <h1>Compte rendu</h1>
      <p className="sub">Fiche d'opportunité n°{f.numero} · à deux axes, pour que la personne qui met en place commence sans rappeler personne.</p>

      <section className="card" style={{ marginBottom: 14 }}>
        <h2>{f.titre}</h2>
        <div className="row">
          <span className="pill ok">Score {f.score}/100</span>
          <span className="pill warn">{f.quadrant === "gain_rapide" ? "Gain rapide" : f.quadrant}</span>
          <span className="muted">Confiance {f.confiance}/5 · {m.heures_an} h par an récupérables</span>
        </div>
      </section>

      <div className="grid g2" style={{ marginBottom: 14 }}>
        <section className="card">
          <h2>Axe métier</h2>
          <table><tbody>
            <Ligne k="Le process, en clair">{m.process}</Ligne>
            <Ligne k="Déclencheur">{m.declencheur}</Ligne>
            <Ligne k="Fréquence">{m.frequence}</Ligne>
            <Ligne k="Durée aujourd'hui">{m.duree_aujourdhui}</Ligne>
            <Ligne k="Temps passé par an">{m.temps_par_an_h} h</Ligne>
            <Ligne k="Gain attendu">{m.gain_attendu}</Ligne>
            <Ligne k="Impact sur l'équipe">{m.impact_equipe}</Ligne>
            <Ligne k="Temps libéré pour">{m.temps_libere}</Ligne>
            <Ligne k="À vérifier">{m.hypotheses}</Ligne>
          </tbody></table>
        </section>

        <section className="card">
          <h2>Axe technique</h2>
          <table><tbody>
            <Ligne k="Outil recommandé">{t.outil === "agent_h" ? "Agent H" : t.outil}. {t.raison}</Ligne>
            <Ligne k="Options écartées"><ul className="clean">{t.options_ecartees.map((o: string) => <li key={o}>{o}</li>)}</ul></Ligne>
            <Ligne k="Étapes"><ol className="clean">{t.etapes.map((e: string) => <li key={e}>{e}</li>)}</ol></Ligne>
            <Ligne k="Données en entrée">{t.entrees}</Ligne>
            <Ligne k="Données en sortie">{t.sorties}</Ligne>
            <Ligne k="Effort de mise en place">{t.effort}</Ligne>
            <Ligne k="Critère de recette">{t.recette}</Ligne>
            <Ligne k="Coût d'exécution">{t.cout_execution}</Ligne>
            <Ligne k="Maintenance">{t.maintenance}</Ligne>
          </tbody></table>
          <h3>Points de vigilance</h3>
          <ul className="clean">{t.vigilance.map((v: string) => <li key={v}>{v}</li>)}</ul>
        </section>
      </div>

      <Prouver exemple={exec} />
    </>
  );
}
