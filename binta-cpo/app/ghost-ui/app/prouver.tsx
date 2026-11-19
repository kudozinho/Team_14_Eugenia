"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Execution } from "@/lib/data";
import { formatDuree, verificationPositive } from "@/lib/data";

// Parcours « Agent H en action » : une demande, un identifiant, des états réels lus dans Supabase.
// Aucune simulation : sans service H configuré, le bouton est désactivé et le dit.
// Le résultat affiché est TOUJOURS celui de la demande lancée ici (même identifiant), jamais une exécution précédente.

type Etat = "attente" | "demande" | "suivi" | "termine" | "non_verifie" | "echec" | "indisponible";
type Etape = "recue" | "attente" | "agent" | "verification" | "fin";

type Ligne = {
  id: string; statut: string; resume: string | null; duree_s: number | null; duree_humaine_s: number | null;
  session_id: string | null; portails_publies: string[] | null; cree_le?: string;
  verification?: string | null;   // futur : « ok » fourni par le backend après contrôle réel des publications
};

const SITES = ["Portail A", "Portail B", "Portail C"];
const ETAPES: { id: Etape; titre: string }[] = [
  { id: "recue", titre: "Demande reçue" },
  { id: "attente", titre: "En attente du service" },
  { id: "agent", titre: "Agent en cours" },
  { id: "verification", titre: "Vérification" },
  { id: "fin", titre: "Terminé" },
];

// Une exécution n'est un succès que si le backend PROUVE la vérification des annonces (résumé positif ou verification === "ok")
// et que les 3 portails sont listés. L'absence de message d'erreur ne suffit pas, et une liste déclarée par H ne suffit pas.
function verifiee(l: Ligne): boolean {
  return l.statut === "completed" && !!l.duree_s && SITES.every((s) => (l.portails_publies ?? []).includes(s))
    && verificationPositive(l.resume, l.verification);
}

// Étape affichée, déduite de la ligne lue dans la base (aucune étape inventée).
function etapeDe(l: Ligne | null): Etape {
  if (!l) return "recue";
  if (l.statut !== "en_cours") return "fin";
  if (l.resume === "CLOUD_PENDING") return "attente"; // en file : pas encore prise par le service (ne prouve pas un réveil en cours)
  if (/vérif/i.test(l.resume ?? "")) return "verification";
  return "agent";
}

