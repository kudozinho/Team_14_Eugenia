"use server";
// Actions du wiki : créer une page, ajouter une ligne de checklist, cocher ou décocher une ligne.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServeur, texte } from "../_commun/serveur";

function retour(chemin: string, cle: "ok" | "erreur", message: string): never {
  const sep = chemin.includes("?") ? "&" : "?";
  redirect(`${chemin}${sep}${cle}=${encodeURIComponent(message)}`);
}

const PERIODES = ["jour1", "semaine1", "mois1"];

export async function creerPage(form: FormData) {
  const titre = texte(form, "titre", 160);
  const espace = texte(form, "espace", 60) || "Accueil";
  const role = texte(form, "role_cible", 60) || null;
  const auteur = texte(form, "cree_par", 80) || "Ghost, pour Sophie Durand";
  const contenu = texte(form, "contenu", 8000);
  const tags = texte(form, "tags", 300)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!titre) retour("/intranet/wiki/nouvelle", "erreur", "le titre est obligatoire.");
  const { data, error } = await supabaseServeur()
    .from("wiki_pages")
    .insert({ titre, espace, role_cible: role, tags, contenu, cree_par: auteur })
    .select("id")
    .single();
  if (error || !data) retour("/intranet/wiki/nouvelle", "erreur", error?.message ?? "création impossible.");
  revalidatePath("/intranet/wiki");
  retour(`/intranet/wiki/page/${data.id}`, "ok", "Page créée.");
}

export async function ajouterLigne(form: FormData) {
  const personne = texte(form, "personne_id", 80);
  const periode = texte(form, "periode", 20);
  const libelle = texte(form, "libelle", 300);
  const chemin = `/intranet/wiki/checklists?personne=${encodeURIComponent(personne)}`;
  if (!personne || !PERIODES.includes(periode) || !libelle) retour(chemin, "erreur", "choisis une personne, une période et un libellé.");
  const { error } = await supabaseServeur().from("wiki_checklists").insert({ personne_id: personne, periode, libelle, coche: false });
  if (error) retour(chemin, "erreur", error.message);
  revalidatePath("/intranet/wiki/checklists");
  retour(chemin, "ok", "Ligne ajoutée à la checklist.");
}

export async function basculerLigne(form: FormData) {
  const id = texte(form, "id", 80);
  const personne = texte(form, "personne_id", 80);
  const coche = texte(form, "coche", 5) === "oui";
  const chemin = `/intranet/wiki/checklists?personne=${encodeURIComponent(personne)}`;
  const { error } = await supabaseServeur().from("wiki_checklists").update({ coche }).eq("id", id);
  if (error) retour(chemin, "erreur", error.message);
  revalidatePath("/intranet/wiki/checklists");
  retour(chemin, "ok", coche ? "Ligne cochée." : "Ligne décochée.");
}
