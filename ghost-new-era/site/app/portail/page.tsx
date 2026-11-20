"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Fantome from "@/components/portail/Fantome";
import Checklist from "@/components/portail/Checklist";
import ScenesAgents from "@/components/portail/ScenesAgents";
import { agentInfo } from "@/lib/agents";
import Pastille from "@/components/portail/Pastille";
import VueAgent from "@/components/portail/VueAgent";
import Rapport, { type DonneesRapport } from "@/components/portail/Rapport";
import { getSupabase } from "@/lib/supabase";
import { ecouter, microDispo } from "@/lib/voix";

// L'intranet d'Atelier Nova est un autre site, déployé à part.
const INTRANET = process.env.NEXT_PUBLIC_INTRANET_URL ?? "https://atelier-nova-intranet.vercel.app";

const TOUS = [
  { id: "rh", nom: "Espace RH et badges", chemin: `${INTRANET}/intranet/rh` },
  { id: "messagerie", nom: "Messagerie", chemin: `${INTRANET}/intranet/messagerie` },
  { id: "wiki", nom: "Wiki", chemin: `${INTRANET}/intranet/wiki` },
];

type Suivi = {
  runs: { id: string; agent: string; statut: string; session_h_id: string | null; vue_directe_url: string | null; actions_verifiees: number; actions_total: number; debut: string; fin: string | null; cout_credits: number | null }[];
  evenements: { id: string; run_id: string; action: string; statut: string; detail: string | null; outil: string | null }[];
  rapport: DonneesRapport["rapport"];
  decisions: { id: string; libelle: string; statut: string; reponse: string | null }[];
};

