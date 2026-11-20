import Plans from "@/components/Plans";

export const metadata = { title: "Tarifs : Ghost" };

export default function Tarifs() {
  return (
    <section className="wrap" style={{ padding: "40px", margin: 0 }}>
      <span className="eyebrow">Tarifs</span>
      <h1 style={{ margin: "12px 0 8px" }}>Un prix simple, par mois</h1>
      <p style={{ marginBottom: 12 }}>Sans engagement. Tu paies pour les tâches que Ghost fait à ta place.</p>
      <p className="mode-demo" style={{ marginBottom: 24, color: "var(--ochre-700)", fontWeight: 600 }}>
        Tarifs de démonstration : le prix définitif n'est pas encore fixé. Aucun paiement réel n'est possible.
      </p>
      <Plans />
    </section>
  );
}
