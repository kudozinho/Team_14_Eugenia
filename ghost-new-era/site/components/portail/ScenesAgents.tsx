"use client";

import { useState } from "react";
import Fantome from "@/components/portail/Fantome";
import VueAgent from "@/components/portail/VueAgent";
import { agentInfo } from "@/lib/agents";

type Run = { id: string; agent: string; statut: string; session_h_id: string | null };
const ORDRE = ["acces", "equipe", "docs"];

// Un grand écran, un onglet par agent (prénom, rôle, état). Par défaut, on suit l'agent qui travaille.
export default function ScenesAgents({ runs }: { runs: Run[] }) {
  const [choisi, setChoisi] = useState("");
  const liste = ORDRE.map((k) => runs.find((r) => r.agent === k)).filter((r): r is Run => !!r && !!r.session_h_id);
  const courant = liste.find((r) => r.agent === choisi) ?? liste.find((r) => r.statut === "en_cours") ?? liste[0];
  return (
    <div className="scenes">
      <div className="onglets-agents" role="tablist" aria-label="Les agents">
        {liste.map((r) => {
          const a = agentInfo(r.agent);
          return (
            <button key={r.id} role="tab" aria-selected={courant?.id === r.id} className={courant?.id === r.id ? "actif" : ""} style={{ ["--c" as string]: a.couleur }} onClick={() => setChoisi(r.agent)}>
              <Fantome couleur={a.couleur} taille={26} actif={r.statut === "en_cours"} />
              <span><b>{a.prenom}</b><small>{a.role}</small></span>
              <i className={`pt ${r.statut}`} aria-label={r.statut === "en_cours" ? "au travail" : "terminé"} />
            </button>
          );
        })}
      </div>
      {courant?.session_h_id && <VueAgent key={courant.session_h_id} grand session={courant.session_h_id} agent={courant.agent} actif={courant.statut === "en_cours"} />}
    </div>
  );
}
