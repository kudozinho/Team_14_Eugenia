"use client";
import { useState } from "react";
import type { Tache } from "@/lib/data";
import { LABEL_METHODE } from "@/lib/data";

// Carte de priorité : gain (vertical) et effort (horizontal). Taille = heures par an, couleur = outil.
// Le détail de la tâche survolée ou choisie s'affiche sous la carte.
const COULEUR: Record<string, [string, string]> = {
  agent_h: ["#12a874", "#0b7a55"],
  n8n: ["#7c7ce8", "#4b4bc4"],
  rien: ["#8a988f", "#5b6a61"],
};
const RISQUE = ["", "très faible", "faible", "moyen", "élevé", "critique"];

export default function Matrice({ taches }: { taches: Tache[] }) {
  const meilleure = taches.slice().sort((a, b) => b.score.total - a.score.total)[0]?.id ?? null;
  const [actif, setActif] = useState<string | null>(meilleure);
  const W = 700, H = 470, padL = 64, padB = 62, padT = 14, padR = 14, gap = 8;
  const iw = W - padL - padR, ih = H - padT - padB;
  // Domaine resserré autour des données (les seuils restent à 2,5) pour que les points respirent.
  const e0 = 0.5, e1 = Math.max(3.5, Math.max(...taches.map((t) => t.score.effort)) + 0.8);
  const g0 = 2, g1 = 5;
  const x = (effort: number) => padL + ((effort - e0) / (e1 - e0)) * iw;
  const y = (gain: number) => padT + (1 - (gain - g0) / (g1 - g0)) * ih;
  const midX = x(2.5), midY = y(2.5);
  const maxH = Math.max(...taches.map((t) => t.heures_an));
  const sel = taches.find((a) => a.id === actif) ?? null;

  const tile = (x0: number, y0: number, x1: number, y1: number) => ({ x: x0 + gap / 2, y: y0 + gap / 2, width: x1 - x0 - gap, height: y1 - y0 - gap });
  const zones = [
    { id: "gr", t: tile(padL, padT, midX, midY), nom: "Gain rapide", sous: "À faire tout de suite", fill: "url(#gr)", fort: true, ax: padL + 18, ay: padT + 30, anchor: "start" as const },
    { id: "pr", t: tile(midX, padT, padL + iw, midY), nom: "Projet", sous: "À planifier et chiffrer", fill: "#f4f8f6", fort: false, ax: padL + iw - 18, ay: padT + 30, anchor: "end" as const },
    { id: "re", t: tile(padL, midY, midX, padT + ih), nom: "À regrouper", sous: "Petits gains faciles", fill: "#f8fbf9", fort: false, ax: padL + 18, ay: padT + ih - 26, anchor: "start" as const },
    { id: "ec", t: tile(midX, midY, padL + iw, padT + ih), nom: "À écarter", sous: "Peu de gain, effort élevé", fill: "#f8fbf9", fort: false, ax: padL + iw - 18, ay: padT + ih - 26, anchor: "end" as const },
  ];

  return (
    <div className="mx">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Carte de priorité gain et effort des tâches">
        <defs>
          <linearGradient id="gr" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7f3e6" />
            <stop offset="1" stopColor="#eefaf4" />
          </linearGradient>
          {Object.entries(COULEUR).map(([k, [a, b]]) => (
            <radialGradient key={k} id={`b-${k}`} cx="35%" cy="30%" r="80%">
              <stop offset="0" stopColor={a} />
              <stop offset="1" stopColor={b} />
            </radialGradient>
          ))}
          <filter id="ombre" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#04382a" floodOpacity=".28" />
          </filter>
        </defs>

        {zones.map((z) => (
          <g key={z.id}>
            <rect {...z.t} rx="16" fill={z.fill} stroke={z.fort ? "#b7e5d0" : "#e6eee9"} />
            <text x={z.ax} y={z.ay} textAnchor={z.anchor} fontSize="15" fontWeight="800" fill={z.fort ? "#0b7a55" : "#5b6a61"} style={{ fontFamily: "var(--font-jakarta)" }}>{z.nom}</text>
            <text x={z.ax} y={z.ay + 18} textAnchor={z.anchor} fontSize="13" fill={z.fort ? "#2f8a68" : "#8a988f"}>{z.sous}</text>
          </g>
        ))}

        {/* Axes */}
        <g fill="#66756c" fontSize="13.5">
          <line x1={padL} y1={padT + ih + 14} x2={padL + iw} y2={padT + ih + 14} stroke="#cfdbd4" />
          <path d={`M${padL + iw - 6} ${padT + ih + 10} l6 4 l-6 4`} fill="none" stroke="#9fb2a8" />
          <text x={padL} y={padT + ih + 34}>Effort faible</text>
          <text x={padL + iw / 2} y={padT + ih + 34} textAnchor="middle" fontWeight="700" fill="#3f4e45">Effort de mise en place</text>
          <text x={padL + iw} y={padT + ih + 34} textAnchor="end">Effort élevé</text>
          <line x1={padL - 14} y1={padT} x2={padL - 14} y2={padT + ih} stroke="#cfdbd4" />
          <path d={`M${padL - 18} ${padT + 6} l4 -6 l4 6`} fill="none" stroke="#9fb2a8" />
          <text transform={`translate(${padL - 24} ${padT + ih / 2}) rotate(-90)`} textAnchor="middle" fontWeight="700" fill="#3f4e45">Gain</text>
          <text transform={`translate(${padL - 24} ${padT + ih}) rotate(-90)`} textAnchor="start">faible</text>
          <text transform={`translate(${padL - 24} ${padT}) rotate(-90)`} textAnchor="end">fort</text>
        </g>

        {/* Points */}
        {taches.map((a) => {
          const r = 24 + (a.heures_an / maxH) * 15;
          const cx = x(a.score.effort), cy = y(a.score.gain);
          const on = actif === a.id;
          const flou = actif !== null && !on;
          const w = Math.max(96, a.court.length * 8 + 30);
          const auDessus = taches.some((b) => b.id !== a.id && y(b.score.gain) > cy && Math.abs(x(b.score.effort) - cx) < 60);
          const ly = auDessus ? cy - r - 38 : cy + r + 10;
          return (
            <g key={a.id} tabIndex={0} role="button" aria-label={`${a.nom} : ${a.heures_an} heures par an, score ${a.score.total}`}
               onMouseEnter={() => setActif(a.id)} onFocus={() => setActif(a.id)} onClick={() => setActif(a.id)}
               style={{ cursor: "pointer", outline: "none", opacity: flou ? 0.5 : 1, transition: "opacity .15s" }}>
              <circle cx={cx} cy={cy} r={r + 12} fill={COULEUR[a.methode][0]} opacity={on ? 0.2 : 0.1} />
              <circle cx={cx} cy={cy} r={r} fill={`url(#b-${a.methode})`} stroke="#fff" strokeWidth="3" filter="url(#ombre)" />
              <text x={cx} y={cy + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff" style={{ fontFamily: "var(--font-jakarta)" }}>{a.heures_an} h</text>
              <rect x={cx - w / 2} y={ly} width={w} height="28" rx="14" fill="#fff" stroke={on ? COULEUR[a.methode][1] : "#dbe6df"} strokeWidth={on ? 1.6 : 1} />
              <text x={cx} y={ly + 19} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0e1b14">{a.court}</text>
            </g>
          );
        })}
      </svg>

      <div className="mx-detail" aria-live="polite">
        {sel ? (
          <>
            <div className="mx-head">
              <span className={`pill ${sel.methode}`}>{LABEL_METHODE[sel.methode]}</span>
              <b>{sel.nom}</b>
            </div>
            <div className="mx-stats">
              <div><b className="num">{sel.score.total}</b><span>score / 100</span></div>
              <div><b className="num">{sel.heures_an} h</b><span>récupérables par an</span></div>
              <div><b className="num">{sel.score.gain}/5</b><span>gain</span></div>
              <div><b className="num">{sel.score.effort}/5</b><span>effort</span></div>
              <div><b>{RISQUE[sel.score.risque]}</b><span>risque</span></div>
            </div>
          </>
        ) : <span className="muted">Survolez un point pour voir le détail.</span>}
      </div>
      <div className="legend" style={{ color: "var(--ink-2)" }}>
        <span><span className="dot" style={{ background: COULEUR.agent_h[1] }} />Agent H</span>
        <span><span className="dot" style={{ background: COULEUR.n8n[1] }} />n8n</span>
        <span className="muted">Taille du point : heures par an</span>
      </div>
    </div>
  );
}
