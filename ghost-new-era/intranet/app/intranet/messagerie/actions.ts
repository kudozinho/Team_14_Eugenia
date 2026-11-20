"use server";
// Actions de la messagerie : chaque action écrit dans Supabase côté serveur, puis renvoie vers une page avec un message de confirmation stable.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServeur, texte } from "../_commun/serveur";

function retour(chemin: string, cle: "ok" | "erreur", message: string): never {
  redirect(`${chemin}?${cle}=${encodeURIComponent(message)}`);
}

export async function publierMessage(form: FormData) {
  const canal = texte(form, "canal", 40);
  const auteur = texte(form, "auteur", 80) || "Ghost, pour Sophie Durand";
  const contenu = texte(form, "texte", 2000);
  const chemin = `/intranet/messagerie/${canal}`;
  if (!canal || !contenu) retour(chemin, "erreur", "le message est vide.");
  const { error } = await supabaseServeur().from("msg_messages").insert({ canal_id: canal, auteur, texte: contenu });
  if (error) retour(chemin, "erreur", error.message);
  revalidatePath(chemin);
  retour(chemin, "ok", "Message publié dans le canal.");
}

export async function demanderParrain(form: FormData) {
  const personne = texte(form, "personne_id", 80);
  const destinataire = texte(form, "destinataire_id", 80);
  const chemin = "/intranet/messagerie/demandes";
  if (!personne || !destinataire) retour(chemin, "erreur", "choisis la personne qui arrive et le destinataire de la demande.");
  const { error } = await supabaseServeur()
    .from("msg_demandes")
    .insert({ type: "parrain", personne_id: personne, destinataire_id: destinataire, statut: "envoyee" });
  if (error) retour(chemin, "erreur", error.message);
  revalidatePath(chemin);
  retour(chemin, "ok", "Demande de parrain envoyée.");
}

export async function proposerCafe(form: FormData) {
  const personne = texte(form, "personne_id", 80);
  const destinataire = texte(form, "destinataire_id", 80);
  const creneau = texte(form, "creneau", 40);
  const chemin = "/intranet/messagerie/demandes";
  if (!personne || !creneau) retour(chemin, "erreur", "choisis la personne qui arrive et un créneau.");
  const date = new Date(`${creneau}:00+01:00`);
  if (Number.isNaN(date.getTime())) retour(chemin, "erreur", "créneau invalide.");
  const { error } = await supabaseServeur().from("msg_demandes").insert({
    type: "cafe",
    personne_id: personne,
    destinataire_id: destinataire || null,
    statut: "envoyee",
    creneau: date.toISOString(),
  });
  if (error) retour(chemin, "erreur", error.message);
  revalidatePath(chemin);
  retour(chemin, "ok", "Café d'accueil proposé.");
}
