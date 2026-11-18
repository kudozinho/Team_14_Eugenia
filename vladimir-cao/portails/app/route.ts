import { portailCourant } from '@/lib/portail';

export const dynamic = 'force-dynamic';

// Accueil « vitrine » : page statique construite avec le kit du skill design-taste-frontend
// (public/vitrine/<a|b|c>.html, générée par vitrine/construire.mjs). Servie telle quelle, hors de la
// mise en page Next : ses styles ne touchent jamais les formulaires (/deposer, /nouvelle, /publier).
export async function GET(req: Request) {
  const code = portailCourant().code.toLowerCase();
  const r = await fetch(new URL(`/vitrine/${code}.html`, req.url), { cache: 'no-store' });
  if (!r.ok) return new Response('Accueil indisponible', { status: 502 });
  return new Response(await r.text(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
