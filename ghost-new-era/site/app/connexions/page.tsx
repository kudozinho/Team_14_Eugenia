"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { getSupabase } from "@/lib/supabase";
import { useUtilisateur } from "@/lib/useUtilisateur";

const ORCH = process.env.NEXT_PUBLIC_ORCH_URL ?? "";
const PLATEFORMES = [
  { id: "Google", url: "https://accounts.google.com" },
  { id: "Slack", url: "https://slack.com/signin" },
  { id: "Notion", url: "https://www.notion.so/login" },
  { id: "Microsoft", url: "https://login.microsoftonline.com" },
  { id: "Autre", url: "" },
];
type Compte = { id: string; nom: string; urls: string[]; champs: string[] };

// Comptes connectés : les identifiants partent directement vers le coffre-fort hébergé par H (jamais conservés par Ghost).
export default function Comptes() {
  const user = useUtilisateur();
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [plateforme, setPlateforme] = useState("Google");
  const [url, setUrl] = useState(PLATEFORMES[0].url);
  const [identifiant, setIdentifiant] = useState("");
  const [mdp, setMdp] = useState("");
  const [totp, setTotp] = useState("");
  const [etat, setEtat] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const appel = useCallback(async (chemin: string, methode = "GET", corps?: object) => {
    const { data } = await getSupabase().auth.getSession();
    const r = await fetch(`${ORCH}${chemin}`, {
      method: methode,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
      body: corps ? JSON.stringify(corps) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erreur ?? `Erreur ${r.status}`);
    return j;
  }, []);

  const charger = useCallback(async () => {
    try { setComptes((await appel("/connexions")).comptes); } catch { setEtat("Le service des agents se réveille (jusqu'à une minute). Recharge la page dans un instant."); }
  }, [appel]);

  useEffect(() => { if (user) charger(); }, [user, charger]);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true); setEtat("");
    try {
      await appel("/connexions", "POST", { plateforme, url, identifiant, mot_de_passe: mdp, totp: totp || undefined });
      setMdp(""); setTotp(""); setIdentifiant("");
      setEtat("Compte enregistré dans le coffre-fort. Les agents s'en serviront pour se connecter seuls.");
      await charger();
    } catch (err) { setEtat(err instanceof Error ? err.message : "Enregistrement impossible."); }
    setEnvoi(false);
  }

  async function retirer(id: string) {
    try { await appel(`/connexions/${id}`, "DELETE"); await charger(); } catch { setEtat("Suppression impossible."); }
  }

  if (!user) return <main className="cockpit page-comptes"><p>Chargement…</p></main>;

  return (
    <main className="cockpit page-comptes">
      <header className="comptes-haut"><Link href="/portail" className="portail-marque"><Logo taille={22} /> Ghost</Link><Link href="/portail" className="lien-fleche">Retour au portail</Link></header>
      <div className="comptes-grille">
        <section>
          <span className="etiquette">Comptes connectés</span>
          <h1>Tes agents se connectent seuls.</h1>
          <p>Enregistre un compte une fois : les agents s&apos;en servent pour ouvrir une session à ta place, sans que tu aies à te connecter à chaque fois.</p>
          <ul className="garanties">
            <li><b>Coffre-fort hébergé par H.</b> Les identifiants partent directement de ton navigateur vers le coffre-fort de H. Ghost ne les garde pas et ne peut pas les relire.</li>
            <li><b>Tu restes maître.</b> Tu retires un compte quand tu veux ; l&apos;agent n&apos;a accès qu&apos;aux comptes enregistrés ici.</li>
            <li><b>Double authentification.</b> Tu peux ajouter la clé secrète du code à usage unique : le coffre-fort génère le code au moment de la connexion.</li>
          </ul>
          <p className="petit">Limite honnête : certains sites (Google en particulier) peuvent demander une vérification supplémentaire ou bloquer une connexion automatique. Utilise de préférence un compte dédié à l&apos;automatisation. Non testé de bout en bout sur ces sites.</p>

          <h2 style={{ marginTop: 28 }}>Comptes enregistrés</h2>
          {comptes.length === 0 && <p className="petit">Aucun compte pour l&apos;instant.</p>}
          <ul className="liste-comptes">
            {comptes.map((c) => (
              <li key={c.id}>
                <span><b>{c.nom}</b><small>{c.urls[0]} · {c.champs.includes("totp") ? "avec code à usage unique" : "mot de passe"}</small></span>
                <button className="btn btn-secondary" onClick={() => retirer(c.id)}>Retirer</button>
              </li>
            ))}
          </ul>
        </section>

        <form onSubmit={ajouter} className="carte-compte">
          <h2>Ajouter un compte</h2>
          <label>Plateforme
            <select value={plateforme} onChange={(e) => { setPlateforme(e.target.value); setUrl(PLATEFORMES.find((p) => p.id === e.target.value)?.url ?? ""); }}>
              {PLATEFORMES.map((p) => <option key={p.id}>{p.id}</option>)}
            </select>
          </label>
          <label>Adresse de connexion<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" required /></label>
          <label>Identifiant<input value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} autoComplete="off" required /></label>
          <label>Mot de passe<input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="new-password" required /></label>
          <label>Clé secrète du code à usage unique <small>(facultatif)</small><input value={totp} onChange={(e) => setTotp(e.target.value)} autoComplete="off" /></label>
          {etat && <p role="status" className="petit">{etat}</p>}
          <button className="btn btn-primary" type="submit" disabled={envoi}>{envoi ? "Enregistrement…" : "Enregistrer dans le coffre-fort"}</button>
        </form>
      </div>
    </main>
  );
}
