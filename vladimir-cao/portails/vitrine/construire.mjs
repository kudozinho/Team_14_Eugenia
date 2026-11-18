// Génère les pages d'accueil « vitrine » des 3 portails (public/vitrine/a.html, b.html, c.html)
// avec le kit du skill design-taste-frontend (copié dans public/vitrine/kit).
// Les formulaires (/deposer, /nouvelle, /publier) ne sont PAS concernés : ils gardent leur code et leurs styles.
// Lancer : node vitrine/construire.mjs
import { writeFileSync } from 'node:fs';

const ARROW = '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';
const CHEV = '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const GRAND = new Set(['f187101720', 'f38795371', 'f165047557', 'f44738173', 'f27294315', 'f195282458', 'f73183392']);
// sizes : la largeur affichée ; une image de hero en « cover » s'affiche plus large que sa colonne (1280px)
const img = (id, alt, extra = '') => {
  // hero : cadrage « cover », plus large que l'écran sur téléphone ; data-large : une photo sur toute la largeur du .wrap
  const sizes = /fetchpriority="high"/.test(extra) ? '(max-width: 639px) 300vw, 1280px'
    : /data-large/.test(extra) ? '(max-width: 639px) 200vw, 1280px' : '(max-width: 639px) 100vw, 50vw';
  const attrs = extra.replace(/ ?sizes="[^"]*"/g, '');
  return GRAND.has(id)
    ? `<img src="/vitrine/img/photo-${id}.webp" srcset="/vitrine/img/photo-${id}-500.webp 500w, /vitrine/img/photo-${id}-960.webp 960w, /vitrine/img/photo-${id}.webp 1280w" sizes="${sizes}" alt="${alt}" decoding="async" data-source="stand-in" data-subject="stand-in" ${attrs}>`
    : `<img src="/vitrine/img/photo-${id}-960.webp" srcset="/vitrine/img/photo-${id}-500.webp 500w, /vitrine/img/photo-${id}-960.webp 960w" sizes="${sizes}" alt="${alt}" decoding="async" data-source="stand-in" data-subject="stand-in" ${attrs}>`;
};
// moment pinned-chapters : 3 étapes, une photo chacune
const chapitres = (id, titre, etapes) => `
  <section class="section" id="${id}" style="--h: 2" data-moment="pinned-chapters" aria-labelledby="${id}-h">
    <div class="wrap mo-pc__grid">
      <div class="mo-pc__text">
        <h2 id="${id}-h">${titre}</h2>
        <ol class="mo-pc__steps">${etapes.map(([h, p, ph, alt]) => `
          <li class="mo-pc__step">
            <h3>${h}</h3>
            <p>${p}</p>
            <figure class="mo-pc__visual">${img(ph, alt, 'loading="lazy"')}</figure>
          </li>`).join('')}
        </ol>
      </div>
      <div class="mo-pc__visuals frame"></div>
    </div>
  </section>`;

// Palettes tirées : start.mjs css --page service --palette <id> --type <id> --radius soft
const FONTS = {
  newsreader: 'https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400..700&family=Hanken+Grotesk:wght@400..600&display=swap',
  hanken: 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400..700&display=swap',
};
const ROOT = {
  a: `--p-bg: #f7f7f5; --p-surface: #ebebe8; --p-ink: #000000; --p-muted: #666662;
  --p-accent: #d0106f; --p-accent-ink: #ffffff; --p-action: #d0106f; --p-action-ink: #ffffff;
  --p-inv-bg: #000000; --p-inv-surface: #010101; --p-inv-ink: #f7f7f5; --p-inv-muted: #828280;
  --p-inv-accent: #d0106f; --p-inv-accent-ink: #ffffff; --p-inv-action: #d0106f; --p-inv-action-ink: #ffffff;
  --font-display: "Newsreader", Georgia, serif; --font-text: "Hanken Grotesk", system-ui, sans-serif;
  --display-weight: 400; --display-tracking: -0.018em; --display-tracking-xl: -0.025em; --ly-scale: 1.06;`,
  b: `--p-bg: #dfdedb; --p-surface: #d3d2ce; --p-ink: #26251e; --p-muted: #5a5850;
  --p-accent: #2456d6; --p-accent-ink: #ffffff; --p-action: #2456d6; --p-action-ink: #ffffff;
  --p-inv-bg: #26251e; --p-inv-surface: #313029; --p-inv-ink: #dfdedb; --p-inv-muted: #9e9d99;
  --p-inv-accent: #dfdedb; --p-inv-accent-ink: #26251e; --p-inv-action: #dfdedb; --p-inv-action-ink: #26251e;
  --font-display: "Newsreader", Georgia, serif; --font-text: "Hanken Grotesk", system-ui, sans-serif;
  --display-weight: 400; --display-tracking: -0.018em; --display-tracking-xl: -0.025em; --ly-scale: 1.06;`,
  c: `--p-bg: #c3d7e5; --p-surface: #d0e0eb; --p-ink: #141414; --p-muted: #4a5068;
  --p-accent: #0f5257; --p-accent-ink: #ffffff; --p-action: #0f5257; --p-action-ink: #ffffff;
  --p-inv-bg: #141414; --p-inv-surface: #1e1f20; --p-inv-ink: #c3d7e5; --p-inv-muted: #808b94;
  --p-inv-accent: #c3d7e5; --p-inv-accent-ink: #141414; --p-inv-action: #c3d7e5; --p-inv-action-ink: #141414;
  --font-display: "Hanken Grotesk", system-ui, sans-serif; --font-text: "Hanken Grotesk", system-ui, sans-serif;
  --display-weight: 400; --display-tracking: -0.03em; --display-tracking-xl: -0.038em;`,
};

