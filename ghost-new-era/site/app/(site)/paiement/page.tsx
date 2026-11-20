"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS } from "@/components/Plans";
import { getSupabase } from "@/lib/supabase";
import { useUtilisateur } from "@/lib/useUtilisateur";

// Écran de FAÇADE en mode démo : aucune donnée bancaire n'est demandée ni envoyée.
export default function Paiement() {
  const router = useRouter();
  const user = useUtilisateur();
  const [plan, setPlan] = useState("equipe");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function activer() {
    if (!user) return;
    setEnvoi(true);
    setErreur("");
    const { error } = await getSupabase()
      .from("abonnements")
      .insert({ user_id: user.id, plan, statut: "demo" });
    setEnvoi(false);
    if (error) { setErreur("Impossible d'enregistrer l'abonnement de démonstration : " + error.message); return; }
    router.push("/questionnaire");
  }

  if (!user) return <section className="wrap" style={{ padding: 40 }}><p>Chargement…</p></section>;

  return (
    <section className="wrap" style={{ padding: "40px", margin: 0 }}>
      <span className="eyebrow">Étape 2 sur 3</span>
      <h1 style={{ margin: "12px 0 8px" }}>Choisis ton abonnement</h1>
      <div role="note" style={{ background: "var(--ochre-50)", color: "var(--ochre-700)", border: "1px solid var(--line-2)", borderRadius: 14, padding: "12px 16px", fontWeight: 600, margin: "12px 0 24px", maxWidth: 640 }}>
        MODE DÉMO : aucun paiement réel. Ne saisis aucune donnée bancaire, elle n'est pas demandée.
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 12, maxWidth: 640 }}>
        <legend style={{ fontWeight: 600, marginBottom: 8 }}>Formule</legend>
        {PLANS.map((p) => (
          <label key={p.id} className="card" style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", borderColor: plan === p.id ? "var(--g-700)" : undefined }}>
            <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} />
            <span><b>{p.nom}</b> · {p.prix} {p.periode}<br /><span style={{ color: "var(--ink-2)" }}>{p.pour}</span></span>
          </label>
        ))}
      </fieldset>
      {erreur && <p role="alert" style={{ color: "var(--o-700)", margin: "16px 0" }}>{erreur}</p>}
      <p style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={activer} disabled={envoi}>{envoi ? "Un instant…" : "Activer l'abonnement de démonstration"}</button>
      </p>
    </section>
  );
}
