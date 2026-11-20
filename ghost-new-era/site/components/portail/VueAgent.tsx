"use client";

import { useEffect, useState } from "react";
import Fantome from "@/components/portail/Fantome";
import { agentInfo } from "@/lib/agents";

type Etape = { image: number; outil: string | null; x: number | null; y: number | null; element: string | null; texte: string | null; raison: string };
type Etat = { images: number; derniere: number; url: string | null; titre: string | null; termine: boolean; etapes: Etape[] };

const ORCH = process.env.NEXT_PUBLIC_ORCH_URL ?? "";
const VERBE: Record<string, string> = { click_web: "clique sur", select_option: "choisit dans", type_web: "écrit dans", scroll_web: "fait défiler", write: "écrit dans", goto: "ouvre" };
const phrase = (e: Etape) => {
  if (e.outil === "answer") return "a terminé, il donne sa réponse";
  if (e.outil === "scroll_web" && !e.element) return "fait défiler la page";
  return `${VERBE[e.outil ?? ""] ?? e.outil ?? "agit"} ${e.element ? `« ${e.element} »` : e.texte ?? ""}`.trim();
};

// L'écran de l'agent H en direct : sa dernière capture, et un point rouge là où il clique.
export default function VueAgent({ session, agent, actif, grand = false }: { session: string; agent: string; actif: boolean; grand?: boolean }) {
  const info = agentInfo(agent);
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
  const recentes = etat?.etapes.slice(grand ? -5 : -3).reverse() ?? [];

  return (
    <article className={grand ? "vue-agent grand" : "vue-agent"} aria-label={`Écran de ${info.prenom}, agent ${info.role}`} style={{ ["--c" as string]: info.couleur }}>
      <header>
        <span className="agent-id"><Fantome couleur={info.couleur} taille={30} actif={actif} /><b>{info.prenom}</b><small>agent {info.role}</small></span>
        <span className={actif ? "pastille-live" : "pastille-fin"}>{actif ? "● au travail" : "✓ terminé"}</span>
      </header>
      <div className="vue-ecran">
        {etat && etat.derniere >= 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ORCH}/agent/${session}/image/${etat.derniere}`} alt={`Écran de ${info.prenom}`} />
            {dernier && (
              <span className="curseur" key="curseur" style={{ left: `${(dernier.x ?? 0) * 100}%`, top: `${(dernier.y ?? 0) * 100}%` }} aria-hidden="true">
                <span className="onde" /><Fantome couleur={info.couleur} taille={34} actif={actif} /><em>{info.prenom}</em>
              </span>
            )}
          </>
        ) : (
          <p className="petit">{panne ? "Connexion à l'agent… (le service peut mettre une minute à se réveiller)" : "L'agent démarre son navigateur…"}</p>
        )}
      </div>
      {etat?.titre && <p className="petit adresse" title={etat.url ?? ""}>{etat.titre}</p>}
      <ul className="actions-agent" aria-label={`Dernières actions de ${info.prenom}`}>
        {recentes.map((e, i) => <li key={`${e.image}-${i}`} className={i === 0 ? "recente" : ""}>{phrase(e)}</li>)}
        {recentes.length === 0 && <li>En attente de la première action…</li>}
      </ul>
    </article>
  );
}
