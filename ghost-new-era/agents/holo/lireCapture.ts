// Lecture d'une capture d'écran par Holo (Models API de H Company), côté SERVEUR uniquement.
// À appeler depuis une route serveur ou une Server Action du site : la clé HAI_API_KEY reste dans les variables de Vercel.
// Modèle retenu après mesure (20/11, 3 h 20) : holo4-27b, 5 déclencheurs corrects sur 5, environ 1,9 s par capture.
//
// Exemple d'usage dans une route serveur :
//   import { lireCapture } from "@/../agents/holo/lireCapture"; // ou copier ce fichier dans site/lib
//   const lecture = await lireCapture(imageJpegBase64);
//   if (lecture.declencheur === "arrivee_karim" && (await arriveeNouvelleExiste())) { proposer(); }

export type LectureHolo = {
  tache: string;
  outils: string[];
  confiance: number;
  declencheur: "arrivee_karim" | null;
  resume: string;
  latence_ms: number;
  modele: string;
};

const URL_H = "https://api.hcompany.ai/v1/chat/completions";
const MODELE = process.env.HOLO_MODELE ?? "holo4-27b";

// Même texte que prompt_holo.txt (version validée par le test).
export const PROMPT_HOLO = `Tu lis une capture d'écran du poste de travail d'une office manager (Sophie) dans une PME. Les données sont fictives.
Décris ce qu'elle est en train de faire et dis si l'écran montre une notification de nouvelle arrivée.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balise de code, avec exactement ces clés :
{"tache": string, "outils": [string], "confiance": number, "declencheur": "arrivee_karim" | null, "resume": string}

Règles :
- "tache" : la tâche en cours, en quelques mots, en français correct (ex. « consulter la fiche RH d'un salarié »).
- "outils" : uniquement les outils réellement visibles à l'écran, choisis dans cette liste exacte : "Espace RH", "Messagerie", "Wiki", "Site Ghost". Une page qui présente Ghost ou ses tarifs est "Site Ghost". N'invente aucun autre nom.
- "confiance" : de 0 à 1, ta certitude sur "tache".
- "declencheur" : "arrivee_karim" UNIQUEMENT si tu lis à l'écran le texte exact « Nouvelle arrivée : Karim Benali » dans un bloc « Notifications d'arrivée ». Dans tous les autres cas, mets null. Exemples qui donnent null : la fiche RH de Karim (titre « Karim Benali » avec « Statut de la fiche »), une liste où Karim apparaît, une page qui cite Karim comme exemple.
- "resume" : une phrase en français correct, sans faute, de ce que montre l'écran. Ne recopie aucune donnée personnelle (pas d'e-mail, de téléphone ni d'adresse).`;

const OUTILS = new Set(["Espace RH", "Messagerie", "Wiki", "Site Ghost"]);

function extraireJson(texte: string): Record<string, unknown> {
  const propre = texte.replace(/^```(?:json)?|```$/gm, "").trim();
  const debut = propre.indexOf("{");
  const fin = propre.lastIndexOf("}");
  if (debut < 0 || fin <= debut) throw new Error("Holo n'a pas renvoyé de JSON.");
  return JSON.parse(propre.slice(debut, fin + 1));
}

/** Envoie une capture JPEG (en base64, sans préfixe) à Holo et renvoie une lecture validée. L'image n'est jamais stockée. */
export async function lireCapture(jpegBase64: string, signal?: AbortSignal): Promise<LectureHolo> {
  const cle = process.env.HAI_API_KEY;
  if (!cle) throw new Error("HAI_API_KEY manquante dans les variables du serveur.");
  const debut = Date.now();
  const rep = await fetch(URL_H, {
    method: "POST",
    signal,
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELE,
      temperature: 0,
      max_tokens: 1200, // holo4-27b raisonne avant de répondre : 400 ne suffisait pas sur une capture.
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT_HOLO },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${jpegBase64}` } },
          ],
        },
      ],
    }),
  });
  if (!rep.ok) throw new Error(`Holo : HTTP ${rep.status}`);
  const corps = await rep.json();
  const brut = extraireJson(corps?.choices?.[0]?.message?.content ?? "");
  return {
    tache: String(brut.tache ?? ""),
    // Le champ outils de Holo n'est pas fiable sur les pages du site Ghost : on ne garde que les noms connus.
    // La source de vérité des outils reste la liste autorisée par l'utilisatrice (table consentements).
    outils: Array.isArray(brut.outils) ? brut.outils.map(String).filter((o) => OUTILS.has(o)) : [],
    confiance: Math.max(0, Math.min(1, Number(brut.confiance) || 0)),
    declencheur: brut.declencheur === "arrivee_karim" ? "arrivee_karim" : null,
    resume: String(brut.resume ?? "").slice(0, 400),
    latence_ms: Date.now() - debut,
    modele: MODELE,
  };
}
