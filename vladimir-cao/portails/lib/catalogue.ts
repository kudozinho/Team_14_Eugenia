// Catalogue d'offres FICTIVES affichées par les 3 portails (vitrine de démo).
// Il est distinct de la table annonces_portails : les tests de l'agent H et /api/reset n'y touchent pas.
// Prix cohérents avec le secteur (1 500 à 6 000 €/m², Essonne nord) ; adresses : quartier seulement.
// Photos : stand-ins Wikimedia Commons (licences libres), crédités en pied de page.
import type { Code } from './portail';

export type Classe = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type Bien = {
  id: number;
  projet: 'vente' | 'location';
  type: 'appartement' | 'maison' | 'studio';
  titre: string;
  prix: number; // vente : prix FAI ; location : loyer charges comprises
  charges?: number; // location : provision mensuelle ; vente : charges de copropriété mensuelles
  surface: number;
  terrain?: number;
  pieces: number;
  chambres: number;
  etage?: string;
  ville: string;
  quartier: string;
  dpe: Classe;
  ges: Classe;
  annee: number;
  exterieur?: string;
  stationnement?: string;
  atouts: string[];
  description: string;
  honoraires: string;
  photos: string[]; // ids des fichiers public/vitrine/img/photo-<id>
};

export const BIENS: Bien[] = [
  { id: 1, projet: 'vente', type: 'appartement', titre: 'Appartement 3 pièces avec balcon', prix: 299000, charges: 180, surface: 68, pieces: 3, chambres: 2, etage: '2e sur 5, ascenseur', ville: 'Massy', quartier: 'Massy-Atlantis', dpe: 'C', ges: 'C', annee: 2012, exterieur: 'Balcon de 7 m² exposé sud', stationnement: 'Place en sous-sol', atouts: ['RER B et C à 6 min à pied', 'Double vitrage', 'Cave'], description: "Dans une résidence récente du quartier Atlantis, un 3 pièces traversant : entrée avec placard, séjour de 26 m² ouvert sur un balcon plein sud, cuisine équipée, deux chambres, salle de bains avec fenêtre et WC séparés. Copropriété de 48 lots, sans procédure en cours.", honoraires: 'Honoraires à la charge du vendeur', photos: ['f187101720', 'f186239762', 'f194508631', 'f116757501'] },
  { id: 2, projet: 'vente', type: 'maison', titre: 'Maison familiale 5 pièces avec jardin', prix: 525000, surface: 112, terrain: 380, pieces: 5, chambres: 4, ville: 'Palaiseau', quartier: 'Lozère', dpe: 'D', ges: 'D', annee: 1978, exterieur: 'Jardin de 380 m² clos', stationnement: 'Garage et deux places', atouts: ['Écoles à pied', 'Sous-sol total', 'Toiture refaite en 2019'], description: "Maison de 1978 sur sous-sol total : séjour double avec cheminée, cuisine indépendante, quatre chambres dont une au rez-de-chaussée, deux salles d'eau. Jardin clos de 380 m² sans vis-à-vis, garage. Quartier calme à 10 minutes du RER B Lozère.", honoraires: 'Honoraires à la charge du vendeur', photos: ['f153760537', 'f121127159', 'f195282458', 'f189229280'] },
  { id: 3, projet: 'location', type: 'studio', titre: 'Studio meublé proche du campus', prix: 690, charges: 60, surface: 24, pieces: 1, chambres: 0, etage: '3e sur 4', ville: 'Orsay', quartier: 'Centre', dpe: 'E', ges: 'C', annee: 1985, atouts: ['Meublé', 'Internet fibre', 'Bus pour le campus en bas de la rue'], description: "Studio meublé et équipé : pièce de vie lumineuse, coin cuisine avec plaques et réfrigérateur, salle d'eau avec WC. Idéal pour un étudiant ou un jeune actif. Disponible tout de suite.", honoraires: 'Honoraires locataire : 192 € (visite, dossier, bail) et 72 € (état des lieux)', photos: ['f147942740', 'f73183392'] },
  { id: 4, projet: 'vente', type: 'appartement', titre: 'Deux pièces rénové en centre-ville', prix: 245000, charges: 120, surface: 46, pieces: 2, chambres: 1, etage: '3e sur 4, ascenseur', ville: 'Antony', quartier: 'Centre', dpe: 'C', ges: 'B', annee: 1968, stationnement: 'Box fermé', atouts: ['Rénové en 2024', 'Marché et commerces au pied', 'RER B à 5 min'], description: "Deux pièces entièrement rénové : séjour clair sur rue calme, cuisine ouverte équipée, chambre avec placard, salle d'eau moderne. Fenêtres double vitrage neuves, chauffage individuel électrique.", honoraires: 'Honoraires à la charge du vendeur', photos: ['f165047557', 'f192968130', 'f73915640'] },
  { id: 5, projet: 'location', type: 'appartement', titre: 'Trois pièces lumineux avec balcon', prix: 1290, charges: 110, surface: 64, pieces: 3, chambres: 2, etage: '1er sur 3', ville: 'Massy', quartier: 'Vilmorin', dpe: 'B', ges: 'A', annee: 2016, exterieur: 'Balcon de 5 m²', stationnement: 'Place de parking', atouts: ['Résidence récente', 'Chauffage collectif', 'Gardien'], description: "Dans une résidence de 2016, trois pièces : séjour ouvert sur balcon, cuisine aménagée, deux chambres avec placards, salle de bains. Proche du centre et des écoles.", honoraires: 'Honoraires locataire : 512 € (visite, dossier, bail) et 192 € (état des lieux)', photos: ['f27294315', 'f187101716', 'f195282458'] },
  { id: 6, projet: 'vente', type: 'appartement', titre: 'Quatre pièces avec terrasse de 15 m²', prix: 449000, charges: 240, surface: 86, pieces: 4, chambres: 3, etage: 'Dernier étage, ascenseur', ville: 'Verrières-le-Buisson', quartier: 'Bois de Verrières', dpe: 'C', ges: 'C', annee: 2008, exterieur: 'Terrasse de 15 m²', stationnement: 'Deux places en sous-sol', atouts: ['Vue dégagée sur le bois', 'Dernier étage', 'Cuisine équipée neuve'], description: "Au dernier étage, quatre pièces de 86 m² : grand séjour prolongé d'une terrasse de 15 m² face au bois, cuisine équipée, trois chambres, salle de bains et salle d'eau. Deux places de parking et une cave.", honoraires: 'Honoraires à la charge du vendeur', photos: ['f192525790', 'f186239762', 'f194508631', 'f116757501'] },
  { id: 7, projet: 'vente', type: 'appartement', titre: 'Trois pièces en résidence arborée', prix: 239000, charges: 210, surface: 63, pieces: 3, chambres: 2, etage: 'Rez-de-jardin', ville: 'Igny', quartier: 'Gommonvilliers', dpe: 'D', ges: 'D', annee: 1972, exterieur: 'Jardinet privatif', stationnement: 'Place de parking', atouts: ['Parc de la résidence', 'Calme', 'Proche de la gare'], description: "En rez-de-jardin d'une résidence arborée, trois pièces avec jardinet privatif : séjour, cuisine indépendante, deux chambres, salle de bains. Quelques travaux de rafraîchissement à prévoir.", honoraires: 'Honoraires à la charge du vendeur', photos: ['f77980652', 'f189229280', 'f73915640'] },
  { id: 8, projet: 'location', type: 'appartement', titre: 'Deux pièces dans un immeuble ancien', prix: 920, charges: 70, surface: 42, pieces: 2, chambres: 1, etage: '2e sans ascenseur', ville: 'Palaiseau', quartier: 'Centre', dpe: 'C', ges: 'C', annee: 1930, atouts: ['Parquet', 'Moulures', 'Commerces à pied'], description: "Dans un immeuble en pierre, deux pièces de caractère : séjour avec parquet et moulures, cuisine séparée, chambre sur cour, salle d'eau. À deux pas du marché du centre.", honoraires: 'Honoraires locataire : 336 € (visite, dossier, bail) et 126 € (état des lieux)', photos: ['f44738173', 'f165047557', 'f73183392'] },
  { id: 9, projet: 'vente', type: 'appartement', titre: 'Grand cinq pièces familial', prix: 495000, charges: 290, surface: 104, pieces: 5, chambres: 4, etage: '4e sur 6, ascenseur', ville: 'Orsay', quartier: 'Mondétour', dpe: 'C', ges: 'D', annee: 1995, exterieur: 'Deux balcons', stationnement: 'Box double', atouts: ['Quatre chambres', 'Proche du lycée', 'Gardien'], description: "Cinq pièces de 104 m² : double séjour avec deux balcons, cuisine indépendante équipée, quatre chambres, salle de bains, salle d'eau, nombreux rangements. Box double en sous-sol.", honoraires: 'Honoraires à la charge du vendeur', photos: ['f119196975', 'f121127159', 'f195282458', 'f192968130'] },
  { id: 10, projet: 'vente', type: 'appartement', titre: 'Deux pièces idéal premier achat', prix: 139000, charges: 95, surface: 41, pieces: 2, chambres: 1, etage: '1er sur 4', ville: 'Longjumeau', quartier: 'Centre', dpe: 'D', ges: 'C', annee: 1965, atouts: ['Faibles charges', 'Commerces au pied', 'Bus vers le RER C'], description: "Deux pièces bien agencé : séjour, cuisine ouverte, chambre, salle d'eau. Idéal pour un premier achat ou un investissement locatif.", honoraires: 'Honoraires à la charge du vendeur', photos: ['f26129355', 'f147942740'] },
  { id: 11, projet: 'location', type: 'appartement', titre: 'Quatre pièces avec cuisine ouverte', prix: 1390, charges: 130, surface: 78, pieces: 4, chambres: 3, etage: '3e sur 5, ascenseur', ville: 'Chilly-Mazarin', quartier: 'Les Saules', dpe: 'D', ges: 'C', annee: 1990, exterieur: 'Loggia', stationnement: 'Place de parking', atouts: ['Trois chambres', 'Loggia', 'Proche A6'], description: "Quatre pièces : séjour avec cuisine ouverte équipée, loggia, trois chambres, salle de bains et WC séparés. Place de parking en sous-sol.", honoraires: 'Honoraires locataire : 624 € (visite, dossier, bail) et 234 € (état des lieux)', photos: ['f186239762', 'f189229280', 'f73915640'] },
  { id: 12, projet: 'vente', type: 'appartement', titre: 'Trois pièces au calme', prix: 199000, charges: 150, surface: 61, pieces: 3, chambres: 2, etage: '2e sur 3', ville: 'Champlan', quartier: 'Centre', dpe: 'C', ges: 'B', annee: 2001, exterieur: 'Balcon', stationnement: 'Place de parking', atouts: ['Petite copropriété', 'Calme', 'Proche des écoles'], description: "Dans une petite copropriété de 2001, trois pièces : séjour avec balcon, cuisine équipée, deux chambres, salle de bains. Place de parking.", honoraires: 'Honoraires à la charge du vendeur', photos: ['f194508631', 'f73183392', 'f187101716'] },
];

