import { formatDuree, mediane, type Historique } from "@/lib/data";

const SITES = ["Portail A", "Portail B", "Portail C"];
const STATUTS: Record<string, string> = {
  completed: "Terminée", failed: "Échec", timed_out: "Délai dépassé", interrupted: "Interrompue", en_cours: "En cours",
};

function quand(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// « Rapport de l'agent » : la dernière exécution lue dans Supabase, avec l'historique.
// Si rien n'est lisible, la carte dit pourquoi (clés absentes, base vide, mauvaise tâche).
export default function RapportExecution({ h, tacheId }: { h: Historique; tacheId: string }) {
  const reussies = h.lignes.filter((l) => l.statut === "completed" && l.duree_s);
  const derniere = h.lignes[0];

  return (
    <section className="card" id="rapport-agent">
      <h3>Rapport de l'agent H</h3>
      <p className="card-sub">Lu dans la base de l'équipe à chaque ouverture de la page.</p>

      {h.etat === "pas_de_cles" && (
        <div className="alert"><h4>Le site n'est pas relié à la base</h4>
          <p style={{ margin: 0 }}>Variables manquantes dans Vercel : <code>SUPABASE_URL</code> et <code>SUPABASE_SERVICE_ROLE_KEY</code>. Ajoute-les puis redéploie.</p></div>
      )}
      {h.etat === "erreur" && (
        <div className="alert"><h4>La base ne répond pas</h4><p style={{ margin: 0 }}>{h.detail}</p></div>
      )}
      {h.etat === "vide" && (
        <div className="note">Aucune exécution dans la base pour l'instant. Clique sur « Prouver avec l'agent » ci-dessus : le rapport apparaîtra ici.</div>
      )}
      {h.etat === "autre_tache" && (
        <div className="alert"><h4>Des exécutions existent, mais pas pour cette tâche</h4>
          <p style={{ margin: 0 }}>Le site cherche <code>{tacheId}</code> ; la base contient par exemple <code>{h.detail}</code>. Mets cet identifiant dans la variable <code>TACHE_ID</code> de Vercel.</p></div>
      )}

      {derniere && (
        <>
          <div className="row" style={{ marginTop: 12 }}>
            <span className={`pill ${derniere.statut === "completed" ? "ok" : "warn"}`}>{STATUTS[derniere.statut] ?? derniere.statut}</span>
            <span className="muted">Dernière exécution le {quand(derniere.cree_le)}</span>
          </div>

          <div className="stats">
            <div className="stat"><b className="num">{derniere.duree_s ? formatDuree(derniere.duree_s) : "…"}</b><span>durée de l'agent</span></div>
            <div className="stat"><b className="num">{derniere.duree_humaine_s ? formatDuree(derniere.duree_humaine_s) : "…"}</b><span>à la main (mesuré)</span></div>
            {derniere.duree_s && derniere.duree_humaine_s ? (
              <div className="stat"><b className="num">−{Math.round((1 - derniere.duree_s / derniere.duree_humaine_s) * 100)} %</b><span>de temps</span></div>
            ) : null}
            {reussies.length > 1 && (
              <div className="stat"><b className="num">{formatDuree(mediane(reussies.map((l) => l.duree_s as number))!)}</b><span>médiane sur {reussies.length} exécutions</span></div>
            )}
          </div>

          <div className="sites" style={{ marginTop: 14 }}>
            {SITES.map((s) => {
              const ok = derniere.portails_publies.includes(s);
              return <span key={s} className={`site ${ok ? "done" : ""}`}>{ok ? "✓" : "○"} {s}</span>;
            })}
          </div>

          {derniere.resume && <p className="lead-text" style={{ marginTop: 14 }}>« {derniere.resume} »</p>}
          {derniere.session_id && <p className="muted">Session H : <code>{derniere.session_id}</code></p>}

          <h4 style={{ marginTop: 18 }}>Dernières exécutions</h4>
          <div className="scroll-x">
            {h.lignes.map((l) => (
              <div className="list-row" key={l.id}>
                <span className="muted">{quand(l.cree_le)}</span>
                <span>{STATUTS[l.statut] ?? l.statut}</span>
                <span className="num">{l.duree_s ? formatDuree(l.duree_s) : "…"}</span>
                <span className="num">{l.portails_publies.length} / 3 sites</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
