"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function AuthForm({ mode }: { mode: "connexion" | "inscription" }) {
  const router = useRouter();
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const inscription = mode === "inscription";

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setInfo("");
    setEnvoi(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    try {
      const supabase = getSupabase();
      if (inscription) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { prenom: String(f.get("prenom")), nom: String(f.get("nom")) } },
        });
        if (error) throw error;
        if (data.session) router.push("/paiement");
        else setInfo("Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/portail");
      }
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="card" style={{ maxWidth: 480 }}>
      {inscription && (
        <>
          <div className="field"><label htmlFor="prenom">Prénom</label><input id="prenom" name="prenom" required autoComplete="given-name" /></div>
          <div className="field"><label htmlFor="nom">Nom</label><input id="nom" name="nom" required autoComplete="family-name" /></div>
        </>
      )}
      <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      <div className="field">
        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete={inscription ? "new-password" : "current-password"} />
      </div>
      {erreur && <p role="alert" style={{ color: "var(--o-700)", marginBottom: 12 }}>{erreur}</p>}
      {info && <p role="status" style={{ color: "var(--g-700)", marginBottom: 12 }}>{info}</p>}
      <button className="btn btn-primary" type="submit" disabled={envoi}>
        {envoi ? "Un instant…" : inscription ? "Créer mon compte" : "Se connecter"}
      </button>
      <p style={{ marginTop: 16 }}>
        {inscription ? <>Déjà un compte ? <Link href="/connexion">Se connecter</Link></> : <>Pas encore de compte ? <Link href="/inscription">Créer un compte</Link></>}
      </p>
    </form>
  );
}