// Chaque portail présente 8 offres, dans son propre ordre, avec ses propres références.
const SELECTION: Record<Code, number[]> = {
  A: [1, 4, 2, 7, 6, 10, 9, 12],
  B: [5, 1, 8, 3, 11, 2, 6, 10],
  C: [6, 2, 9, 4, 1, 5, 12, 3],
};

export type Offre = Bien & { ref: string };

export function offres(code: Code): Offre[] {
  return SELECTION[code].map((id) => {
    const b = BIENS.find((x) => x.id === id)!;
    return { ...b, ref: `${code}-${1000 + id}` };
  });
}

export function offre(code: Code, ref: string): Offre | undefined {
  return offres(code).find((o) => o.ref === ref);
}

export const prixM2 = (prix: number, surface: number) => Math.round(prix / surface);
export const euros = (n: number) => `${n.toLocaleString('fr-FR')} €`;
export const photo = (id: string, taille: 500 | 960 | 1280 = 960) =>
  taille === 1280 ? `/vitrine/img/photo-${id}.webp` : `/vitrine/img/photo-${id}-${taille}.webp`;
export const srcset = (id: string) =>
  `/vitrine/img/photo-${id}-500.webp 500w, /vitrine/img/photo-${id}-960.webp 960w, /vitrine/img/photo-${id}.webp 1280w`;

// Photo d'illustration pour une annonce publiée sans photo (sites A et B) : choisie de façon stable.
const ILLUSTRATIONS = ['f187101720', 'f165047557', 'f27294315', 'f192525790', 'f194508631'];
export const illustration = (cle: string) =>
  ILLUSTRATIONS[[...cle].reduce((s, c) => s + c.charCodeAt(0), 0) % ILLUSTRATIONS.length];

export const CREDITS =
  "Photographies d'illustration, Wikimedia Commons : Shixart1985 (CC BY 2.0), Lo (CC0), Mstyslav Chernov (CC BY-SA 3.0), Philippe Alès (CC BY-SA 4.0), Paikan06 (CC0), Kotivalo (CC BY-SA 4.0), F Astily (CC BY-SA 4.0) et autres auteurs (CC BY, CC BY-SA, CC0, domaine public).";
