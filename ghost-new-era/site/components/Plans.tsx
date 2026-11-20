import Link from "next/link";

// Tarifs de DÉMONSTRATION : le prix réel n'est pas encore décidé (voir le dossier d'équipe).
export const PLANS = [
  { id: "essentiel", nom: "Essentiel", prix: "49 €", periode: "par mois", pour: "Une office manager, quelques arrivées par an", points: ["1 espace de travail", "Jusqu'à 3 outils autorisés", "Rapport après chaque tâche"], principal: false },
  { id: "equipe", nom: "Équipe", prix: "149 €", periode: "par mois", pour: "Une PME de 50 personnes, onboardings et départs", points: ["Tous les outils autorisés un par un", "Agents en parallèle", "Vérification de chaque action dans l'outil", "Rapport chiffré (heures économisées)"], principal: true },
];

export default function Plans({ lien = "/inscription" }: { lien?: string }) {
  return (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", maxWidth: 820 }}>
      {PLANS.map((p) => (
        <article key={p.id} className="card" style={p.principal ? { borderColor: "var(--g-700)", borderWidth: 2 } : undefined}>
          <h3>{p.nom}</h3>
          <p style={{ margin: "4px 0 12px" }}>{p.pour}</p>
          <p style={{ fontFamily: "var(--font-titres)", fontWeight: 800, fontSize: "2.2rem", color: "var(--ink)", lineHeight: 1 }}>
            {p.prix} <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--mute)" }}>{p.periode}</span>
          </p>
          <ul style={{ margin: "16px 0", paddingLeft: 20, display: "grid", gap: 6, color: "var(--ink-2)" }}>
            {p.points.map((x) => <li key={x}>{x}</li>)}
          </ul>
          <Link href={lien} className="btn btn-secondary">Choisir {p.nom}</Link>
        </article>
      ))}
    </div>
  );
}
