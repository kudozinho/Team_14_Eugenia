import { getAdmin } from "@/lib/supabase-admin";

// Vérifie le jeton de connexion envoyé par le portail et renvoie l'utilisatrice.
export async function utilisateurDepuisRequete(req: Request) {
  const admin = getAdmin();
  if (!admin) return { admin: null, user: null };
  const jeton = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  const { data } = await admin.auth.getUser(jeton);
  return { admin, user: data.user ?? null };
}
