import type { Tache } from "@/lib/data";

// Matrice gain (axe vertical) / effort (axe horizontal). Taille du point = heures par an,
// couleur = risque (vert 1-2, orange 3, rouge 4-5).
export default function Matrice({ taches }: { taches: Tache[] }) {
  const W = 520, H = 320, padL = 46, padB = 40, padT = 14, padR = 14;
  const iw = W - padL - padR, ih = H - padT - padB;
  const x = (effort: number) => padL + ((effort - 0.5) / 5) * iw;
  const y = (gain: number) => padT + (1 - (gain - 0.5) / 5) * ih;
  const maxH = Math.max(...taches.map((t) => t.heures_an));
  const color = (r: number) => (r <= 2 ? "#17a34a" : r === 3 ? "#e8890c" : "#d33");
  const midX = x(2.5), midY = y(2.5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Matrice gain effort">
      <rect x={padL} y={padT} width={iw} height={ih} fill="none" stroke="var(--line)" />
      <line x1={midX} y1={padT} x2={midX} y2={padT + ih} stroke="var(--line)" />
      <line x1={padL} y1={midY} x2={padL + iw} y2={midY} stroke="var(--line)" />
      <g fontSize="11" fill="var(--mute)" style={{ color: "var(--mute)" }}>
        <text x={padL + 8} y={padT + 16}>GAIN RAPIDE</text>
        <text x={padL + iw - 8} y={padT + 16} textAnchor="end">PROJET</text>
        <text x={padL + 8} y={padT + ih - 8}>À REGROUPER</text>
        <text x={padL + iw - 8} y={padT + ih - 8} textAnchor="end">À ÉCARTER</text>
        <text x={padL + iw / 2} y={H - 8} textAnchor="middle">Effort de mise en place (1 faible, 5 élevé)</text>
        <text transform={`translate(14 ${padT + ih / 2}) rotate(-90)`} textAnchor="middle">Gain (1 à 5)</text>
      </g>
      {taches.map((t) => {
        const r = 12 + (t.heures_an / maxH) * 20;
        return (
          <g key={t.id}>
            <circle cx={x(t.score.effort)} cy={y(t.score.gain)} r={r} fill={color(t.score.risque)} fillOpacity=".85" />
            <text x={x(t.score.effort)} y={y(t.score.gain) + 4} textAnchor="middle" fontSize="11" fill="#fff" style={{ color: "#fff" }}>
              {t.heures_an} h
            </text>
          </g>
        );
      })}
    </svg>
  );
}
