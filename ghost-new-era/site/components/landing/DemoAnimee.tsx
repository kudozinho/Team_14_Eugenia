"use client";

import { useEffect, useState } from "react";
import Fantome from "@/components/portail/Fantome";
import { agentInfo } from "@/lib/agents";

// Illustration animée de la démo : les trois agents cochent leurs tâches, un fantôme se déplace de ligne en ligne.
const VOIES = [
  { k: "acces", outil: "Espace RH", lignes: ["Fiche RH créée", "Accès CRM, Devis, Agenda", "Badge demandé", "Matériel : attend ta validation"] },
  { k: "equipe", outil: "Messagerie", lignes: ["Bienvenue dans # ventes", "Annonce dans # accueil", "Parrain demandé au manager", "Café d'accueil proposé"] },
  { k: "docs", outil: "Wiki", lignes: ["5 pages recommandées choisies", "Page « Bienvenue » créée", "Checklist du jour 1", "Checklist semaine 1 et mois 1"] },
];
const CYCLE = 22;

export default function DemoAnimee() {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(CYCLE - 2); return; }
    const m = setInterval(() => setT((x) => (x + 1) % CYCLE), 900);
    return () => clearInterval(m);
  }, []);

  const fait = (i: number) => Math.max(0, Math.min(4, Math.floor((t - i * 2 - 1) / 2.2)));
  const total = VOIES.reduce((n, _, i) => n + fait(i), 0);

  return (
    <div className="demo" role="img" aria-label="Démonstration animée : trois agents préparent l'arrivée d'un nouveau salarié">
      <div className="demo-barre"><span /><span /><span /><em>Onboarding de Karim Benali · Commercial</em></div>
      <div className="demo-voies">
        {VOIES.map((v, i) => {
          const a = agentInfo(v.k);
          const f = fait(i);
          return (
            <div key={v.k} className="demo-voie" style={{ ["--c" as string]: a.couleur }}>
              <header><Fantome couleur={a.couleur} taille={26} actif={f < 4} /><b>{a.prenom}</b><small>{v.outil}</small></header>
              <ul>
                {v.lignes.map((l, j) => (
                  <li key={l} className={j < f ? "ok" : j === f ? "en-cours" : ""}>
                    <i>{j < f ? "✓" : ""}</i>{l}
                    {j === f && f < 4 && <span className="demo-curseur"><Fantome couleur={a.couleur} taille={22} /></span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="demo-pied"><b>{total} / 12</b> actions vérifiées dans les outils <small>· illustration de la démo</small></p>
    </div>
  );
}
