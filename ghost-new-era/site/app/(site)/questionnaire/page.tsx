"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useUtilisateur } from "@/lib/useUtilisateur";

const OUTILS = ["Messagerie", "Logiciel RH", "Wiki"];

export default function Questionnaire() {
  const router = useRouter();
  const user = useUtilisateur();
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setEnvoi(true);
    setErreur("");
    const f = new FormData(e.currentTarget);
    const { error } = await getSupabase().from("profils").upsert({
      user_id: user.id,
      prenom: String(user.user_metadata?.prenom ?? ""),
      nom: String(user.user_metadata?.nom ?? ""),
      role: String(f.get("role")),
      secteur: String(f.get("secteur")),
      taille_entreprise: String(f.get("taille")),
      onboardings_par_an: Number(f.get("onboardings")),
      recrutements_par_an: Number(f.get("recrutements")),
      departs_par_an: Number(f.get("departs")),
      outils_utilises: f.getAll("utilises").map(String),
      outils_interdits: f.getAll("interdits").map(String),
    });
    setEnvoi(false);
    if (error) { setErreur("Impossible d'enregistrer tes réponses : " + error.message); return; }
    router.push("/portail");
  }

  if (!user) return <section className="wrap" style={{ padding: 40 }}><p>Chargement…</p></section>;

  const nombre = (id: string, label: string) => (
    <div className="field"><label htmlFor={id}>{label}</label><input id={id} name={id === "taille" ? "taille" : id} type="number" min={0} required /></div>
  );

  return (
    <section className="wrap" style={{ padding: "40px", margin: 0 }}>
      <span className="eyebrow">Étape 3 sur 3</span>
      <h1 style={{ margin: "12px 0 8px" }}>Parle-nous de ton travail</h1>
      <p style={{ marginBottom: 24 }}>Ces réponses donnent le contexte à Ghost. Aucune donnée sur des personnes.</p>
      <form onSubmit={soumettre} className="card" style={{ maxWidth: 560 }}>
        <div className="field"><label htmlFor="role">Ton rôle</label><input id="role" name="role" required placeholder="Office manager, RH…" /></div>
        <div className="field"><label htmlFor="secteur">Secteur de l'entreprise</label><input id="secteur" name="secteur" required /></div>
        {nombre("taille", "Taille de l'entreprise (nombre de personnes)")}
        {nombre("onboardings", "Onboardings par an")}
        {nombre("recrutements", "Recrutements par an")}
        {nombre("departs", "Départs par an")}
        <fieldset style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
          <legend style={{ fontWeight: 600, marginBottom: 6 }}>Outils que tu utilises</legend>
          {OUTILS.map((o) => <label key={o} style={{ display: "block" }}><input type="checkbox" name="utilises" value={o} /> {o}</label>)}
        </fieldset>
        <fieldset style={{ border: 0, padding: 0, margin: "0 0 16px" }}>
          <legend style={{ fontWeight: 600, marginBottom: 6 }}>Outils que Ghost n'a pas le droit d'utiliser</legend>
          {OUTILS.map((o) => <label key={o} style={{ display: "block" }}><input type="checkbox" name="interdits" value={o} /> {o}</label>)}
        </fieldset>
        {erreur && <p role="alert" style={{ color: "var(--o-700)", marginBottom: 12 }}>{erreur}</p>}
        <button className="btn btn-primary" type="submit" disabled={envoi}>{envoi ? "Un instant…" : "Terminer"}</button>
      </form>
    </section>
  );
}
