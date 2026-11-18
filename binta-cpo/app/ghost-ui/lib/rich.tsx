import React from "react";

// Met en gras les chiffres avec leur unité et transforme « [H] » en pastille « hypothèse ».
const CHIFFRE = /(\d+\s?min\s?\d+|\d[\d\u202f\s.,]*\s?(?:minutes?|min|h\/an|h|%|€|\$|s|jours?|sites?|annonces?|opérations?|essais?|publications?)(?![\p{L}\d])|\d+\s?sur\s?\d+|\[H\])/giu;

export function Rich({ children }: { children: string }) {
  const parts = children.split(CHIFFRE);
  return (
    <>
      {parts.map((p, i) => {
        if (/^\[H\]$/i.test(p)) return <span key={i} className="hyp" title="Hypothèse à vérifier pendant l'audit">hypothèse</span>;
        if (i % 2 === 1) return <strong key={i}>{p}</strong>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}

// « texte principal (détail) » → [principal, détail]
export function splitDetail(s: string): [string, string | null] {
  const m = s.match(/^(.*?)\s*\((.*)\)\.?\s*$/);
  return m ? [m[1], m[2]] : [s, null];
}

// « Titre : corps » → [titre, corps]
export function splitTitre(s: string): [string, string | null] {
  const i = s.indexOf(" : ");
  return i === -1 ? [s, null] : [s.slice(0, i), s.slice(i + 3)];
}

// Découpe en phrases courtes (point suivi d'une majuscule ou d'un chiffre).
export function phrases(s: string): string[] {
  return s.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ0-9])/).map((x) => x.trim()).filter(Boolean);
}
