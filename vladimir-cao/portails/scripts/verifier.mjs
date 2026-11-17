// Vérifie que les 3 sites répondent (vendredi 9h) et, avec --publier, dépose une annonce de test sur chacun
// puis contrôle qu'elle revient bien de la base (critère « terminé » de mardi).
//
//   node scripts/verifier.mjs https://site-a.vercel.app https://site-b.vercel.app https://site-c.vercel.app
//   node scripts/verifier.mjs --publier http://localhost:3001 http://localhost:3002 http://localhost:3003

const args = process.argv.slice(2);
const publier = args.includes('--publier');
const sites = args.filter((a) => !a.startsWith('--')).map((u) => u.replace(/\/$/, ''));
if (!sites.length) {
  console.error('Usage : node scripts/verifier.mjs [--publier] <url A> <url B> <url C>');
  process.exit(2);
}

// Mandat M-0142 (données de démo), même entrée pour les 3 sites.
const MANDAT = { titre: 'Appartement T3 lumineux', prix: 289000, surface_m2: 68, ville: 'Massy', description: 'T3 au 2e étage, proche RER, balcon.' };
const CHEMINS = { 'Portail A': '/deposer', 'Portail B': '/nouvelle', 'Portail C': '/publier' };
// PNG 1x1 pour tester l'envoi de photo du site C
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==', 'base64');

function formulaire(portail) {
  const f = new FormData();
  const m = MANDAT;
  const champs = {
    'Portail A': { titre: m.titre, prix: m.prix, surface_m2: m.surface_m2, ville: m.ville, description: m.description },
    'Portail B': { intitule: m.titre, montant: '289 000 €', superficie: m.surface_m2, commune: m.ville, texte: m.description },
    'Portail C': { accroche: m.titre, prix_fai: m.prix, surface_habitable: m.surface_m2, localisation: m.ville, descriptif: m.description, certification: 'oui' },
  }[portail];
  for (const [k, v] of Object.entries(champs)) f.append(k, String(v));
  if (portail === 'Portail C') f.append('photo', new Blob([PNG], { type: 'image/png' }), 'test.png');
  return f;
}

const egal = (a) => ['titre', 'prix', 'surface_m2', 'ville', 'description'].every((k) => a[k] === MANDAT[k]);

let echecs = 0;
for (const base of sites) {
  const debut = Date.now();
  try {
    const r = await fetch(`${base}/api/annonces`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`/api/annonces → HTTP ${r.status}`);
    const { portail, annonces, photo_active } = await r.json();
    const chemin = CHEMINS[portail];
    for (const page of ['/', chemin, '/annonces']) {
      const rp = await fetch(base + page);
      if (!rp.ok) throw new Error(`${page} → HTTP ${rp.status}`);
    }
    let ligne = `OK  ${portail.padEnd(9)} ${base}  (${annonces.length} annonce(s), ${Date.now() - debut} ms)`;

    if (publier) {
      const rp = await fetch(`${base}/api/annonces`, { method: 'POST', body: formulaire(portail), redirect: 'manual' });
      if (rp.status !== 303) throw new Error(`dépôt refusé : HTTP ${rp.status} ${(await rp.text()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 200)}`);
      const id = rp.headers.get('location').split('/annonces/')[1].split('?')[0];
      const { annonces: apres } = await (await fetch(`${base}/api/annonces`, { cache: 'no-store' })).json();
      const a = apres.find((x) => x.id === id);
      if (!a) throw new Error(`annonce ${id} absente de la base après dépôt`);
      if (!egal(a)) throw new Error(`champs faux en base : ${JSON.stringify(a)}`);
      if (portail === 'Portail C' && photo_active && !a.photo) throw new Error('photo absente du stockage');
      ligne += `\n    dépôt OK → ${base}/annonces/${id}${portail === 'Portail C' ? (photo_active ? ' (photo OK)' : ' (photo désactivée)') : ''}`;
    }
    console.log(ligne);
  } catch (e) {
    echecs++;
    console.log(`ÉCHEC ${base} : ${e.message}`);
  }
}
process.exit(echecs ? 1 : 0);
