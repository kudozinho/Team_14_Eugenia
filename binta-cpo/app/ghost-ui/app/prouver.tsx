"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Execution } from "@/lib/data";
import { formatDuree } from "@/lib/data";

type Etat = "attente" | "en_cours" | "termine" | "echec";

// Bouton « Prouver » : crée une demande via /api/prouver, puis relit la ligne toutes les 5 s
// (le script d'Alejandro lance l'agent). Sans clés Supabase : simulation avec l'exemple, clairement étiquetée.
export default function Prouver({ exemple }: { exemple: Execution }) {
  const [etat, setEtat] = useState<Etat>("attente");
  const [secondes, setSecondes] = useState(0);
  const [faits, setFaits] = useState(0);
  const [message, setMessage] = useState("");
  const [resultat, setResultat] = useState<Execution>(exemple);
  const [reel, setReel] = useState(false);
  const router = useRouter();
  const minuteur = useRef<ReturnType<typeof setInterval> | null>(null);
  const chrono = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (minuteur.current) clearInterval(minuteur.current); if (chrono.current) clearInterval(chrono.current); }, []);

  function arreter() {
    if (minuteur.current) clearInterval(minuteur.current);
    if (chrono.current) clearInterval(chrono.current);
  }

  function simuler() {
    setReel(false);
    [900, 1700, 2500].forEach((d, i) => setTimeout(() => setFaits(i + 1), d));
    setTimeout(() => { arreter(); setResultat(exemple); setEtat("termine"); }, 2600);
  }

  async function lancer() {
    setEtat("en_cours"); setSecondes(0); setFaits(0); setMessage("Envoi de la demande…");
    const debut = Date.now();
    chrono.current = setInterval(() => setSecondes(Math.round((Date.now() - debut) / 1000)), 500);
    try {
      const r = await fetch("/api/prouver", { method: "POST" });
      const d = await r.json();
      if (d.mode === "exemple") return simuler();
      if (!r.ok || !d.id) throw new Error(d.erreur || "La demande n'a pas pu être créée");
      setReel(true);
      setMessage("Demande envoyée, en attente de l'agent…");
      minuteur.current = setInterval(async () => {
        if (Date.now() - debut > 11 * 60 * 1000) { arreter(); setMessage("Délai dépassé (plus de 10 minutes)."); setEtat("echec"); return; }
        try {
          const g = await fetch(`/api/prouver?id=${encodeURIComponent(d.id)}`, { cache: "no-store" });
          const j = await g.json();
          const l = j.ligne;
          if (!l) return;
          if (l.resume) setMessage(l.resume);
          if (l.statut !== "en_cours") {
            arreter();
            if (l.statut === "completed") {
              setResultat({ ...exemple, ...l, portails_publies: l.portails_publies ?? [] });
              setFaits(3); setEtat("termine");
              router.refresh(); // recharge le rapport lu dans la base
            } else {
              setMessage(l.resume || `L'agent s'est arrêté (${l.statut}).`); setEtat("echec");
            }
          }
        } catch { /* on réessaie au prochain tour */ }
      }, 5000);
    } catch (e) {
      arreter(); setMessage(e instanceof Error ? e.message : "Erreur inconnue"); setEtat("echec");
    }
  }

  const gain = Math.round((1 - resultat.duree_s / resultat.duree_humaine_s) * 100);
  const hauteurAgent = Math.max(12, Math.round((resultat.duree_s / resultat.duree_humaine_s) * 100));
  const sites = ["Portail A", "Portail B", "Portail C"];

  return (
    <section className="card proof">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: 0 }}>L'agent H refait la tâche, chronomètre en main</h3>
        </div>
        <div className="row">
          <button className="btn" onClick={lancer} disabled={etat === "en_cours"}>
            {etat === "en_cours" ? `Agent en cours… ${secondes} s` : "Prouver avec l'agent"}
          </button>
          {(etat === "termine" || etat === "echec") && <button className="btn sec" onClick={() => { setEtat("attente"); setResultat(exemple); setMessage(""); setFaits(0); }}>Recommencer</button>}
        </div>
      </div>

      <div className="sites" aria-live="polite">
        {sites.map((s, i) => (
          <span key={s} className={`site ${etat === "termine" || (etat === "en_cours" && faits > i) ? "done" : ""}`}>
            {etat === "termine" || (etat === "en_cours" && faits > i) ? "✓" : "○"} {s}
          </span>
        ))}
      </div>
      {etat === "en_cours" && <div className="progress"><i style={{ width: `${(faits / 3) * 100}%` }} /></div>}

      {etat === "termine" ? (
        <>
          <div className="row" style={{ gap: 28, marginTop: 18, alignItems: "flex-end" }}>
            <div>
              <div className="big-gain num">−{gain} %</div>
              <div className="muted">de temps sur cette tâche · {resultat.portails_publies.length} sites sur 3</div>
            </div>
          </div>
          <div className="compare" aria-label="Durée avant et après">
            <div className="col">
              <div className="bar" style={{ background: "var(--o-600)", height: 150 }}><span className="num">{formatDuree(resultat.duree_humaine_s)}</span></div>
              <div className="lbl">À la main</div>
            </div>
            <div className="col">
              <div className="bar" style={{ background: "var(--g-700)", height: Math.round((150 * hauteurAgent) / 100) }}>
                {hauteurAgent > 22 && <span className="num">{formatDuree(resultat.duree_s)}</span>}
              </div>
              <div className="lbl"><b className="num">{formatDuree(resultat.duree_s)}</b> avec l'agent H</div>
            </div>
          </div>
          <p className="note">
            {reel
              ? <>Exécution réelle de l'agent H · statut « {resultat.statut} » · durée mesurée par notre code.</>
              : <>Valeurs d'exemple (simulation, aucune clé Supabase). Avec les clés, le bouton lance vraiment l'agent.</>}
          </p>
        </>
      ) : etat === "en_cours" ? (
        <p className="muted" style={{ marginTop: 14 }} aria-live="polite">
          {message || "En attente de l'agent…"} {reel && "(environ 2 minutes, jusqu'à 10 en cas de correction automatique)"}
        </p>
      ) : etat === "echec" ? (
        <div className="alert" style={{ marginTop: 14 }}>
          <h3>L'agent n'a pas terminé</h3>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
      ) : (
        <p className="muted" style={{ marginTop: 14 }}>
          L'agent H ouvre les 3 sites, remplit le formulaire et publie. La durée est mesurée par notre code.
          Compter environ 2 minutes.
        </p>
      )}
    </section>
  );
}
