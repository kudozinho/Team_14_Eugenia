// Intranet RH d'Atelier Nova : public, libellés clairs et stables, ni animation ni pop-up (un agent H lit l'écran).
export default function IntranetRH() {
  return (
    <>
      <div className="bandeau-test">Environnement de test fictif</div>
      <main className="wrap" style={{ padding: "40px" }}>
        <h1>Atelier Nova : espace RH</h1>
        <p style={{ margin: "8px 0 24px" }}>Liste des personnes, fiches, accès, badges, matériel et arrivées.</p>
        <div className="card">
          <h2>Notification d'arrivée</h2>
          <p style={{ marginTop: 8 }}>Page en construction : les données arrivent avec la base d'Henriquet.</p>
        </div>
      </main>
    </>
  );
}