export default function Prouver({ exemple, tacheId }: { exemple?: Execution; tacheId?: string }) {
  const [etat, setEtat] = useState<Etat>("attente");
  const [etape, setEtape] = useState<Etape>("recue");
  const [secondes, setSecondes] = useState(0);
  const [demandeId, setDemandeId] = useState<string | null>(null);
  const [ligne, setLigne] = useState<Ligne | null>(null);   // résultat de CETTE demande, jamais d'une précédente
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");                      // gardé seulement en mémoire, jamais stocké
  const [codeRequis, setCodeRequis] = useState(false);
  const [erreurAcces, setErreurAcces] = useState("");
  const router = useRouter();
  const minuteur = useRef<ReturnType<typeof setInterval> | null>(null);
  const chrono = useRef<ReturnType<typeof setInterval> | null>(null);
  const verrou = useRef(false); // bloque un deuxième clic avant même le re-rendu
  // Clé de demande envoyée au serveur pour éviter un doublon : réutilisée tant qu'aucune réponse n'a été reçue (délai dépassé),
  // changée seulement après une réponse. Le serveur doit la traiter comme idempotente (champ cle_demande).
  const cle = useRef<string | null>(null);

  useEffect(() => () => { if (minuteur.current) clearInterval(minuteur.current); if (chrono.current) clearInterval(chrono.current); }, []);

  function arreter() {
    if (minuteur.current) clearInterval(minuteur.current);
    if (chrono.current) clearInterval(chrono.current);
  }
  function terminer(e: Etat, m = "") { arreter(); verrou.current = false; setMessage(m); setEtat(e); }

  async function lancer() {
    if (verrou.current) return;
    verrou.current = true;
    const entetes: Record<string, string> = { "Content-Type": "application/json", ...(code ? { Authorization: `Bearer ${code}` } : {}) };
    setEtat("demande"); setEtape("recue"); setSecondes(0); setLigne(null); setDemandeId(null); setMessage("Envoi de la demande… si le service gratuit dormait, cela peut prendre jusqu'à environ une minute avant de recevoir un identifiant.");
    const debut = Date.now();
    chrono.current = setInterval(() => setSecondes(Math.round((Date.now() - debut) / 1000)), 500);
    try {
      const r = await fetch("/api/prouver", { method: "POST", headers: entetes, body: JSON.stringify({ tache_id: tacheId, cle_demande: (cle.current ??= crypto.randomUUID()) }), signal: AbortSignal.timeout(90_000) });
      cle.current = null; // une réponse est arrivée : la prochaine demande aura une nouvelle clé
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { terminer("attente"); setCodeRequis(!!d.code_requis); setErreurAcces(d.erreur || "Accès refusé."); return; }
      if (r.status === 402 || d.credits_indisponibles) { terminer("indisponible", "Crédits de l'agent H insuffisants ou non confirmés : aucun lancement, aucune recharge. Aucune exécution n'a été démarrée et rien n'est simulé."); return; }
      if (r.status === 409) { terminer("indisponible", "Une exécution est déjà en cours. Une seule exécution à la fois : attendez qu'elle se termine avant de relancer."); return; }
      if (r.status === 503 || d.desactive) { terminer("indisponible", d.erreur || "Le service agent H n'est pas disponible pour le moment. Aucune exécution n'a été démarrée et rien n'est simulé."); return; }
      if (!r.ok || !d.id) { terminer("echec", d.erreur || "La demande n'a pas pu être créée."); return; }
      setErreurAcces(""); setCodeRequis(false);
      setDemandeId(d.id); setEtat("suivi");
      setMessage("Demande enregistrée. Le service H la prend en charge.");
      minuteur.current = setInterval(async () => {
        if (Date.now() - debut > 11 * 60 * 1000) {
          terminer("echec", "Délai dépassé (plus de 10 minutes). Aucune relance automatique : vérifiez les portails avant de relancer.");
          return;
        }
        try {
          const g = await fetch(`/api/prouver?id=${encodeURIComponent(d.id)}`, { cache: "no-store", headers: entetes });
          const j = await g.json();
          const l: Ligne | undefined = j.ligne;
          if (!l || l.id !== d.id) return; // on ne montre que la ligne de CETTE demande
          setEtape(etapeDe(l));
          setMessage(l.resume === "CLOUD_PENDING"
            ? (j.service === "reveil" ? "Le service gratuit se réveille (confirmé par le serveur) : environ une minute." : "Demande en file : le service ne l'a pas encore prise. S'il dormait, son réveil peut prendre environ une minute.")
            : (l.resume ?? ""));
          if (l.statut === "en_cours") return;
          setLigne({ ...l, portails_publies: l.portails_publies ?? [] });
          if (verifiee(l)) { terminer("termine"); router.refresh(); }
          else if (l.statut === "completed") terminer("non_verifie", "L'agent a terminé, mais les annonces n'ont pas été vérifiées sur les 3 portails : ce n'est pas un succès.");
          else terminer("echec", l.resume || `L'agent s'est arrêté (${l.statut}).`);
        } catch { /* on réessaie au prochain tour */ }
      }, 5000);
    } catch (e) {
      const delai = e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError");
      terminer("echec", delai ? "Le service n'a pas répondu en 90 secondes (il dormait peut-être). La demande a peut-être été créée : si vous relancez, la même clé de demande est renvoyée pour éviter un doublon, mais vérifiez d'abord le rapport de l'agent. Aucune relance automatique." : (e instanceof Error ? e.message : "Erreur inconnue"));
    }
  }

  const occupe = etat === "demande" || etat === "suivi";
  const publies = ligne?.portails_publies ?? [];
  const ref = ligne?.duree_humaine_s ?? null;   // référence « à la main » enregistrée avec cette exécution, si elle existe
  const gain = ref && ligne?.duree_s ? Math.round((1 - ligne.duree_s / ref) * 100) : null;
  const idx = ETAPES.findIndex((e) => e.id === etape);

  return (
    <section className="card proof">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>L'agent H refait la tâche, chronomètre en main</h3>
        <div className="row">
          <button className="btn" onClick={lancer} disabled={occupe || etat === "indisponible"} aria-busy={occupe}>
            {occupe ? `En cours… ${secondes} s` : "Lancer l'agent H"}
          </button>
          {(etat === "termine" || etat === "non_verifie" || etat === "echec" || etat === "indisponible") && (
            <button className="btn sec" onClick={() => { setEtat("attente"); setLigne(null); setDemandeId(null); setMessage(""); setEtape("recue"); }}>Effacer</button>
          )}
        </div>
      </div>

      {erreurAcces && (
        <div className="alert" style={{ marginTop: 14 }} role="alert">
          <p style={{ margin: 0 }}>{erreurAcces}</p>
          {codeRequis && (
            <form style={{ marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); if (code.trim()) lancer(); }}>
              <label>Code d'accès pour lancer l'agent<br />
                <input type="password" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" style={{ padding: 10, width: "min(100%, 360px)" }} />
              </label>{" "}
              <button className="btn" type="submit" disabled={!code.trim() || occupe}>Valider et lancer</button>
            </form>
          )}
        </div>
      )}

      {(occupe || ligne) && (
        <ol className="etapes" aria-label="Étapes de l'exécution">
          {ETAPES.map((e, i) => {
            const fini = etat === "termine" || i < idx;
            const actif = occupe && i === idx;
            const rate = (etat === "echec" || etat === "non_verifie") && i === idx;
            return <li key={e.id} className={`etape ${fini ? "fait" : ""} ${actif ? "actif" : ""} ${rate ? "rate" : ""}`} aria-current={actif ? "step" : undefined}>
              <span aria-hidden="true">{fini ? "✓" : rate ? "!" : i + 1}</span>{e.titre}
            </li>;
          })}
        </ol>
      )}

      <div className="sites" aria-live="polite">
        {SITES.map((s) => {
          const ok = etat === "termine" && publies.includes(s);
          return <span key={s} className={`site ${ok ? "done" : ""}`}>{ok ? "✓" : "○"} {s}{ok ? " · vérifié" : ""}</span>;
        })}
      </div>

      {occupe && (
        <>
          <div className="progress" role="progressbar" aria-label="Exécution en cours"><i className="indef" /></div>
          <p className="muted" style={{ marginTop: 14 }} aria-live="polite">
            {message}{demandeId && <> · demande <code>{demandeId}</code></>}
            {" "}Compter environ 2 minutes une fois le service prêt, jusqu'à 10 en cas de correction automatique.
          </p>
        </>
      )}

      {etat === "termine" && ligne && (
        <>
          <div className="row" style={{ gap: 28, marginTop: 18, alignItems: "flex-end" }}>
            <div>
              <div className="big-gain num">{formatDuree(ligne.duree_s as number)}</div>
              <div className="muted">pour {publies.length} portails sur 3, annonces vérifiées{gain !== null && <> · {gain >= 0 ? `−${gain}` : `+${-gain}`} % par rapport à {formatDuree(ref as number)} à la main</>}</div>
            </div>
          </div>
          <p className="note">
            Exécution réelle de cette demande ({demandeId}) · session H {ligne.session_id || "non indiquée"}
            {ligne.cree_le ? ` · ${new Date(ligne.cree_le).toLocaleString("fr-FR")}` : ""} · durée mesurée par notre code.
            {gain === null && " Aucune référence « à la main » n'est enregistrée avec cette exécution : pas de comparaison affichée."}
            {" "}Une seule exécution ne remplace pas la médiane du rapport.
          </p>
        </>
      )}

      {etat === "non_verifie" && (
        <div className="alert" style={{ marginTop: 14 }} role="alert">
          <h3>Terminé, mais non vérifié</h3>
          <p style={{ margin: 0 }}>{message}</p>
          {ligne?.resume && <p className="muted" style={{ margin: "8px 0 0" }}>{ligne.resume}</p>}
        </div>
      )}

      {etat === "echec" && (
        <div className="alert" style={{ marginTop: 14 }} role="alert">
          <h3>L'agent n'a pas terminé</h3>
          <p style={{ margin: 0 }}>{message}</p>
          {demandeId && <p className="muted" style={{ margin: "8px 0 0" }}>Demande <code>{demandeId}</code>. Pas de relance automatique : les annonces ont pu être publiées en partie.</p>}
        </div>
      )}

      {etat === "indisponible" && (
        <div className="alert" style={{ marginTop: 14 }} role="alert">
          <h3>Lancement impossible</h3>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
      )}

      {etat === "attente" && (
        <p className="muted" style={{ marginTop: 14 }}>
          L'agent H ouvre les 3 sites, remplit le formulaire et publie ; le résultat n'est affiché qu'après vérification des annonces.
          Le service est gratuit et s'endort sans trafic : <strong>le premier lancement peut prendre environ une minute de plus</strong>.
        </p>
      )}
    </section>
  );
}
