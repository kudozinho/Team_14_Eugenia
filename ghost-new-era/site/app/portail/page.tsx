"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function Portail() {
  const router = useRouter();
  const [prenom, setPrenom] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/connexion");
      else setPrenom(String(data.user.user_metadata?.prenom ?? ""));
    });
  }, [router]);

  async function deconnecter() {
    await getSupabase().auth.signOut();
    router.push("/");
  }

  if (prenom === null) return <main className="wrap" style={{ padding: 40 }}><p>Chargement…</p></main>;

  return (
    <main className="wrap" style={{ padding: "40px" }}>
      <span className="eyebrow">Portail Ghost</span>
      <h1 style={{ margin: "12px 0" }}>Hello {prenom || "toi"}, prête à démarrer ?</h1>
      <p>Le portail (accord par outil, pastille, proposition, suivi) sera construit ici.</p>
      <p style={{ marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={deconnecter}>Se déconnecter</button>
      </p>
    </main>
  );
}
