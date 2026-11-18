import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { portailCourant } from '@/lib/portail';
import { offre, offres } from '@/lib/catalogue';
import Fiche, { imagesDe } from '../Fiche';

export const dynamic = 'force-dynamic';

const TYPE = { appartement: 'Appartement', maison: 'Maison', studio: 'Studio' } as const;
type Props = { params: Promise<{ ref: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params;
  const o = offre(portailCourant().code, ref);
  return { title: o ? `${o.titre}, ${o.ville}` : 'Bien' };
}

// Fiche d'une offre du catalogue (fictive).
export default async function PageBien({ params }: Props) {
  const { ref } = await params;
  const p = portailCourant();
  const o = offre(p.code, ref);
  if (!o) notFound();
  const autres = offres(p.code).filter((x) => x.ref !== o.ref);
  const similaires = [...autres.filter((x) => x.projet === o.projet && x.ville === o.ville), ...autres.filter((x) => x.projet === o.projet && x.ville !== o.ville), ...autres.filter((x) => x.projet !== o.projet)].slice(0, 3);
  return (
    <Fiche
      f={{
        ...o,
        typeLabel: TYPE[o.type],
        images: imagesDe(o.photos, o.titre),
        mentionPhoto: "Photo d'illustration",
        similaires,
      }}
    />
  );
}
