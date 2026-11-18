"use client";
import { useState } from "react";
import type { Execution } from "@/lib/data";
import { formatDuree } from "@/lib/data";

type Etat = "attente" | "en_cours" | "termine";

// Aujourd'hui : simule l'attente puis affiche l'exécution d'exemple (clairement étiquetée).
// Jeudi : le bouton appellera la demande d'exécution (contrat §3) et lira `executions_agent` (contrat §4).
export default function Prouver({ exemple }: { exemple: Execution }) {
  const [etat, setEtat] = useState<Etat>("attente");
  const [secondes, setSecondes] = useState(0);
  const [faits, setFaits] = useState(0);

  function lancer() {
    setEtat("en_cours");
    setSecondes(0);
    setFaits(0);
    const debut = Date.now();
    const id = setInterval(() => setSecondes(Math.round((Date.now() - debut) / 1000)), 250);
    [900, 1700, 2500].forEach((d, i) => setTimeout(() => setFaits(i + 1), d));
    setTimeout(() => {
      clearInterval(id);
      setEtat("termine");
    }, 2600);
  }

  const gain = Math.round((1 - exemple.duree_s / exemple.duree_humaine_s) * 100);
  const hauteurAgent = Math.max(12, Math.round((exemple.duree_s / exemple.duree_humaine_s) * 100));
  const sites = ["Portail A", "Portail B", "Portail C"];

  return (
    <section className="card proof">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <p className="eyebrow">Preuve</p>
          <h2 style={{ margin: 0 }}>L'agent H refait la tâche, chronomètre en main</h2>
        </div>
        <div className="row">
          <button className="btn" onClick={lancer} disabled={etat === "en_cours"}>
            {etat === "en_cours" ? `Agent en cours… ${secondes} s` : "Prouver avec l'agent"}
          </button>
          {etat === "termine" && <button className="btn sec" onClick={() => setEtat("attente")}>Actualiser</button>}
        </div>
      </div>

      <div className="sites" aria-live="polite">
        {sites.map((s, i) => (
          <span key={s} className={`site ${etat === "termine" || (etat === "en_cours" && faits > i) ? "done" : ""}`}>
            {etat === "termine" || (etat === "en_cours" && faits > i) ? "✓" : "○"} {s}
          </span>
        ))}
      </div>
      {etat === "en_cours" && <div className="progress"><i style={{ width: `${(faits / 3) * 100}%` }} /></div>}

      {etat === "termine" ? (
        <>
          <div className="row" style={{ gap: 28, marginTop: 18, alignItems: "flex-end" }}>
            <div>
              <div className="big-gain num">−{gain} %</div>
              <div className="muted">de temps sur cette tâche · {exemple.portails_publies.length} sites sur 3</div>
            </div>
          </div>
          <div className="compare" aria-label="Durée avant et après">
            <div className="col">
              <div className="bar" style={{ background: "var(--o-600)", height: 150 }}><span className="num">{formatDuree(exemple.duree_humaine_s)}</span></div>
              <div className="lbl">À la main</div>
            </div>
            <div className="col">
              <div className="bar" style={{ background: "var(--g-700)", height: Math.round((150 * hauteurAgent) / 100) }}>
                {hauteurAgent > 22 && <span className="num">{formatDuree(exemple.duree_s)}</span>}
              </div>
              <div className="lbl"><b className="num">{formatDuree(exemple.duree_s)}</b> avec l'agent H</div>
            </div>
          </div>
          <p className="note">
            Valeurs d'exemple (statut « {exemple.statut} »). Jeudi : durée mesurée par notre code, médiane de 5 essais.
          </p>
        </>
      ) : (
        <p className="muted" style={{ marginTop: 14 }}>
          L'agent H ouvre les 3 sites, remplit le formulaire et publie. La durée est mesurée par notre code.
          Pas de temps réel : « Actualiser » suffit.
        </p>
      )}
    </section>
  );
}
