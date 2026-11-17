"use client";
import { useState } from "react";
import type { Tache } from "@/lib/data";
import { LABEL_METHODE } from "@/lib/data";

// Matrice gain (axe vertical) / effort (axe horizontal). Taille du point = heures par an,
// couleur = outil recommandé (vert : agent H, indigo : n8n). Étiquette directe sur chaque point.
const COULEUR: Record<string, string> = { agent_h: "#0b7a55", n8n: "#5b5bd6", rien: "#66756c" };

export default function Matrice({ taches }: { taches: Tache[] }) {
  const [actif, setActif] = useState<string | null>(null);
  const W = 560, H = 380, padL = 48, padB = 44, padT = 16, padR = 16;
  const iw = W - padL - padR, ih = H - padT - padB;
  // Axes 1 à 5 : l'effort faible est à gauche, le gain fort en haut.
  const x = (effort: number) => padL + ((effort - 0.5) / 5) * iw;
  const y = (gain: number) => padT + (1 - (gain - 0.5) / 5) * ih;
  const maxH = Math.max(...taches.map((t) => t.heures_an));
  const midX = x(2.5), midY = y(2.5);
  const t = taches.find((a) => a.id === actif);

  return (
    <div className="matrix-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Matrice gain effort des tâches">
        {/* Quadrants : le « gain rapide » est teinté pour guider l'œil */}
        <rect x={padL} y={padT} width={midX - padL} height={midY - padT} rx="12" fill="#effaf4" />
        <rect x={midX} y={padT} width={padL + iw - midX} height={midY - padT} rx="12" fill="#f7faf8" />
        <rect x={padL} y={midY} width={midX - padL} height={padT + ih - midY} rx="12" fill="#f7faf8" />
        <rect x={midX} y={midY} width={padL + iw - midX} height={padT + ih - midY} rx="12" fill="#fafbfa" />
        <line x1={midX} y1={padT} x2={midX} y2={padT + ih} stroke="#cfdbd4" strokeDasharray="4 4" />
        <line x1={padL} y1={midY} x2={padL + iw} y2={midY} stroke="#cfdbd4" strokeDasharray="4 4" />
        <g fontSize="11" fontWeight="700" letterSpacing=".08em" fill="#66756c" style={{ fontFamily: "var(--font-jakarta)" }}>
          <text x={padL + 14} y={padT + 24} fill="#0b7a55">GAIN RAPIDE</text>
          <text x={padL + iw - 14} y={padT + 24} textAnchor="end">PROJET</text>
          <text x={padL + 14} y={padT + ih - 14}>À REGROUPER</text>
          <text x={padL + iw - 14} y={padT + ih - 14} textAnchor="end">À ÉCARTER</text>
        </g>
        <g fontSize="12" fill="#66756c">
          <text x={padL + iw / 2} y={H - 10} textAnchor="middle">Effort de mise en place (faible → élevé)</text>
          <text transform={`translate(14 ${padT + ih / 2}) rotate(-90)`} textAnchor="middle">Gain (faible → fort)</text>
        </g>
        {taches.map((a) => {
          const r = 16 + (a.heures_an / maxH) * 22;
          const cx = x(a.score.effort), cy = y(a.score.gain);
          const on = actif === a.id;
          // Étiquette au-dessus du point s'il y en a un autre juste en dessous, sinon en dessous.
          const auDessus = taches.some((b) => b.id !== a.id && y(b.score.gain) > cy && Math.abs(x(b.score.effort) - cx) < 130);
          return (
            <g key={a.id} tabIndex={0} role="button" aria-label={`${a.nom} : ${a.heures_an} heures par an`}
               onMouseEnter={() => setActif(a.id)} onMouseLeave={() => setActif(null)}
               onFocus={() => setActif(a.id)} onBlur={() => setActif(null)} style={{ cursor: "pointer", outline: "none" }}>
              <circle cx={cx} cy={cy} r={r + (on ? 4 : 0)} fill={COULEUR[a.methode]} fillOpacity={on ? 1 : 0.9} stroke="#fff" strokeWidth="3" />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" style={{ fontFamily: "var(--font-jakarta)" }}>
                {a.heures_an} h
              </text>
              <text x={cx} y={auDessus ? cy - r - 10 : cy + r + 16} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0e1b14">
                {a.court}
              </text>
            </g>
          );
        })}
      </svg>
      {t && (
        <div className="tip" style={{ left: `${(x(t.score.effort) / W) * 100}%`, top: `${(y(t.score.gain) / H) * 100}%` }}>
          <b>{t.nom}</b>
          {t.heures_an} h/an · score {t.score.total}/100 · {LABEL_METHODE[t.methode]}
        </div>
      )}
      <div className="legend" style={{ color: "var(--ink-2)", marginTop: 6 }}>
        <span><span className="dot" style={{ background: COULEUR.agent_h }} />Agent H</span>
        <span><span className="dot" style={{ background: COULEUR.n8n }} />n8n</span>
      </div>
    </div>
  );
}
