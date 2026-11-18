import { NextResponse } from 'next/server';
import { portailCourant } from '@/lib/portail';
import { viderPortail } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Vide les annonces de CE site avant un essai (règle 3 du plan de tests, roadmap 06).
// curl -X POST https://<site>/api/reset -H "x-reset-token: $RESET_TOKEN"
export async function POST(req: Request) {
  if (process.env.LECTURE_SEULE === '1') return NextResponse.json({ erreur: 'site de prévisualisation : remise à zéro désactivée' }, { status: 403 });
  const jeton = process.env.RESET_TOKEN;
  if (!jeton) return NextResponse.json({ erreur: 'RESET_TOKEN non configuré : route désactivée' }, { status: 404 });
  if (req.headers.get('x-reset-token') !== jeton) return NextResponse.json({ erreur: 'jeton invalide' }, { status: 401 });
  const p = portailCourant();
  const supprimees = await viderPortail(p.nom);
  return NextResponse.json({ portail: p.nom, supprimees });
}
