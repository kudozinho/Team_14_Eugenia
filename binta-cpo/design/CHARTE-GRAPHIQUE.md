# Charte graphique Ghost (v1)

Blanc et vert, sobre, lisible sur un écran projeté. Les tokens sont dans `binta-cpo/app/ghost-ui/app/globals.css`.
Le logo définitif se remplace dans `binta-cpo/app/ghost-ui/app/logo.tsx` (un seul fichier).

## Principes (inspirés des meilleurs tableaux de bord : Stripe, Linear, Vercel, Notion)
Ces principes viennent de pratiques connues de ces produits, pas d'une recherche en ligne faite aujourd'hui.
1. **Un chiffre héros.** La première chose vue est « 205 h / an ». Tout le reste le justifie.
2. **Peu de couleurs, chacune a un sens.** Vert = marque et agent H. Indigo = n8n. Ambre = vigilance. Rouge = « à la main » (avant).
3. **Beaucoup d'air.** Marges de 8 pt, cartes arrondies, bordures fines, ombres très légères.
4. **Étiquettes directes.** Le nom de la tâche est écrit sur le graphique, pas seulement dans une légende.
5. **Détail à la demande.** Les pistes secondaires sont repliées. Survol d'un point = infobulle.
6. **Une action claire par écran.** Dans le rapport : le bouton « Prouver avec l'agent ».
7. **Confiance visible.** « 0 donnée par personne affichée » est affiché dans le bandeau principal.

## Couleurs
| Rôle | Nom | Valeur | Usage |
|---|---|---|---|
| Marque | Vert 700 | `#0B7A55` | Boutons, liens, score, agent H |
| Marque sombre | Vert 900 / 950 | `#064E3B` / `#04382A` | Bandeau principal, survol |
| Accent clair | Vert 500 | `#12A874` | Dégradé, barres de progression |
| Fond de teinte | Vert 100 / 50 | `#DDF3E8` / `#EFFAF4` | Pastilles, quadrant « gain rapide » |
| Fond de page | Gris vert | `#F5F8F6` | Arrière-plan |
| Surface | Blanc | `#FFFFFF` | Cartes |
| Texte | Encre | `#0E1B14` | Texte principal (contraste très élevé) |
| Texte secondaire | Gris vert | `#3F4E45` / `#66756C` | Descriptions, légendes |
| Filet | Gris vert clair | `#E1E9E4` | Bordures |
| Outil n8n | Indigo 600 | `#5B5BD6` | Points, pastilles n8n |
| Vigilance | Ambre 600 / 50 | `#B97308` / `#FFF4DE` | Points de vigilance, badge démo |
| Avant / à la main | Rouge 600 | `#C93636` | Barre « 12 min » |

Palette des graphiques (vert agent H, indigo n8n) validée avec le script de contraste et de daltonisme : lisible, aucun échec sur ces deux séries. Le gris « rien à construire » est un neutre, pas une série.

## Typographie
- **Titres et chiffres : Plus Jakarta Sans** (600, 700, 800). Géométrique, moderne, chiffres nets.
- **Texte courant : Inter** (400, 500). Très lisible à l'écran.
- Chiffres alignés (`tabular-nums`) dans tous les tableaux.
- Échelle : héros 3,4 à 6,4 em · H1 1,9 à 2,8 em · H2 1,12 em · corps 15 à 21 px (grandit sur grand écran) · légende 0,8 em.

## Espacement et formes
- Grille de 8 pt ; écart entre cartes 18 px ; padding de carte 22 px.
- Rayons : cartes 16 px, bandeau 22 px, boutons 12 px, pastilles 999 px.
- Ombre : `0 1px 2px` + `0 4px 16px` à 5 % d'opacité.

## Composants
- **Bandeau héros** : grand chiffre, barre répartie agent H / n8n, 2 faits.
- **Liste classée** : rang, nom, outil, heures, durée aujourd'hui, score avec barre.
- **Matrice gain / effort** : quadrant « gain rapide » teinté, taille = heures, couleur = outil.
- **Fiche rapport** : anneau de score, 4 chiffres clés, axe métier / axe technique, étapes numérotées, vigilance en ambre.
- **Preuve de l'agent** : 3 sites qui se cochent, avant / après, gain en %.

## Accessibilité
Contraste du texte courant au moins 7 sur 1 ; boutons blancs sur vert 700 (environ 5,3 sur 1) ; focus visible ; couleur jamais seule (étiquettes et légendes) ; animations réduites si demandé.

## À faire
- Remplacer le logo (`logo.tsx`) et ajuster le vert si le logo impose une autre teinte.
- Version sombre : non faite, volontairement (démo projetée en mode clair).
