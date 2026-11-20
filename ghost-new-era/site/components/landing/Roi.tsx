"use client";

import { useState } from "react";

// Estimation à partir des chiffres saisis par la personne. Les valeurs par défaut sont des HYPOTHÈSES à ajuster.
export default function Roi() {
  const [arrivees, setArrivees] = useState(12);
  const [heures, setHeures] = useState(2);
  const [cout, setCout] = useState(35);
  const humainParArrivee = 0.15; // environ 9 minutes : accord, question du manager, validation de la commande
  const gagnees = Math.max(0, arrivees * (heures - humainParArrivee));
  const euros = gagnees * cout;
  const champ = (id: string, libelle: string, v: number, set: (n: number) => void, pas = 1, unite = "") => (
    <label htmlFor={id}>{libelle}
      <span><input id={id} type="number" min={0} step={pas} value={v} onChange={(e) => set(Number(e.target.value) || 0)} />{unite}</span>
    </label>
  );
  return (
    <div className="roi">
      <div className="roi-champs">
        {champ("roi-a", "Arrivées par an", arrivees, setArrivees)}
        {champ("roi-h", "Heures de travail par arrivée, à la main", heures, setHeures, 0.5, " h")}
        {champ("roi-c", "Coût horaire chargé", cout, setCout, 1, " €")}
        <p className="petit">Ces chiffres sont à toi : Ghost ne les connaît pas. La part humaine restante est comptée à {Math.round(humainParArrivee * 60)} minutes par arrivée (accord, question éventuelle, validation).</p>
      </div>
      <div className="roi-resultat" aria-live="polite">
        <span>Temps libéré par an</span>
        <b>{Math.round(gagnees)} h</b>
        <span>soit environ</span>
        <b>{Math.round(euros).toLocaleString("fr-FR")} €</b>
        <small>Estimation, pas une mesure : elle dépend des heures que tu saisis.</small>
      </div>
    </div>
  );
}
