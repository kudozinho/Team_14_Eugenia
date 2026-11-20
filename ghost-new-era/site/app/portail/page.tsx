"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Pastille from "@/components/portail/Pastille";
import { getSupabase } from "@/lib/supabase";

const TOUS = [
  { id: "rh", nom: "Espace RH et badges", chemin: "/intranet/rh" },
  { id: "messagerie", nom: "Messagerie", chemin: "/intranet/messagerie" },
  { id: "wiki", nom: "Wiki", chemin: "/intranet/wiki" },
];

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
        {proposition === "acceptee" && <p role="status"><b>D'accord.</b> Le lancement des 3 agents sera branché ici (Accès, Équipe, Docs).</p>}
        {proposition === "refusee" && <p role="status">Pas de souci, tu continues ton travail.</p>}

        {erreur && <p role="alert" style={{ color: "var(--o-700)" }}>{erreur}</p>}
        <button className="btn btn-secondary" onClick={deconnecter}>Se déconnecter</button>
      </aside>

      <Pastille enPause={enPause} onBascule={() => setEnPause((p) => !p)} />
    </main>
  );
}
