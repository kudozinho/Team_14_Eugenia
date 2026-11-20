"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase-admin";

// Toutes les actions de l'intranet RH écrivent dans Supabase côté serveur.
function admin() {
  const a = getAdmin();
  if (!a) throw new Error("Clé de service Supabase absente côté serveur.");
  return a;
}

function fini(id: string, message: string): never {
  revalidatePath(`/intranet/rh/personnes/${id}`);
  revalidatePath("/intranet/rh");
  redirect(`/intranet/rh/personnes/${id}?ok=${encodeURIComponent(message)}`);
}

export async function creerFiche(f: FormData) {
  const id = String(f.get("personne_id"));
  const manager = String(f.get("manager_id") || "");
  const { error } = await admin().from("rh_fiches").upsert({
    personne_id: id,
    poste: String(f.get("poste")),
    equipe: String(f.get("equipe")),
    manager_id: manager || null,
    date_arrivee: String(f.get("date_arrivee")) || null,
    statut_fiche: "creee",
  });
  if (error) throw new Error(error.message);
  fini(id, "Fiche créée");
}

export async function demanderAcces(f: FormData) {
  const id = String(f.get("personne_id"));
  const { error } = await admin().from("rh_acces").upsert({
    personne_id: id,
    outil: String(f.get("outil")),
    niveau: String(f.get("niveau")),
    statut: "demande",
  });
  if (error) throw new Error(error.message);
  fini(id, "Accès demandé : " + String(f.get("outil")));
}

export async function demanderBadge(f: FormData) {
  const id = String(f.get("personne_id"));
  const zones = f.getAll("zones").map(String);
  const { error } = await admin().from("rh_badges").upsert({ personne_id: id, zones, statut: "demande" });
  if (error) throw new Error(error.message);
  fini(id, "Badge demandé");
}

export async function demanderMateriel(f: FormData) {
  const id = String(f.get("personne_id"));
  const { error } = await admin().from("rh_materiel").insert({
    personne_id: id,
    article: String(f.get("article")),
    statut: "a_valider",
  });
  if (error) throw new Error(error.message);
  fini(id, "Matériel en attente de validation");
}

// Irréversible : réservé à un humain.
export async function validerMateriel(f: FormData) {
  const id = String(f.get("personne_id"));
  const { error } = await admin().from("rh_materiel").update({ statut: "valide" }).eq("id", String(f.get("materiel_id")));
  if (error) throw new Error(error.message);
  fini(id, "Commande validée");
}
