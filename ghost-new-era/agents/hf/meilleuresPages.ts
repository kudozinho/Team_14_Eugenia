// Classement des pages du wiki selon le poste d'un nouvel arrivant, par embeddings Hugging Face. Côté SERVEUR uniquement.
// Utilisé par l'Agent Docs pour choisir les documents de la page « Bienvenue <prénom> ».
// Mesuré le 20/11 (3 h 45) : granite-embedding-97m-multilingual-r2, 5 pages justes sur 5 pour un commercial, 4 sur 5 pour une
// développeuse (la 5e est « Sécurité informatique », une page pour tous), environ 4,8 s pour 15 pages.
//
// Variables serveur : HF_TOKEN (jeton Hugging Face, droit « Inference » seulement), NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Repli si Hugging Face ne répond pas : classement par l'étiquette role_cible, signalé par source = "repli_role_cible".

import { createClient } from "@supabase/supabase-js";

const MODELE = process.env.HF_EMBEDDINGS_MODELE ?? "ibm-granite/granite-embedding-97m-multilingual-r2";
const URL_HF = `https://router.huggingface.co/hf-inference/models/${MODELE}/pipeline/feature-extraction`;

export type PageClassee = { id: string; titre: string; espace: string; role_cible: string | null; score: number };
export type Classement = { pages: PageClassee[]; source: "huggingface" | "repli_role_cible"; modele: string; latence_ms: number };

type Page = { id: string; titre: string; espace: string; role_cible: string | null; tags: string[] | null; contenu: string };

function supabaseServeur() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) throw new Error("Variables Supabase serveur manquantes.");
  return createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function embeddings(textes: string[]): Promise<number[][]> {
  const jeton = process.env.HF_TOKEN;
  if (!jeton) throw new Error("HF_TOKEN manquant dans les variables du serveur.");
  const rep = await fetch(URL_HF, {
    method: "POST",
    headers: { Authorization: `Bearer ${jeton}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: textes }),
  });
  if (!rep.ok) throw new Error(`Hugging Face : HTTP ${rep.status}`);
  const vecs = (await rep.json()) as (number[] | number[][])[];
  // Certains modèles renvoient un vecteur par mot : on fait la moyenne.
  return vecs.map((v) =>
    Array.isArray(v[0]) ? (v as number[][])[0].map((_, i) => (v as number[][]).reduce((s, l) => s + l[i], 0) / v.length) : (v as number[]),
  );
}

function cosinus(a: number[], b: number[]) {
  let p = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { p += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return p / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

/** Les meilleures pages du wiki pour un poste (ex. « Commercial »), à partir de l'équipe et des outils du catalogue d'accès. */
export async function meilleuresPages(poste: string, equipe: string, combien = 5): Promise<Classement> {
  const debut = Date.now();
  const db = supabaseServeur();
  const [{ data: pages, error: e1 }, { data: acces, error: e2 }] = await Promise.all([
    db.from("wiki_pages").select("id, titre, espace, role_cible, tags, contenu"),
    db.from("catalogue_acces").select("outil").eq("poste", poste),
  ]);
  if (e1 || e2) throw new Error((e1 ?? e2)!.message);
  // Les pages « Bienvenue … » sont des pages personnelles : on ne les recommande pas.
  const candidates = ((pages ?? []) as Page[]).filter((p) => !/^bienvenue/i.test(p.titre));
  const outils = (acces ?? []).map((a) => a.outil).join(", ");
  const requete = `Documents de l'espace ${equipe} pour un nouveau ${poste.toLowerCase()} : son équipe ${equipe}, ses outils de travail (${outils}) et ses méthodes.`;

  try {
    const textes = candidates.map((p) => `Espace ${p.espace}. ${p.titre}. Mots-clés : ${(p.tags ?? []).join(", ")}. ${p.contenu}`);
    const [q, ...docs] = await embeddings([requete, ...textes]);
    const classees = candidates
      .map((p, i) => ({ id: p.id, titre: p.titre, espace: p.espace, role_cible: p.role_cible, score: Math.round(cosinus(q, docs[i]) * 1000) / 1000 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, combien);
    return { pages: classees, source: "huggingface", modele: MODELE, latence_ms: Date.now() - debut };
  } catch {
    // Repli honnête : les pages étiquetées pour ce poste, puis les pages pour tous.
    const repli = [
      ...candidates.filter((p) => p.role_cible === poste),
      ...candidates.filter((p) => p.role_cible === "Tous"),
    ]
      .slice(0, combien)
      .map((p) => ({ id: p.id, titre: p.titre, espace: p.espace, role_cible: p.role_cible, score: 0 }));
    return { pages: repli, source: "repli_role_cible", modele: MODELE, latence_ms: Date.now() - debut };
  }
}
