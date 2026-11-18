import Link from 'next/link';
import { notFound } from 'next/navigation';
import { portailCourant } from '@/lib/portail';
import { lireAnnonce, urlPhoto, modeLocal } from '@/lib/store';
import { illustration, offres, photo, srcset } from '@/lib/catalogue';
import Fiche from '../../biens/Fiche';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Annonce' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ publiee?: string }> };

// Fiche d'une annonce publiée (par l'agence ou par l'agent H) : seules les données saisies sont affichées,
// plus ce qui s'en calcule (prix au m²). Rien n'est inventé : le DPE apparaît « non renseigné ».
export default async function Annonce({ params, searchParams }: Props) {
  const { id } = await params;
  const { publiee } = await searchParams;
  const p = portailCourant();
  const a = await lireAnnonce(p.nom, id);
  // Mode local sur Vercel : le dépôt et cette page tournent dans des fonctions séparées qui ne partagent
  // pas leur mémoire. L'annonce a été reçue mais ne peut pas être relue tant que Supabase n'est pas branché.
  if (!a && modeLocal() && publiee) {
    return (
      <div className="carte">
        <div className="succes" role="status" id="confirmation">Annonce reçue par {p.nom}. Référence : <strong>{id}</strong></div>
        <p>La base de données n'est pas encore branchée : l'annonce ne peut pas être réaffichée ici. Elle le sera une fois Supabase branché.</p>
        <div className="actions"><Link className="bouton secondaire" href={p.chemin}>{p.action}</Link></div>
      </div>
    );
  }
  if (!a) notFound();

  const vraiePhoto = p.code === 'C' ? await urlPhoto(id) : null;
  const titre = a.titre ?? 'Annonce';
  const images = vraiePhoto
    ? [{ src: vraiePhoto, alt: titre }]
    : [{ src: photo(illustration(id), 960), srcSet: srcset(illustration(id)), alt: titre }];
  const catalogue = offres(p.code);
  const similaires = [...catalogue.filter((o) => o.ville === a.ville), ...catalogue.filter((o) => o.ville !== a.ville && o.projet === 'vente')].slice(0, 3);
  const pieces = /\bT(\d)\b|(\d) pièces?/i.exec(titre);

  return (
    <Fiche
      f={{
        ref: a.id,
        projet: 'vente',
        typeLabel: /maison/i.test(titre) ? 'Maison' : /studio/i.test(titre) ? 'Studio' : 'Appartement',
        titre,
        prix: a.prix,
        surface: a.surface_m2,
        pieces: pieces ? Number(pieces[1] ?? pieces[2]) : undefined,
        ville: a.ville,
        description: a.description,
        images,
        mentionPhoto: vraiePhoto ? undefined : "Photo d'illustration",
        publieeLe: a.cree_le,
        confirmation: !!publiee,
        similaires,
      }}
    />
  );
}
