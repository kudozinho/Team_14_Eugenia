import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Accès à la table annonces_portails (schéma commun, non modifié).
// Sans variables Supabase : mode local en mémoire, pour travailler avant le branchement de mardi midi.

export type Annonce = {
  id: string;
  portail: string;
  titre: string | null;
  prix: number | null;
  surface_m2: number | null;
  ville: string | null;
  description: string | null;
  cree_le: string;
};

export type NouvelleAnnonce = Omit<Annonce, 'id' | 'cree_le'>;

export const BUCKET_PHOTOS = 'photos-annonces';

let client: SupabaseClient | null = null;
function sb(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const modeLocal = () => sb() === null;

// Mémoire du mode local (survit aux rechargements à chaud de `next dev`).
const g = globalThis as unknown as { __annonces?: Annonce[]; __photos?: Set<string> };
const memoire = (g.__annonces ??= []);
const photosMemoire = (g.__photos ??= new Set<string>());

export async function creerAnnonce(a: NouvelleAnnonce, id: string = crypto.randomUUID()): Promise<Annonce> {
  const db = sb();
  if (!db) {
    const ligne: Annonce = { ...a, id, cree_le: new Date().toISOString() };
    memoire.unshift(ligne);
    return ligne;
  }
  const { data, error } = await db.from('annonces_portails').insert({ id, ...a }).select().single();
  if (error) throw new Error(`Supabase : ${error.message}`);
  return data as Annonce;
}

export async function listerAnnonces(portail: string): Promise<Annonce[]> {
  const db = sb();
  if (!db) return memoire.filter((x) => x.portail === portail);
  const { data, error } = await db
    .from('annonces_portails')
    .select('*')
    .eq('portail', portail)
    .order('cree_le', { ascending: false })
    .limit(200);
  if (error) throw new Error(`Supabase : ${error.message}`);
  return (data ?? []) as Annonce[];
}

export async function lireAnnonce(portail: string, id: string): Promise<Annonce | null> {
  const db = sb();
  if (!db) return memoire.find((x) => x.id === id && x.portail === portail) ?? null;
  const { data, error } = await db.from('annonces_portails').select('*').eq('id', id).eq('portail', portail).maybeSingle();
  if (error) throw new Error(`Supabase : ${error.message}`);
  return (data as Annonce) ?? null;
}

export async function viderPortail(portail: string): Promise<number> {
  const db = sb();
  if (!db) {
    const avant = memoire.length;
    for (let i = memoire.length - 1; i >= 0; i--) if (memoire[i].portail === portail) memoire.splice(i, 1);
    photosMemoire.clear();
    return avant - memoire.length;
  }
  const { data, error } = await db.from('annonces_portails').delete().eq('portail', portail).select('id');
  if (error) throw new Error(`Supabase : ${error.message}`);
  const ids = (data ?? []).map((r: { id: string }) => r.id);
  // Photos du site C : une photo par annonce, rangée sous <id>/photo.<ext>
  for (const id of ids) {
    const { data: f } = await db.storage.from(BUCKET_PHOTOS).list(id);
    if (f?.length) await db.storage.from(BUCKET_PHOTOS).remove(f.map((o) => `${id}/${o.name}`));
  }
  return ids.length;
}

// --- Photos (site C). Le schéma commun n'a pas de colonne photo : on range le fichier
// dans le bucket Storage `photos-annonces` sous le dossier <id de l'annonce>.
export async function enregistrerPhoto(id: string, fichier: File): Promise<string> {
  const ext = (fichier.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const chemin = `${id}/photo.${ext}`;
  const db = sb();
  if (!db) {
    photosMemoire.add(id);
    return chemin;
  }
  const { error } = await db.storage
    .from(BUCKET_PHOTOS)
    .upload(chemin, await fichier.arrayBuffer(), { contentType: fichier.type || 'image/jpeg', upsert: true });
  if (error) throw new Error(`Stockage photo : ${error.message}`);
  return chemin;
}

export async function aUnePhoto(id: string): Promise<boolean> {
  const db = sb();
  if (!db) return photosMemoire.has(id);
  const { data } = await db.storage.from(BUCKET_PHOTOS).list(id);
  return !!data?.length;
}

export async function urlPhoto(id: string): Promise<string | null> {
  const db = sb();
  if (!db) return null;
  const { data } = await db.storage.from(BUCKET_PHOTOS).list(id);
  if (!data?.length) return null;
  const { data: s } = await db.storage.from(BUCKET_PHOTOS).createSignedUrl(`${id}/${data[0].name}`, 3600);
  return s?.signedUrl ?? null;
}

// Adresses signées des photos (site C), pour les vignettes de la page « Annonces publiées ».
export async function urlsPhotos(ids: string[]): Promise<Record<string, string>> {
  const db = sb();
  if (!db || !ids.length) return {};
  const paires = await Promise.all(
    ids.map(async (id) => {
      const { data } = await db.storage.from(BUCKET_PHOTOS).list(id);
      if (!data?.length) return null;
      const { data: s } = await db.storage.from(BUCKET_PHOTOS).createSignedUrl(`${id}/${data[0].name}`, 3600);
      return s?.signedUrl ? ([id, s.signedUrl] as const) : null;
    }),
  );
  return Object.fromEntries(paires.filter((p): p is readonly [string, string] => p !== null));
}

// Ids des annonces qui ont une photo (une seule requête : les dossiers à la racine du bucket).
export async function idsAvecPhoto(): Promise<Set<string>> {
  const db = sb();
  if (!db) return new Set(photosMemoire);
  const { data } = await db.storage.from(BUCKET_PHOTOS).list('', { limit: 1000 });
  return new Set((data ?? []).map((o) => o.name));
}