const PORTAILS = {
  a: {
    nom: 'Portail A', mark: 'stack', font: 'newsreader', chemin: '/deposer', action: 'Déposer une annonce',
    nav: 'nav', footer: 'footer closing',
    deal: 'hero split, nav nav-mega, close close-type, footer footer-columns (footer-dark would meet the dark band), rhythm dark-band, buttons tonal, mark stack, palette card-pastels, type newsreader',
    titre: 'Portail A : annonces immobilières entre agences',
    description: "Déposez une annonce de vente en cinq champs ; elle s'affiche aussitôt dans les annonces publiées.",
    hero: () => `
  <section class="hero hero--split" data-enter aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text grid hero__grid">
      <div class="hero__text span-5">
        <h1 id="hero-h">Annonces entre agences de l'Essonne</h1>
        <p class="hero__lead">5 champs à remplir : titre, prix, surface, ville et description. L'annonce passe en ligne à l'envoi, sans relecture ni délai.</p>
        <div class="btn-row"><a class="btn btn--primary" href="/deposer">Déposer une annonce${ARROW}</a><a class="btn btn--secondary" href="/annonces">Voir les annonces</a></div>
      </div>
      <div class="hero__media span-6 start-7">
        ${img('f187101720', 'Un séjour meublé, baie vitrée ouverte sur la verdure', 'style="--ly-pos: 50% 50%" fetchpriority="high" sizes="(max-width: 639px) 100vw, 1280px"')}
      </div>
    </div></div>
  </section>`,
    section: () => chapitres('champs', 'Une annonce en trois temps', [
      ['Le bien en 5 champs', "Titre, prix en euros, surface en m², ville et description. Chaque champ est obligatoire, rien d'autre n'est demandé.", 'f73183392', 'Une cuisine équipée, plan de travail clair'],
      ["L'envoi de l'annonce","L'annonce est enregistrée à l'envoi : pas de relecture, pas de file d'attente, pas de compte à créer.", 'f27294315', 'Un appartement meublé, séjour ouvert sur un balcon'],
      ['La fiche en ligne', "Vous arrivez sur la fiche de l'annonce, et elle s'affiche en tête des annonces publiées.", 'f195282458', 'Une chambre mansardée sous les poutres'],
    ]),
    close: () => `
    <div class="closing__cta close--type">
      <div class="section-head">
        <h2 id="close-h">Déposez votre prochaine annonce</h2>
        <p>Cinq champs, et elle apparaît dans les annonces publiées.</p>
      </div>
      <a class="btn btn--primary btn--xl btn--wide" href="/deposer">Déposer une annonce${ARROW}</a>
    </div>`,
    lede: 'Petites annonces immobilières entre professionnels.',
  },
  b: {
    nom: 'Portail B', mark: 'ring', font: 'newsreader', chemin: '/nouvelle', action: 'Nouvelle annonce',
    nav: 'nav nav--split', footer: 'footer closing',
    deal: 'hero film (photo poster, no film), nav nav-split, close close-photo, footer footer-columns, rhythm surface-pairs, buttons tonal, mark ring, palette stone-blueprint, type newsreader',
    titre: 'Portail B : annonces des agences du Sud francilien',
    description: "Le réseau d'annonces des agences de dix communes autour de Massy, saisies en un formulaire.",
    hero: () => `
  <section class="hero hero--film" data-enter aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text hero__in">
      <div class="hero__media hero__fill">
        ${img('f44738173', 'Façade en pierre aux fenêtres à petits carreaux', 'style="--ly-pos: 50% 50%; --ly-pos-phone: 50% 50%" fetchpriority="high" sizes="(max-width: 639px) 100vw, 1280px"')}
        <div class="hero__over">
          <div>
            <h1 id="hero-h">Annonces des agences du Sud francilien</h1>
            <p class="hero__lead">Dix communes autour de Massy, choisies dans une liste. Le montant se saisit comme vous l'écrivez : « 250 000 € » est accepté.</p>
            <div class="btn-row"><a class="btn btn--primary" href="/nouvelle">Nouvelle annonce${ARROW}</a><a class="btn btn--secondary" href="/annonces">Voir les annonces</a></div>
          </div>
        </div>
      </div>
    </div></div>
  </section>`,
    section: () => chapitres('communes', 'Une annonce, dix communes', [
      ["La commune de l'annonce", 'Massy, Palaiseau, Orsay, Antony et six autres communes du Sud francilien : on choisit, on ne tape pas.', 'f26129355', 'Façades d\'immeubles en pierre à balcons de fer forgé'],
      ["Le prix de l'annonce", 'Écrit comme vous le voulez : « 250 000 € », « 250000 » ou « 250.000 » : le prix est lu tel quel, sans format imposé.', 'f165047557', 'Un séjour clair, chaises et meuble bas devant les baies vitrées'],
      ["La publication de l'annonce",'Un clic sur Enregistrer l\'annonce, et elle rejoint les annonces publiées du réseau.', 'f73183392', 'Une cuisine équipée, plan de travail clair'],
    ]),
    close: () => `
    <div class="closing__cta close--photo">
      <div class="section-head--split">
        <div><h2 id="close-h">Publiez votre annonce aujourd'hui</h2><p class="t-lead">Cinq champs, une commune dans la liste.</p></div>
        <a class="btn btn--primary" href="/nouvelle">Nouvelle annonce${ARROW}</a>
      </div>
      <div class="close__media">${img('f27294315', 'Un appartement meublé, séjour ouvert sur un balcon', 'loading="lazy" data-large')}</div>
    </div>`,
    lede: 'Le réseau des agences du Sud francilien.',
  },
  c: {
    nom: 'Portail C', mark: 'dots', font: 'hanken', chemin: '/publier', action: 'Publier un bien',
    nav: 'nav nav--split', footer: 'footer closing',
    deal: 'hero photo, nav nav-split, close close-type, footer footer-columns (footer-visit needs an address: none given; footer-dark would meet the dark band), rhythm dark-band, buttons tonal, mark dots, palette swap-pastels, type hanken',
    titre: 'Portail C : diffusion d\'annonces vérifiées',
    description: 'Chaque bien publié porte une photo et une certification de mandat, en deux étapes.',
    hero: () => `
  <section class="hero hero--photo" data-enter data-calm="left" aria-labelledby="hero-h">
    <img class="hero__bg" src="/vitrine/img/photo-f165047557.webp" srcset="/vitrine/img/photo-f165047557-960.webp 960w, /vitrine/img/photo-f165047557.webp 1280w" sizes="100vw" width="1280" height="962" alt="Un séjour clair, canapé et fauteuil face à la fenêtre" style="--ly-pos: 60% 50%; --ly-pos-phone: 70% 50%" fetchpriority="high" data-source="stand-in" data-subject="stand-in">
    <div class="wrap"><div class="hero-text">
      <div class="hero__text">
        <h1 id="hero-h">Diffusion d'annonces vérifiées</h1>
        <p class="hero__lead">2 étapes, une photo et la certification du mandat pour chaque annonce.</p>
        <div class="btn-row"><a class="btn btn--primary" href="/publier">Publier un bien${ARROW}</a><a class="btn btn--secondary" href="/annonces">Voir les annonces</a></div>
      </div>
    </div></div>
  </section>`,
    section: () => chapitres('etapes', 'Une annonce vérifiée en trois temps', [
      ['Étape 1 : le bien', "L'accroche, la commune choisie dans la liste et la surface habitable en m².", 'f195282458', 'Une chambre mansardée sous les poutres'],
      ['Étape 2 : le prix et la photo', "Le prix de vente frais d'agence inclus, le descriptif, et une photo principale en JPG, PNG ou WebP.", 'f187101720', 'Un séjour meublé, baie vitrée ouverte sur la verdure'],
      ['La certification du mandat', "Une case à cocher : l'agence certifie détenir un mandat en cours. Sans elle, rien n'est publié.", 'f26129355', 'Façades d\'immeubles en pierre à balcons de fer forgé'],
    ]),
    close: () => `
    <div class="closing__cta close--type">
      <div class="section-head">
        <h2 id="close-h">Publiez un bien vérifié</h2>
        <p>Deux étapes, une photo, une case à cocher.</p>
      </div>
      <a class="btn btn--primary btn--xl btn--wide" href="/publier">Publier un bien${ARROW}</a>
    </div>`,
    lede: 'Diffusion premium, annonces vérifiées.',
  },
};

