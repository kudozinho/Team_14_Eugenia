"use client";

import { useEffect, useState } from "react";

type Etape = { image: number; outil: string | null; x: number | null; y: number | null; element: string | null; texte: string | null; raison: string };
type Etat = { images: number; derniere: number; url: string | null; titre: string | null; termine: boolean; etapes: Etape[] };

const ORCH = process.env.NEXT_PUBLIC_ORCH_URL ?? "";
const VERBE: Record<string, string> = { click_web: "clique sur", select_option: "choisit dans", type_web: "écrit dans", scroll_web: "fait défiler", goto: "ouvre" };
const phrase = (e: Etape) => {
  if (e.outil === "answer") return "a terminé, il donne sa réponse";
  if (e.outil === "scroll_web" && !e.element) return "fait défiler la page";
  return `${VERBE[e.outil ?? ""] ?? e.outil ?? "agit"} ${e.element ? `« ${e.element} »` : e.texte ?? ""}`.trim();
};

// L'écran de l'agent H en direct : sa dernière capture, et un point rouge là où il clique.
export default function VueAgent({ session, agent, actif }: { session: string; agent: string; actif: boolean }) {
  const [etat, setEtat] = useState<Etat | null>(null);
  const [panne, setPanne] = useState(false);

  useEffect(() => {
    if (!ORCH || !session) return;
    let vivant = true;
    const lire = async () => {
      try {
        const r = await fetch(`${ORCH}/agent/${session}`);
        if (!r.ok) throw new Error(String(r.status));
        if (vivant) { setEtat(await r.json()); setPanne(false); }
      } catch { if (vivant) setPanne(true); }
    };
    lire();
    const m = setInterval(lire, actif ? 2000 : 8000);
    return () => { vivant = false; clearInterval(m); };
  }, [session, actif]);

  const dernier = etat?.etapes.filter((e) => e.image === etat.derniere && e.x != null && e.y != null).at(-1)
    ?? etat?.etapes.filter((e) => e.x != null && e.y != null).at(-1);
  const recentes = etat?.etapes.slice(-3).reverse() ?? [];

  return (
    <article className="vue-agent" aria-label={`Écran de l'agent ${agent}`}>
      <header>
        <b>Agent {agent}</b>
        <span className={actif ? "pastille-live" : "pastille-fin"}>{actif ? "● en direct" : "terminé"}</span>
      </header>
      <div className="vue-ecran">
        {etat && etat.derniere >= 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ORCH}/agent/${session}/image/${etat.derniere}`} alt={`Écran de l'agent ${agent}`} />
            {dernier && <span className="pointeur" style={{ left: `${(dernier.x ?? 0) * 100}%`, top: `${(dernier.y ?? 0) * 100}%` }} aria-hidden="true" />}
          </>
        ) : (
          <p className="petit">{panne ? "Connexion à l'agent… (le service peut mettre une minute à se réveiller)" : "L'agent démarre son navigateur…"}</p>
        )}
      </div>
      {etat?.titre && <p className="petit adresse" title={etat.url ?? ""}>{etat.titre}</p>}
      <ul className="actions-agent" aria-label={`Dernières actions de l'agent ${agent}`}>
        {recentes.map((e, i) => <li key={`${e.image}-${i}`} className={i === 0 ? "recente" : ""}>{phrase(e)}</li>)}
        {recentes.length === 0 && <li>En attente de la première action…</li>}
      </ul>
    </article>
  );
}
