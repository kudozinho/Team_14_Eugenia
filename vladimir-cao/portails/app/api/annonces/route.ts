import { NextResponse } from 'next/server';
import { portailCourant, photoActive, VILLES } from '@/lib/portail';
import { creerAnnonce, enregistrerPhoto, listerAnnonces, idsAvecPhoto, type NouvelleAnnonce } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Chaque site nomme ses champs à sa façon (c'est le but du niveau 2) ;
// le serveur ramène tout aux colonnes du schéma commun.
const CHAMPS = {
  A: { titre: 'titre', prix: 'prix', surface: 'surface_m2', ville: 'ville', description: 'description' },
  B: { titre: 'intitule', prix: 'montant', surface: 'superficie', ville: 'commune', description: 'texte' },
  C: { titre: 'accroche', prix: 'prix_fai', surface: 'surface_habitable', ville: 'localisation', description: 'descriptif' },
} as const;

const PHOTO_MAX = 4 * 1024 * 1024; // limite du corps de requête sur Vercel : 4,5 Mo

// "289 000 €", "289000", "289.000" -> 289000 ; "289000,50" -> 289000
function entier(v: FormDataEntryValue | null): number | null {
  if (typeof v !== 'string') return null;
  const chiffres = v.split(',')[0].replace(/\D/g, '');
  return chiffres ? parseInt(chiffres, 10) : null;
}
const texte = (v: FormDataEntryValue | null) => (typeof v === 'string' && v.trim() ? v.trim() : null);

function pageErreur(portail: string, erreurs: string[]) {
  const items = erreurs.map((e) => `<li>${e.replace(/</g, '&lt;')}</li>`).join('');
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${portail} - Erreur</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;max-width:560px;margin:48px auto;padding:0 16px}h1{color:#b42318}a{color:#175cd3}</style></head>
<body><h1>L'annonce n'a pas été publiée</h1><ul id="erreurs">${items}</ul>
<p><a href="javascript:history.back()">Revenir au formulaire et corriger</a></p></body></html>`;
  return new NextResponse(html, { status: 400, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function POST(req: Request) {
  const p = portailCourant();
  // Copie de prévisualisation (LECTURE_SEULE=1) : elle lit la base mais n'y écrit jamais.
  if (process.env.LECTURE_SEULE === '1') {
    return pageErreur(p.nom, ["Site de prévisualisation : la publication est désactivée ici. Utilisez le site officiel."]);
  }
  const f = await req.formData();
  const n = CHAMPS[p.code];

  const a: NouvelleAnnonce = {
    portail: p.nom,
    titre: texte(f.get(n.titre)),
    prix: entier(f.get(n.prix)),
    surface_m2: entier(f.get(n.surface)),
    ville: texte(f.get(n.ville)),
    description: texte(f.get(n.description)),
  };

  const erreurs: string[] = [];
  if (!a.titre) erreurs.push('Le titre est obligatoire.');
  if (!a.prix || a.prix <= 0) erreurs.push('Le prix doit être un nombre supérieur à 0.');
  if (!a.surface_m2 || a.surface_m2 <= 0) erreurs.push('La surface doit être un nombre supérieur à 0.');
  if (!a.ville) erreurs.push('La ville est obligatoire.');
  else if (p.code !== 'A' && !VILLES.some((v) => v.nom === a.ville)) erreurs.push('Choisissez une commune dans la liste.');
  if (!a.description) erreurs.push('La description est obligatoire.');

  let photo: File | null = null;
  if (p.code === 'C') {
    if (f.get('certification') !== 'oui') erreurs.push('Cochez la case de certification du mandat.');
    if (photoActive()) {
      const v = f.get('photo');
      if (!(v instanceof File) || v.size === 0) erreurs.push('Ajoutez une photo du bien.');
      else if (!v.type.startsWith('image/')) erreurs.push('La photo doit être une image (JPG, PNG, WebP).');
      else if (v.size > PHOTO_MAX) erreurs.push('La photo dépasse 4 Mo.');
      else photo = v;
    }
  }
  if (erreurs.length) return pageErreur(p.nom, erreurs);

  try {
    const id = crypto.randomUUID();
    if (photo) await enregistrerPhoto(id, photo); // photo d'abord : pas d'annonce « sans photo » en base si l'envoi échoue
    const ligne = await creerAnnonce(a, id);
    return NextResponse.redirect(new URL(`/annonces/${ligne.id}?publiee=1`, req.url), 303);
  } catch (e) {
    return pageErreur(p.nom, [`Erreur du serveur : ${(e as Error).message}`]);
  }
}

// Lecture JSON des annonces de ce site (pratique pour vérifier sans clé Supabase).
export async function GET() {
  const p = portailCourant();
  const [annonces, photos] = await Promise.all([listerAnnonces(p.nom), p.code === 'C' ? idsAvecPhoto() : Promise.resolve(new Set<string>())]);
  return NextResponse.json({
    portail: p.nom,
    ...(p.code === 'C' ? { photo_active: photoActive() } : {}),
    annonces: annonces.map((x) => (p.code === 'C' ? { ...x, photo: photos.has(x.id) } : x)),
  });
}