for (const [k, p] of Object.entries(PORTAILS)) {
  const html = `<!doctype html>
<html lang="fr" data-type="service" data-radius="soft" data-buttons="tonal" data-motion>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${p.titre}</title>
<meta name="description" content="${p.description}">
<meta name="robots" content="noindex, nofollow">
<meta property="og:type" content="website">
<meta property="og:title" content="${p.titre}">
<meta property="og:description" content="${p.description}">
<meta property="og:image" content="/vitrine/img/photo-f187101720-960.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${ROOT[k].match(/--p-bg: (#[0-9a-f]+)/)[1]}">
<meta name="site-kind" content="other">
<meta name="page-type" content="service">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS[p.font]}" rel="stylesheet">
<link rel="stylesheet" href="/vitrine/kit/system.css">
<link rel="stylesheet" href="/vitrine/kit/ui/cards.css">
<link rel="stylesheet" href="/vitrine/kit/motion/motion.css">
<link rel="stylesheet" href="/vitrine/kit/layout/layout.css">
<style>
:root {
  ${ROOT[k]}
}
</style>
<script>document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)</script>
<script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
<link rel="modulepreload" href="/vitrine/kit/moments/moments.js"><link rel="modulepreload" href="/vitrine/kit/moments/lib.js">
<link rel="modulepreload" href="/vitrine/kit/moments/pinned-chapters/moment.js">
</head>
<body>
<!-- type: service (site de test d'annonces, fictif)
     deal: ${p.deal}
     Accueil seulement : les formulaires (${p.chemin}) gardent leur code ; le bouton principal garde son texte exact (« ${p.action} »). -->
<header class="${p.nav}">
  <div class="wrap nav__bar">
    <a class="skip-link" href="#top">Aller au contenu</a>
    <a class="nav__logo" href="/"><span class="mark" data-mark="${p.mark}" aria-hidden="true"></span>${p.nom}</a>
    <nav class="nav__links" aria-label="Principale">
      <div class="nav__item">
        <a class="nav__link" href="${p.section().match(/id="([a-z]+)"/)[1] ? '#' + p.section().match(/id="([a-z]+)"/)[1] : '#top'}">Formulaire ${CHEV}</a>
        <div class="nav__menu">
          <div class="wrap grid">
            <div class="menu-col span-4">
              <p class="t-label">Publier</p>
              <a href="${p.chemin}">${p.action}<span>Le formulaire de dépôt</span></a>
              <a href="/annonces">Annonces publiées<span>Toutes les annonces en ligne</span></a>
            </div>
          </div>
        </div>
      </div>
      <div class="nav__item"><a class="nav__link" href="/annonces">Annonces</a></div>
    </nav>
    <div class="nav__actions">
      <a class="btn btn--primary" href="${p.chemin}">${p.action}</a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-label="Menu">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
  </div>
</header>
<main id="top">${p.hero()}
${p.section()}
</main>

<footer class="${p.footer}" id="contact" aria-labelledby="close-h">
  <div class="wrap">${p.close()}
    <div class="closing__links">
      <div class="grid">
        <div class="span-4 stack-4">
          <a class="nav__logo" href="/"><span class="mark" data-mark="${p.mark}" aria-hidden="true"></span>${p.nom}</a>
          <p class="footer__lede">${p.lede}</p>
        </div>
        <div class="span-4 footer__col"><h3>Publier</h3><ul><li><a href="${p.chemin}">${p.action}</a></li></ul></div>
        <div class="span-4 footer__col"><h3>Annonces</h3><ul><li><a href="/annonces">Annonces publiées</a></li></ul></div>
      </div>
      <div class="footer__legal">
        <span>&copy; 2026 ${p.nom} · site de test fictif, hackathon Build The Future</span>
        <details class="credits"><summary>Photographies : Wikimedia Commons</summary>
          <p>Shixart1985 (CC BY 2.0), Lo (CC0), Mstyslav Chernov (CC BY-SA 3.0), Philippe Alès (CC BY-SA 4.0), Paikan06 (CC0), Kotivalo (CC BY-SA 4.0), F Astily (CC BY-SA 4.0). Photographies d'illustration, sans lien avec les annonces.</p>
        </details>
      </div>
    </div>
  </div>
</footer>
<nav class="actionbar" aria-label="Actions rapides">
  <a class="btn btn--primary" href="${p.chemin}">${p.action}</a>
</nav>
<script type="module" src="/vitrine/kit/system.js"></script>
<script type="module" src="/vitrine/kit/motion/motion.js"></script>
<script type="module" src="/vitrine/kit/layout/layout.js"></script>
</body>
</html>
`;
  writeFileSync(new URL(`../public/vitrine/${k}.html`, import.meta.url), html);
  console.log(`public/vitrine/${k}.html écrit`);
}
