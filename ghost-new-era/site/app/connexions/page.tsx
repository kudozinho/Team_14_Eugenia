"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { getSupabase } from "@/lib/supabase";
import { useUtilisateur } from "@/lib/useUtilisateur";

const ORCH = process.env.NEXT_PUBLIC_ORCH_URL ?? "";

type Champ = { k: string; label: string; type: "text" | "password" };
const APPS: { id: string; nom: string; pourquoi: string; etapes: [string, string | null][]; champs: Champ[] }[] = [
  { id: "notion", nom: "Notion", pourquoi: "Les agents lisent ta page d'accueil des nouveaux arrivants et y créent la page d'onboarding.",
    etapes: [["Crée une intégration et copie son secret.", "https://www.notion.so/my-integrations"], ["Ouvre ta page d'onboarding : menu « ··· », « Connexions », ajoute l'intégration.", null], ["Copie le lien de la page.", null]],
    champs: [{ k: "token", label: "Secret de l'intégration", type: "password" }, { k: "page", label: "Lien de la page Notion", type: "text" }] },
  { id: "slack", nom: "Slack", pourquoi: "Ghost publie le message de bienvenue dans le canal de ton choix.",
    etapes: [["Crée une application, active « Incoming Webhooks » et ajoute un webhook au canal voulu.", "https://api.slack.com/apps"], ["Copie l'adresse du webhook : elle commence par https://hooks.slack.com/.", null]],
    champs: [{ k: "webhook", label: "Adresse du webhook", type: "password" }] },
  { id: "gmail", nom: "Gmail", pourquoi: "Ghost envoie l'e-mail de bienvenue depuis ton adresse.",
    etapes: [["Active la validation en deux étapes sur ton compte Google.", "https://myaccount.google.com/security"], ["Crée un « mot de passe d'application ».", "https://myaccount.google.com/apppasswords"], ["Indique l'adresse qui reçoit l'e-mail de bienvenue (pour la démo, la tienne).", null]],
    champs: [{ k: "adresse", label: "Ton adresse Gmail", type: "text" }, { k: "mot_de_passe", label: "Mot de passe d'application", type: "password" }, { k: "destinataire", label: "Adresse du nouvel arrivant", type: "text" }] },
];
const PLATEFORMES = [
  { id: "Google", url: "https://accounts.google.com" }, { id: "Microsoft", url: "https://login.microsoftonline.com" },
  { id: "LinkedIn", url: "https://www.linkedin.com/login" }, { id: "Autre", url: "" },
];
type Compte = { id: string; nom: string; urls: string[]; champs: string[] };

