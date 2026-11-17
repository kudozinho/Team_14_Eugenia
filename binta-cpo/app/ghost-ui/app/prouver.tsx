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

  function lancer() {
    setEtat("en_cours");
    setSecondes(0);
    const debut = Date.now();
    const id = setInterval(() => setSecondes(Math.round((Date.now() - debut) / 1000)), 250);
    setTimeout(() => {
      clearInterval(id);
      setEtat("termine");
    }, 2500);
  }

  const gain = Math.round((1 - exemple.duree_s / exemple.duree_humaine_s) * 100);
  const hauteurAgent = Math.max(8, Math.round((exemple.duree_s / exemple.duree_humaine_s) * 100));

  return (
    <div className="card">
      <h2>Preuve avec l'agent H</h2>
      <div className="row">
        <button className="btn" onClick={lancer} disabled={etat === "en_cours"}>
          {etat === "en_cours" ? `Agent en cours… ${secondes} s` : "Prouver avec l'agent"}
        </button>
        {etat === "termine" && (
          <button className="btn sec" onClick={() => setEtat("attente")}>Actualiser</button>
        )}
      </div>
      {etat === "termine" ? (
        <>
          <div className="bars" aria-label="Durée avant et après">
            <div style={{ background: "var(--bad)", height: "100%" }}>{formatDuree(exemple.duree_humaine_s)}<br />à la main</div>
            <div style={{ background: "var(--ok)", height: `${hauteurAgent}%` }}>{formatDuree(exemple.duree_s)}</div>
          </div>
          <p>
            <b>{gain} %</b> de temps en moins · {exemple.portails_publies.length} sites sur 3 :{" "}
            {exemple.portails_publies.join(" · ")}
          </p>
          <p className="note">
            Valeurs d'exemple (statut « {exemple.statut} »). Jeudi : durée mesurée par notre code, médiane de 5 essais.
          </p>
        </>
      ) : (
        <p className="muted" style={{ marginTop: 12 }}>
          L'agent H refait la tâche sur les 3 sites, la durée est mesurée par notre code. Aucun temps réel : « Actualiser » suffit.
        </p>
      )}
    </div>
  );
}
