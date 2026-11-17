// Configuration des 3 sites de test. Un seul code, 3 déploiements Vercel (variable PORTAIL).
// Les chemins reprennent ceux du contrat §3 : /deposer, /nouvelle, /publier.

export type Code = 'A' | 'B' | 'C';

export type Portail = {
  code: Code;
  nom: string; // valeur écrite dans annonces_portails.portail (= noms du contrat §4)
  chemin: string; // page du formulaire
  action: string; // titre de la page du formulaire (lu par le Recorder dans le titre de fenêtre)
  slogan: string;
};

export const PORTAILS: Record<Code, Portail> = {
  A: { code: 'A', nom: 'Portail A', chemin: '/deposer', action: 'Déposer une annonce', slogan: 'Petites annonces immobilières entre professionnels' },
  B: { code: 'B', nom: 'Portail B', chemin: '/nouvelle', action: 'Nouvelle annonce', slogan: 'Le réseau des agences du Sud francilien' },
  C: { code: 'C', nom: 'Portail C', chemin: '/publier', action: 'Publier un bien', slogan: 'Diffusion premium, annonces vérifiées' },
};

export function portailCourant(): Portail {
  const c = (process.env.PORTAIL || 'A').trim().toUpperCase();
  return PORTAILS[(c in PORTAILS ? c : 'A') as Code];
}

export function photoActive(): boolean {
  return (process.env.PHOTO_ACTIVE ?? '1') !== '0';
}

// Communes proposées dans les menus déroulants (B et C). Les mandats de démo : Massy, Palaiseau, Orsay.
export const VILLES = [
  { nom: 'Antony', cp: '92160' },
  { nom: 'Champlan', cp: '91160' },
  { nom: 'Chilly-Mazarin', cp: '91380' },
  { nom: 'Igny', cp: '91430' },
  { nom: 'Longjumeau', cp: '91160' },
  { nom: 'Massy', cp: '91300' },
  { nom: 'Orsay', cp: '91400' },
  { nom: 'Palaiseau', cp: '91120' },
  { nom: 'Verrières-le-Buisson', cp: '91370' },
  { nom: 'Wissous', cp: '91320' },
];
