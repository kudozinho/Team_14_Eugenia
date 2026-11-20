"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Pastille from "@/components/portail/Pastille";
import { getSupabase } from "@/lib/supabase";

// L'intranet d'Atelier Nova est un autre site, déployé à part.
const INTRANET = process.env.NEXT_PUBLIC_INTRANET_URL ?? "https://atelier-nova-intranet.vercel.app";

const TOUS = [
  { id: "rh", nom: "Espace RH et badges", chemin: `${INTRANET}/intranet/rh` },
  { id: "messagerie", nom: "Messagerie", chemin: `${INTRANET}/intranet/messagerie` },
  { id: "wiki", nom: "Wiki", chemin: `${INTRANET}/intranet/wiki` },
];

type Suivi = {
  runs: { id: string; agent: string; statut: string; vue_directe_url: string | null; actions_verifiees: number; actions_total: number }[];
  evenements: { id: string; run_id: string; action: string; statut: string; detail: string | null }[];
  decisions: { id: string; libelle: string; statut: string; reponse: string | null }[];
};

type Etape = "chargement" | "accord" | "observation";

export default function Portail() {
  const router = useRouter();
  const [etape, setEtape] = useState<Etape>("chargement");
  const [prenom, setPrenom] = useState("");
  const [interdits, setInterdits] = useState<string[]>([]);
  const [coches, setCoches] = useState<string[]>([]);
  const [actifs, setActifs] = useState<string[]>([]);
  const [ongletActif, setOngletActif] = useState("rh");
  const [enPause, setEnPause] = useState(false);
  const [partage, setPartage] = useState(false);
  const [proposition, setProposition] = useState<"aucune" | "affichee" | "acceptee" | "refusee">("aucune");
  const [erreur, setErreur] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [propositionId, setPropositionId] = useState("");
  const [lecture, setLecture] = useState<{ resume: string; latence_ms: number } | null>(null);
  const [suivi, setSuivi] = useState<Suivi | null>(null);
  const [saisies, setSaisies] = useState<Record<string, string>>({});
  const flux = useRef<MediaStream | null>(null);
  const enCours = useRef(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/connexion"); return; }
      setPrenom(String(data.user.user_metadata?.prenom ?? ""));
      const { data: profil } = await supabase.from("profils").select("outils_interdits").eq("user_id", data.user.id).maybeSingle();
      const interdit = ((profil?.outils_interdits ?? []) as string[]).map((x) => x.toLowerCase());
      setInterdits(interdit);
      setEtape("accord");
    });
  }, [router]);

  const refuse = (o: { id: string; nom: string }) =>
    interdits.some((i) => i.includes(o.id) || (o.id === "rh" && i.includes("rh")));

  async function commencer() {
    setErreur("");
    const { data } = await getSupabase().auth.getSession();
    const jeton = data.session?.access_token;
    const r = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jeton}` },
      body: JSON.stringify({ accordes: coches }),
    });
    const j = await r.json();
    if (!r.ok) { setErreur(j.erreur ?? "Impossible de démarrer la session."); return; }
    setSessionId(j.session_id);
    setActifs(j.outils);
    setOngletActif(j.outils[0] ?? "rh");
    setEtape("observation");
  }

  async function partager() {
    setErreur("");
    try {
      // Chrome : l'utilisatrice choisit l'onglet à partager. Rien n'est encore envoyé ni enregistré.
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      flux.current = s;
      setPartage(true);
      s.getVideoTracks()[0].addEventListener("ended", () => setPartage(false));
    } catch {
      setErreur("Le partage d'écran a été refusé ou n'est pas disponible dans ce navigateur.");
    }
  }

  function arreterPartage() {
    flux.current?.getTracks().forEach((t) => t.stop());
    flux.current = null;
    setPartage(false);
  }

  // Toutes les 4 secondes (sauf en pause) : une image de l'onglet partagé part au serveur, qui la fait lire par Holo.
  // L'image n'est jamais stockée : seul le résumé texte est gardé.
  useEffect(() => {
    if (!partage || enPause || !sessionId || proposition !== "aucune") return;
    const video = document.createElement("video");
    video.muted = true;
    if (flux.current) { video.srcObject = flux.current; video.play().catch(() => {}); }
    const minuteur = setInterval(async () => {
      if (enCours.current || video.videoWidth === 0) return;
      enCours.current = true;
      try {
        const echelle = Math.min(1, 1254 / video.videoWidth);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * echelle);
        canvas.height = Math.round(video.videoHeight * echelle);
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL("image/jpeg", 0.7);
        const { data } = await getSupabase().auth.getSession();
        const r = await fetch("/api/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
          body: JSON.stringify({ session_id: sessionId, image }),
        });
        const j = await r.json();
        if (!r.ok) { setErreur(j.erreur ?? "Lecture impossible."); return; }
        setErreur("");
        setLecture({ resume: j.resume, latence_ms: j.latence_ms });
        if (j.proposition) { setPropositionId(j.proposition.id); setProposition("affichee"); }
      } finally {
        enCours.current = false;
      }
    }, 4000);
    return () => { clearInterval(minuteur); video.srcObject = null; };
  }, [partage, enPause, sessionId, proposition]);

  // Une fois la proposition acceptée, le portail interroge le suivi toutes les 3 secondes.
  useEffect(() => {
    if (proposition !== "acceptee" || !propositionId) return;
    let actif = true;
    const lire = async () => {
      const { data } = await getSupabase().auth.getSession();
      const r = await fetch(`/api/suivi?proposition=${propositionId}`, { headers: { Authorization: `Bearer ${data.session?.access_token}` } });
      if (r.ok && actif) setSuivi(await r.json());
    };
    lire();
    const m = setInterval(lire, 3000);
    return () => { actif = false; clearInterval(m); };
  }, [proposition, propositionId]);

  async function decider(id: string) {
    const { data } = await getSupabase().auth.getSession();
    await fetch("/api/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
      body: JSON.stringify({ id, reponse: saisies[id] ?? "" }),
    });
  }

  async function repondre(statut: "acceptee" | "refusee") {
    setProposition(statut);
    if (!propositionId) return; // proposition simulée : rien à enregistrer
    const { data } = await getSupabase().auth.getSession();
    await fetch("/api/proposition", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
      body: JSON.stringify({ id: propositionId, statut }),
    });
  }

  async function deconnecter() {
    arreterPartage();
    await getSupabase().auth.signOut();
    router.push("/");
  }

  if (etape === "chargement") return <main className="wrap" style={{ padding: 40 }}><p>Chargement…</p></main>;

  if (etape === "accord") {
    return (
      <main className="wrap" style={{ padding: "40px", maxWidth: 720, margin: 0 }}>
        <span className="eyebrow">Portail Ghost</span>
        <h1 style={{ margin: "12px 0 8px" }}>Hello {prenom || "toi"}, prête à démarrer ?</h1>
        <p style={{ marginBottom: 20 }}>Dis-moi dans quels outils j'ai le droit de regarder et d'agir. Je n'utiliserai que ceux que tu coches.</p>
        <fieldset className="card" style={{ border: "1px solid var(--line)", display: "grid", gap: 12 }}>
          <legend style={{ fontWeight: 700, padding: "0 6px" }}>Tu m'autorises à utiliser…</legend>
          {TOUS.map((o) => {
            const nonAutorise = refuse(o);
            return (
              <label key={o.id} style={{ display: "flex", gap: 10, alignItems: "center", opacity: nonAutorise ? 0.6 : 1 }}>
                <input
                  type="checkbox"
                  disabled={nonAutorise}
                  checked={coches.includes(o.id)}
                  onChange={(e) => setCoches((c) => (e.target.checked ? [...c, o.id] : c.filter((x) => x !== o.id)))}
                />
                <span>{o.nom}{nonAutorise ? " (tu as interdit cet outil dans le questionnaire)" : ""}</span>
              </label>
            );
          })}
        </fieldset>
        {erreur && <p role="alert" style={{ color: "var(--o-700)", margin: "12px 0" }}>{erreur}</p>}
        <p style={{ marginTop: 20 }}>
          <button className="btn btn-primary" disabled={coches.length === 0} onClick={commencer}>Commencer l'observation</button>
        </p>
        <p style={{ marginTop: 20 }}><button className="btn btn-secondary" onClick={deconnecter}>Se déconnecter</button></p>
      </main>
    );
  }

  const outilsAutorises = TOUS.filter((o) => actifs.includes(o.id));
  const courant = outilsAutorises.find((o) => o.id === ongletActif) ?? outilsAutorises[0];

  return (
    <main style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 16, padding: 16, minHeight: "100vh", paddingBottom: 80 }}>
      <section aria-label="Poste de travail" style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 8 }}>
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {outilsAutorises.map((o) => (
            <button key={o.id} className="btn btn-secondary" style={{ padding: "8px 16px", background: o.id === courant?.id ? "var(--g-100)" : "transparent" }} onClick={() => setOngletActif(o.id)}>{o.nom}</button>
          ))}
        </nav>
        {courant && <iframe title={courant.nom} src={courant.chemin} style={{ width: "100%", height: "100%", minHeight: 520, border: "1px solid var(--line-2)", borderRadius: 14, background: "#fff" }} />}
      </section>

      <aside aria-label="Panneau Ghost" className="card" style={{ alignSelf: "start", display: "grid", gap: 14 }}>
        <h2>Ghost</h2>
        <p>Outils autorisés : <b>{outilsAutorises.map((o) => o.nom).join(", ") || "aucun"}</b></p>
        <p>État : <b>{enPause ? "En pause" : "Il observe"}</b></p>

        <div>
          <p style={{ marginBottom: 8 }}>Partage d'écran : <b>{partage ? "actif" : "inactif"}</b></p>
          {partage
            ? <button className="btn btn-secondary" onClick={arreterPartage}>Arrêter le partage</button>
            : <button className="btn btn-secondary" onClick={partager}>Partager mon onglet</button>}
          <p style={{ marginTop: 8, fontSize: "0.9rem", color: "var(--mute)" }}>Une image de l'onglet part toutes les 4 secondes (sauf en pause) pour être lue par Holo. Les images ne sont jamais conservées : seul un résumé en texte est gardé.</p>
          {lecture && <p style={{ marginTop: 8 }}>Ghost voit : {lecture.resume} <span style={{ color: "var(--mute)" }}>({(lecture.latence_ms / 1000).toFixed(1)} s)</span></p>}
        </div>

        <div role="note" style={{ background: "var(--ochre-50)", color: "var(--ochre-700)", borderRadius: 12, padding: "10px 12px", fontWeight: 600 }}>
          Mode démo : le bouton ci-dessous simule la détection si le partage d'écran n'est pas utilisé.
        </div>
        {proposition === "aucune" && (
          <button className="btn btn-secondary" disabled={enPause} onClick={() => setProposition("affichee")}>Simuler : arrivée de Karim détectée</button>
        )}
        {proposition === "affichee" && (
          <div role="dialog" aria-label="Proposition de Ghost" className="card" style={{ borderColor: "var(--g-700)", borderWidth: 2 }}>
            <h3>Je prépare l'onboarding de Karim comme pour Léa ?</h3>
            <p style={{ margin: "6px 0 12px" }}>J'ai vu la notification d'arrivée de Karim. Je m'en occupe ?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => repondre("acceptee")}>Oui, vas-y</button>
              <button className="btn btn-secondary" onClick={() => repondre("refusee")}>Non, merci</button>
            </div>
          </div>
        )}
        {proposition === "acceptee" && (
          <div role="status" style={{ display: "grid", gap: 12 }}>
            <p><b>D'accord, je m'en occupe.</b> Les agents H travaillent sous tes yeux ; chaque ligne n'est cochée que si l'outil l'a confirmée.</p>
            {!propositionId && <p style={{ color: "var(--ochre-700)" }}>Mode démo : proposition simulée, aucun agent n'est lancé.</p>}
            {propositionId && !suivi?.runs.length && <p>En attente du démarrage des agents…</p>}
            {suivi?.runs.map((r) => (
              <div key={r.id} className="card" style={{ padding: 14 }}>
                <h3>Agent {r.agent === "acces" ? "Accès" : r.agent === "equipe" ? "Équipe" : "Docs"} · {r.statut === "en_cours" ? "au travail" : r.statut === "termine" ? "terminé" : "échec"}</h3>
                <ul style={{ margin: "8px 0", paddingLeft: 0, listStyle: "none", display: "grid", gap: 4 }}>
                  {suivi.evenements.filter((e) => e.run_id === r.id).map((e) => (
                    <li key={e.id}>
                      {e.statut === "ok" ? "☑" : e.statut === "echec" ? "✗" : e.statut === "question" || e.statut === "attente_validation" ? "⏸" : "…"} {e.action}
                      {e.detail ? <span style={{ color: "var(--mute)" }}> : {e.detail}</span> : null}
                    </li>
                  ))}
                </ul>
                {r.vue_directe_url && <a href={r.vue_directe_url} target="_blank" rel="noreferrer">Voir l&apos;agent en direct</a>}
              </div>
            ))}
            {suivi?.decisions.filter((d) => d.statut === "en_attente").map((d) => (
              <div key={d.id} className="card" style={{ borderColor: "var(--o-600)", padding: 14 }}>
                <h3>{d.libelle.startsWith("Valider la commande") ? "Validation nécessaire" : "L'agent a une question"}</h3>
                <p style={{ margin: "6px 0 10px" }}>{d.libelle}</p>
                {!d.libelle.startsWith("Valider la commande") && (
                  <input aria-label="Ta réponse" style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--line-2)", marginBottom: 8, font: "inherit" }}
                    value={saisies[d.id] ?? ""} onChange={(e) => setSaisies((x) => ({ ...x, [d.id]: e.target.value }))} placeholder="Ta réponse" />
                )}
                <button className="btn btn-secondary" onClick={() => decider(d.id)}>{d.libelle.startsWith("Valider la commande") ? "Valider la commande" : "Répondre à l'agent"}</button>
              </div>
            ))}
          </div>
        )}
        {proposition === "refusee" && <p role="status">Pas de souci, tu continues ton travail.</p>}

        {erreur && <p role="alert" style={{ color: "var(--o-700)" }}>{erreur}</p>}
        <button className="btn btn-secondary" onClick={deconnecter}>Se déconnecter</button>
      </aside>

      <Pastille enPause={enPause} onBascule={() => setEnPause((p) => !p)} />
    </main>
  );
}