// Chaque personne connecte SES comptes : ils partent du navigateur vers le coffre-fort hébergé par H, jamais conservés par Ghost.
export default function Connexions() {
  const user = useUtilisateur();
  const [etat, setEtat] = useState<Record<string, boolean>>({});
  const [valeurs, setValeurs] = useState<Record<string, Record<string, string>>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [occupe, setOccupe] = useState("");
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [plateforme, setPlateforme] = useState("Google");
  const [url, setUrl] = useState(PLATEFORMES[0].url);
  const [identifiant, setIdentifiant] = useState("");
  const [mdp, setMdp] = useState("");
  const [totp, setTotp] = useState("");
  const [suite, setSuite] = useState(false);

  useEffect(() => { setSuite(new URLSearchParams(window.location.search).has("suite")); }, []);

  const appel = useCallback(async (chemin: string, methode = "GET", corps?: object) => {
    const { data } = await getSupabase().auth.getSession();
    const r = await fetch(`${ORCH}${chemin}`, { method: methode, headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` }, body: corps ? JSON.stringify(corps) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erreur ?? `Erreur ${r.status}`);
    return j;
  }, []);

  const charger = useCallback(async () => {
    try {
      setEtat(await appel("/connecteurs"));
      setComptes((await appel("/connexions")).comptes);
    } catch { setMsg((m) => ({ ...m, general: "Le service se réveille (jusqu'à une minute). Recharge la page dans un instant." })); }
  }, [appel]);
  useEffect(() => { if (user) charger(); }, [user, charger]);

  async function connecter(app: string) {
    setOccupe(app); setMsg((m) => ({ ...m, [app]: "Vérification de l'accès…" }));
    try {
      const j = await appel("/apps", "POST", { app, valeurs: valeurs[app] ?? {} });
      setValeurs((v) => ({ ...v, [app]: {} }));
      setMsg((m) => ({ ...m, [app]: `Connecté : ${j.detail}.` }));
      await charger();
    } catch (e) { setMsg((m) => ({ ...m, [app]: e instanceof Error ? e.message : "Connexion impossible." })); }
    setOccupe("");
  }
  async function deconnecter(app: string) { await appel(`/apps/${app}`, "DELETE").catch(() => {}); await charger(); }

  async function ajouterCompte(e: React.FormEvent) {
    e.preventDefault(); setOccupe("compte");
    try {
      await appel("/connexions", "POST", { plateforme, url, identifiant, mot_de_passe: mdp, totp: totp || undefined });
      setMdp(""); setTotp(""); setIdentifiant(""); setMsg((m) => ({ ...m, compte: "Compte enregistré dans le coffre-fort." })); await charger();
    } catch (err) { setMsg((m) => ({ ...m, compte: err instanceof Error ? err.message : "Enregistrement impossible." })); }
    setOccupe("");
  }

  if (!user) return <main className="cockpit page-comptes"><p>Chargement…</p></main>;
  const n = APPS.filter((a) => etat[a.id]).length + (comptes.length ? 1 : 0);

  return (
    <main className="cockpit page-comptes">
      <header className="comptes-haut"><Link href="/portail" className="portail-marque"><Logo taille={22} /> Ghost</Link><span className="petit">{n} accès connecté{n > 1 ? "s" : ""} sur 4</span></header>
      <div className="assistant">
        <span className="etiquette">Connexions</span>
        <h1>Connecte tes outils, une fois pour toutes.</h1>
        <p>Les agents utilisent <b>tes</b> accès pour travailler à ta place. Tout est facultatif : tu peux passer cette étape et revenir plus tard.</p>
        <p className="petit">Tes accès partent directement de ton navigateur vers le coffre-fort hébergé par H. Ghost ne les garde pas et ne peut pas les relire ; les agents ne les lisent que pendant un onboarding que tu lances.</p>
        {msg.general && <p role="status" className="petit">{msg.general}</p>}

        {APPS.map((a, i) => (
          <section key={a.id} className={`appcarte ${etat[a.id] ? "connecte" : ""}`}>
            <header><span className="num">{i + 1}</span><div><h2>{a.nom}</h2><p>{a.pourquoi}</p></div>
              <span className={`etat-app ${etat[a.id] ? "oui" : ""}`}>{etat[a.id] ? "Connecté" : "Non connecté"}</span></header>
            {etat[a.id] ? (
              <p><button className="btn btn-secondary" onClick={() => deconnecter(a.id)}>Déconnecter {a.nom}</button></p>
            ) : (
              <>
                <ol className="guide">{a.etapes.map(([t, lien]) => <li key={t}>{t} {lien && <a href={lien} target="_blank" rel="noreferrer">Ouvrir</a>}</li>)}</ol>
                <form className="champs" onSubmit={(e) => { e.preventDefault(); connecter(a.id); }}>
                  {a.champs.map((c) => (
                    <label key={c.k}>{c.label}
                      <input type={c.type} required autoComplete="off" value={valeurs[a.id]?.[c.k] ?? ""} onChange={(e) => setValeurs((v) => ({ ...v, [a.id]: { ...v[a.id], [c.k]: e.target.value } }))} />
                    </label>
                  ))}
                  <button className="btn btn-primary" type="submit" disabled={occupe === a.id}>{occupe === a.id ? "Vérification…" : `Connecter ${a.nom}`}</button>
                </form>
              </>
            )}
            {msg[a.id] && <p role="status" className="petit">{msg[a.id]}</p>}
          </section>
        ))}

        <section className={`appcarte ${comptes.length ? "connecte" : ""}`}>
          <header><span className="num">4</span><div><h2>Comptes de sites (Google, etc.)</h2><p>Les agents se connectent seuls à ces sites dans leur navigateur.</p></div>
            <span className={`etat-app ${comptes.length ? "oui" : ""}`}>{comptes.length ? `${comptes.length} compte${comptes.length > 1 ? "s" : ""}` : "Aucun"}</span></header>
          <ul className="liste-comptes">
            {comptes.map((c) => (
              <li key={c.id}><span><b>{c.nom}</b><small>{c.urls[0]} · {c.champs.includes("totp") ? "avec code à usage unique" : "mot de passe"}</small></span>
                <button className="btn btn-secondary" onClick={async () => { await appel(`/connexions/${c.id}`, "DELETE").catch(() => {}); charger(); }}>Retirer</button></li>
            ))}
          </ul>
          <form className="champs" onSubmit={ajouterCompte}>
            <label>Plateforme
              <select value={plateforme} onChange={(e) => { setPlateforme(e.target.value); setUrl(PLATEFORMES.find((p) => p.id === e.target.value)?.url ?? ""); }}>
                {PLATEFORMES.map((p) => <option key={p.id}>{p.id}</option>)}
              </select>
            </label>
            <label>Adresse de connexion<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" required /></label>
            <label>Identifiant<input value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} autoComplete="off" required /></label>
            <label>Mot de passe<input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="new-password" required /></label>
            <label>Clé secrète du code à usage unique <small>(facultatif)</small><input value={totp} onChange={(e) => setTotp(e.target.value)} autoComplete="off" /></label>
            <button className="btn btn-secondary" type="submit" disabled={occupe === "compte"}>Enregistrer ce compte</button>
          </form>
          <p className="petit">Limite honnête : Google peut demander une vérification ou bloquer une connexion automatique. Utilise un compte dédié à l&apos;automatisation.</p>
          {msg.compte && <p role="status" className="petit">{msg.compte}</p>}
        </section>

        <div className="suite"><Link href="/portail" className="btn btn-primary">{suite ? "Continuer vers le portail" : "Retour au portail"}</Link></div>
      </div>
    </main>
  );
}