const outilsAutorises0 = (actifs: string[]) => TOUS.filter((o) => actifs.includes(o.id));

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
  const [etatCapture, setEtatCapture] = useState("Partage d'écran inactif.");
  const [suivi, setSuivi] = useState<Suivi | null>(null);
  const [rapportOuvert, setRapportOuvert] = useState(true);
  const [saisies, setSaisies] = useState<Record<string, string>>({});
  const [vus, setVus] = useState<{ t: string; resume: string }[]>([]);
  const [rafraichir, setRafraichir] = useState(0);
  const vueAgentsAuto = useRef(false);
  const outilRef = useRef<string>("");
  const [espacesVus, setEspacesVus] = useState<string[]>([]);
  const [ecoute, setEcoute] = useState(false);
  const [interim, setInterim] = useState("");
  const [transcript, setTranscript] = useState<{ t: string; texte: string }[]>([]);
  const [erreurVoix, setErreurVoix] = useState("");
  const stopEcoute = useRef<null | (() => void)>(null);
  const etatRef = useRef<{ proposition: string; suivi: Suivi | null; sessionId: string }>({ proposition: "aucune", suivi: null, sessionId: "" });
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
    if (!partage) { setEtatCapture("Partage d'écran inactif."); return; }
    if (enPause) { setEtatCapture("En pause : aucune image n'est envoyée."); return; }
    if (!sessionId) { setEtatCapture("Session absente : recommence l'observation."); return; }
    if (proposition !== "aucune") return;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.style.cssText = "position:fixed;left:-9999px;width:2px;height:2px;opacity:0";
    document.body.appendChild(video); // une vidéo hors du document peut ne pas décoder d'images
    if (flux.current) { video.srcObject = flux.current; video.play().catch(() => setEtatCapture("La vidéo du partage ne démarre pas.")); }
    setEtatCapture("En attente de la première image du partage…");
    const envoyer = async () => {
      if (enCours.current) return;
      if (!video.videoWidth) { setEtatCapture("En attente de la première image du partage…"); return; }
      enCours.current = true;
      try {
        const echelle = Math.min(1, 1254 / video.videoWidth);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * echelle);
        canvas.height = Math.round(video.videoHeight * echelle);
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL("image/jpeg", 0.7);
        setEtatCapture("Image envoyée à Holo, lecture en cours…");
        const { data } = await getSupabase().auth.getSession();
        const r = await fetch("/api/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
          body: JSON.stringify({ session_id: sessionId, image, outil: outilRef.current }),
        });
        const j = await r.json();
        if (!r.ok) { setErreur(j.erreur ?? "Lecture impossible."); setEtatCapture(`Erreur du serveur (${r.status}) : ${j.erreur ?? "lecture impossible"}`); return; }
        setErreur("");
        setEtatCapture("Dernière image lue par Holo.");
        setLecture({ resume: j.resume, latence_ms: j.latence_ms });
        if (outilRef.current) setEspacesVus((v) => (v.includes(outilRef.current) ? v : [...v, outilRef.current]));
        setVus((v) => (v[0]?.resume === j.resume ? v : [{ t: new Date().toLocaleTimeString("fr-FR"), resume: j.resume }, ...v].slice(0, 6)));
        if (j.proposition) { setPropositionId(j.proposition.id); setProposition("affichee"); }
      } catch (e) {
        setEtatCapture(`Envoi impossible : ${e instanceof Error ? e.message : "erreur réseau"}`);
      } finally {
        enCours.current = false;
      }
    };
    const premier = setTimeout(envoyer, 1500);
    const minuteur = setInterval(envoyer, 4000);
    return () => { clearTimeout(premier); clearInterval(minuteur); video.srcObject = null; video.remove(); };
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

  // Pendant que les agents travaillent, l'intranet affiché se recharge pour montrer les changements en direct
  // et l'onglet suit l'outil que l'agent utilise (la vue de la plateforme H ne peut pas être intégrée : elle l'interdit).
  const agentsAuTravail = proposition === "acceptee" && !!suivi && suivi.runs.some((r) => r.statut === "en_cours");
  useEffect(() => {
    if (!agentsAuTravail) return;
    const m = setInterval(() => setRafraichir((n) => n + 1), 5000);
    return () => clearInterval(m);
  }, [agentsAuTravail]);
  const dernierOutil = suivi?.evenements.length ? suivi.evenements[suivi.evenements.length - 1].outil : null;
  useEffect(() => {
    if (!agentsAuTravail || !dernierOutil) return;
    const id = dernierOutil.includes("RH") ? "rh" : dernierOutil.includes("Messagerie") ? "messagerie" : dernierOutil.includes("Wiki") ? "wiki" : null;
    if (id && actifs.includes(id)) setOngletActif(id);
  }, [agentsAuTravail, dernierOutil, actifs]);

  // Garde le service des agents (hébergé, offre gratuite) éveillé pendant que la session est ouverte.
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_ORCH_URL;
    if (!url || etape !== "observation") return;
    const ping = () => fetch(`${url}/sante`, { mode: "no-cors" }).catch(() => {});
    ping();
    const m = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(m);
  }, [etape]);

  // Dès que les agents démarrent, on montre leur écran : c'est le moment fort.
  useEffect(() => {
    if (suivi?.runs.length && !vueAgentsAuto.current) { vueAgentsAuto.current = true; setOngletActif("__agents"); }
  }, [suivi]);

  etatRef.current = { proposition, suivi, sessionId };
  outilRef.current = ongletActif === "__agents" ? "" : (outilsAutorises0(actifs).find((o) => o.id === ongletActif)?.id ?? "");

  // Ce que dit la personne : transcrit, enregistré, et compris comme commande (oui, non, valide).
  async function enregistrerDit(texte: string) {
    const heure = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setTranscript((x) => [...x.slice(-9), { t: heure, texte }]);
    const { data } = await getSupabase().auth.getSession();
    fetch("/api/vocal", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
      body: JSON.stringify({ session_id: etatRef.current.sessionId, texte }),
    }).catch(() => {});
    const m = texte.toLowerCase();
    const { proposition: prop, suivi: sv } = etatRef.current;
    if (prop === "affichee" && /\b(oui|vas-y|vas y|d'accord|ok|go|allez)\b/.test(m)) repondre("acceptee");
    else if (prop === "affichee" && /\b(non|annule|stop)\b/.test(m)) repondre("refusee");
    else if (/\bvalide\b/.test(m)) {
      const d = sv?.decisions.find((x) => x.statut === "en_attente" && x.libelle.startsWith("Valider la commande"));
      if (d) decider(d.id);
    }
  }

  function basculerMicro() {
    setErreurVoix("");
    if (ecoute) { stopEcoute.current?.(); stopEcoute.current = null; setEcoute(false); setInterim(""); return; }
    stopEcoute.current = ecouter({
      interim: (t) => { setInterim(t); },
      final: (t) => { if (t) { setInterim(""); enregistrerDit(t); } },
      fin: () => { setEcoute(false); setInterim(""); },
      erreur: (m) => { setErreurVoix(m); setEcoute(false); },
    });
    setEcoute(true);
  }

  async function secours() {
    setErreur("");
    const { data } = await getSupabase().auth.getSession();
    const r = await fetch("/api/secours", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
      body: JSON.stringify({ session_id: sessionId }),
    });
    const j = await r.json();
    if (!r.ok) { setErreur(j.erreur ?? "Déclenchement impossible."); return; }
    setPropositionId(j.proposition.id);
    setProposition("affichee");
  }

  function ouvrirVue(url: string) {
    // Fenêtre à droite de l'écran : l'agent H apparaît à côté du portail.
    const l = Math.round(window.screen.width * 0.5);
    window.open(url, "vue-agent-h", `popup=yes,width=${window.screen.width - l},height=${window.screen.height - 80},left=${l},top=0`);
  }

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
      <main className="cockpit accueil-portail">
        <div className="accueil-carte">
          <div className="halo" aria-hidden="true"><Logo taille={52} /></div>
          <span className="etiquette">Portail Ghost</span>
          <h1>Hello {prenom || "toi"}, prête à démarrer ?</h1>
          <p>Ghost observe ton écran dans les outils que tu autorises, repère l&apos;arrivée d&apos;un nouveau salarié et te propose de s&apos;en occuper. Tu décides à chaque étape.</p>
          <ol className="consignes" aria-label="Comment ça va se passer">
            <li><span><b>Tu autorises</b> les outils que Ghost peut regarder, un par un.</span></li>
            <li><span><b>Tu partages ton onglet</b> : Ghost lit ton écran, une pastille reste visible et tu peux le mettre en pause.</span></li>
            <li><span><b>Il te propose</b> de préparer l&apos;arrivée de Karim. Tu dis oui (au clic ou à voix haute).</span></li>
            <li><span><b>Trois agents H agissent</b> sous tes yeux : tu vois leurs écrans et où ils cliquent. Chaque action est vérifiée.</span></li>
          </ol>
          <fieldset className="choix-outils">
            <legend>Tu m&apos;autorises à utiliser…</legend>
            {TOUS.map((o) => {
              const nonAutorise = refuse(o);
              return (
                <label key={o.id} style={{ opacity: nonAutorise ? 0.6 : 1 }}>
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
          <p className="petit">Les agents peuvent aussi se connecter seuls à tes comptes : <a href="/connexions" style={{ color: "var(--g-300)" }}>gérer les comptes connectés</a>.</p>
          {erreur && <p role="alert" className="erreur">{erreur}</p>}
          <div className="rang">
            <button className="btn btn-primary" disabled={coches.length === 0} onClick={commencer}>Commencer l&apos;observation</button>
            <button className="btn btn-secondary" onClick={deconnecter}>Se déconnecter</button>
          </div>
        </div>
      </main>
    );
  }

  const outilsAutorises = TOUS.filter((o) => actifs.includes(o.id));
  const courant = outilsAutorises.find((o) => o.id === ongletActif) ?? outilsAutorises[0];
  const rapportPret = !!suivi && suivi.runs.length >= 3 && suivi.runs.every((r) => r.statut !== "en_cours") && rapportOuvert;
  const phase = proposition === "acceptee" ? (rapportPret ? 5 : 4) : proposition === "affichee" ? 3 : 2;
  const ETAPES = ["Accord", "Il observe", "Il propose", "Ils agissent", "Preuve"];
  const consigne = phase === 5 ? "Karim est prêt. Regarde le rapport : chaque ligne est prouvée dans l'outil. Valide la commande si elle est en attente."
    : phase === 4 ? "Les trois agents travaillent en parallèle. Regarde leurs écrans : le point rouge montre où ils cliquent. S'ils te posent une question, réponds."
    : phase === 3 ? "Ghost te propose de s'en occuper. Dis « oui » à voix haute, ou clique sur « Oui, vas-y »."
    : "Clique sur « Partager mon onglet » (Onglet Chrome, cet onglet) et laisse l'accueil RH visible : Ghost attend l'arrivée de Karim. Pas de partage possible ? Utilise le bouton de secours.";
  const nomAgent = (a: string) => (a === "acces" ? "Accès" : a === "equipe" ? "Équipe" : "Docs");

  return (
    <main className="portail cockpit">
      <header className="portail-haut">
        <span className="portail-marque"><Logo taille={22} /> Ghost</span>
        <a href="/connexions" className="lien-haut">Comptes connectés</a>
        <ol className="etapes" aria-label="Avancement">
          {ETAPES.map((e, i) => (
            <li key={e} className={i + 1 < phase ? "fait" : i + 1 === phase ? "courant" : ""}><span>{i + 1 < phase ? "✓" : i + 1}</span>{e}</li>
          ))}
        </ol>
        <span className={`etat ${enPause ? "pause" : "vit"}`}>{enPause ? "En pause" : "Il observe"}</span>
      </header>

      <section aria-label="Poste de travail" className="poste">
        <p className="consigne" role="note"><b>Maintenant :</b> {consigne}</p>
        <nav className="onglets">
          {outilsAutorises.map((o) => (
            <button key={o.id} className={o.id === courant?.id ? "actif" : ""} onClick={() => setOngletActif(o.id)}>{o.nom}</button>
          ))}
          {!!suivi?.runs.length && <button className={ongletActif === "__agents" ? "actif" : ""} onClick={() => setOngletActif("__agents")}>Agents en direct</button>}
          {agentsAuTravail && <span className="direct">● Intranet en direct : se met à jour pendant que les agents agissent</span>}
        </nav>
        {rapportPret
          ? <div className="rapport-zone"><Rapport d={suivi as unknown as DonneesRapport} onFermer={() => setRapportOuvert(false)} /></div>
          : ongletActif === "__agents" && suivi && suivi.runs.length > 0
            ? <ScenesAgents runs={suivi.runs} />
            : courant && <iframe key={`${courant.id}-${rafraichir}`} title={courant.nom} src={courant.chemin} className="cadre" />}
      </section>

      <aside aria-label="Panneau Ghost" className="panneau">
        <div className="bloc">
          <h2>Ce que Ghost voit</h2>
          <ul className="espaces" aria-label="Espaces observés">
            {outilsAutorises.map((o) => <li key={o.id} className={espacesVus.includes(o.id) ? "vu" : ""}><span className="pt" />{o.nom.split(" ")[0] === "Espace" ? "RH" : o.nom}</li>)}
          </ul>
          <p className="petit">Navigue dans les espaces pendant que Ghost regarde : il note ceux qu&apos;il a vus.</p>
          <p className="petit">Outils autorisés : <b>{outilsAutorises.map((o) => o.nom).join(", ") || "aucun"}</b></p>
          {partage
            ? <button className="btn btn-secondary" onClick={arreterPartage}>Arrêter le partage d'écran</button>
            : <button className="btn btn-primary" onClick={partager}>Partager mon onglet</button>}
          <p className="petit" role="status">{etatCapture}</p>
          {vus.length > 0 && (
            <ul className="fil" aria-label="Ce que Ghost a lu">
              {vus.map((v, i) => <li key={`${v.t}-${i}`}><time>{v.t}</time> {v.resume}</li>)}
            </ul>
          )}
          {lecture && <p className="petit">Lecture par Holo en {(lecture.latence_ms / 1000).toFixed(1)} s. Les images ne sont jamais conservées, seul ce texte l'est.</p>}
          {!partage && <p className="petit">Pas de partage possible ? Le bouton de secours ci-dessous déclenche la vraie proposition ; le rapport final l'indiquera.</p>}
        </div>

        <div className="bloc voix">
          <h2>Parler à Ghost</h2>
          {!microDispo() && <p className="petit">La reconnaissance vocale n'est pas disponible dans ce navigateur : utilise Chrome.</p>}
          <div className="rang">
            
            {microDispo() && <button className={`btn ${ecoute ? "btn-primary" : "btn-secondary"}`} onClick={basculerMicro}>{ecoute ? "● J'écoute… (cliquer pour arrêter)" : "Parler à Ghost"}</button>}
          </div>
          {interim && <p className="petit"><i>{interim}…</i></p>}
          {erreurVoix && <p role="alert" className="erreur">{erreurVoix}</p>}
          {transcript.length > 0 && (
            <ul className="fil" aria-label="Ce que tu as dit">
              {transcript.map((x, i) => <li key={`${x.t}-${i}`}><time>{x.t}</time> {x.texte}</li>)}
            </ul>
          )}
          <p className="petit">Dis « oui » à la proposition, ou « valide » pour la commande. Le texte de ce que tu dis est gardé ; aucun son ne l&apos;est.</p>
        </div>

        {proposition === "aucune" && (
          <div className="bloc secours">
            <button className="btn btn-secondary" disabled={enPause || !sessionId} onClick={secours}>Secours : signaler l'arrivée de Karim</button>
            <p className="petit">Mode secours, utilisé seulement si l'observation ne peut pas démarrer.</p>
          </div>
        )}

        {proposition === "affichee" && (
          <div role="dialog" aria-label="Proposition de Ghost" className="bloc proposition">
            <span className="etiquette">Ghost propose</span>
            <h3>Je prépare l'onboarding de Karim comme pour Léa ?</h3>
            <p>L'arrivée de Karim est apparue dans l'espace RH. Trois agents H s'en occupent en parallèle : accès et badge, messagerie, wiki.</p>
            <div className="rang">
              <button className="btn btn-primary" onClick={() => repondre("acceptee")}>Oui, vas-y</button>
              <button className="btn btn-secondary" onClick={() => repondre("refusee")}>Non, merci</button>
            </div>
          </div>
        )}

        {proposition === "acceptee" && (
          <div role="status" className="bloc">
            <h2>Les agents H travaillent</h2>
            {!propositionId && <p className="petit">Aucune proposition enregistrée : aucun agent n'est lancé.</p>}
            {propositionId && !suivi?.runs.length && <p className="petit">Démarrage des agents… (le service peut mettre une minute à se réveiller)</p>}
            {suivi && <Checklist preuve={suivi.rapport?.preuve ?? {}} runs={suivi.runs} evenements={suivi.evenements} />}
            {suivi?.decisions.filter((d) => d.statut === "en_attente").map((d) => (
              <div key={d.id} className="agent question">
                <h3>{d.libelle.startsWith("Valider la commande") ? "Validation nécessaire" : "L'agent a une question"}</h3>
                <p>{d.libelle}</p>
                {!d.libelle.startsWith("Valider la commande") && (
                  <input aria-label="Ta réponse" value={saisies[d.id] ?? ""} onChange={(e) => setSaisies((x) => ({ ...x, [d.id]: e.target.value }))} placeholder="Ta réponse" />
                )}
                <button className="btn btn-primary" onClick={() => decider(d.id)}>{d.libelle.startsWith("Valider la commande") ? "Valider la commande" : "Répondre à l'agent"}</button>
              </div>
            ))}
            {!rapportOuvert && <button className="btn btn-secondary" onClick={() => setRapportOuvert(true)}>Revoir le rapport</button>}
          </div>
        )}
        {proposition === "refusee" && <p className="bloc" role="status">Pas de souci, tu continues ton travail.</p>}

        {erreur && <p role="alert" className="erreur">{erreur}</p>}
        <button className="btn btn-secondary" onClick={deconnecter}>Se déconnecter</button>
      </aside>

      <Pastille enPause={enPause} onBascule={() => setEnPause((p) => !p)} />
    </main>
  );
}
