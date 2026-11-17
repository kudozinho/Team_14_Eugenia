# Sessions jouées · mercredi 18/11, 9h-10h, sur l'ordinateur d'Assel

Henriquet joue l'**assistante** de l'Agence Belvédère (fictive). Le Recorder d'Alejandro tourne.
But : produire de **vraies traces** pour la détection d'Omar (14h) et **chronométrer** la vraie durée d'une annonce recopiée sur 3 sites.

## Le matériel (dans ce dossier)

| Fichier | Usage |
|---|---|
| `immogest_mandats.csv` | Les 6 mandats à recopier. À importer dans un Google Sheet nommé **« ImmoGest - Mandats »** : c'est le « logiciel d'agence » fictif d'où l'on copie |
| `suivi_publications.csv` | À importer dans un 2e Google Sheet nommé **« Suivi des publications »** : on y coche chaque portail après publication |
| `photos/M-0142.jpg` ... | Une photo fictive par bien, à envoyer sur le site C (photo obligatoire) |
| `verifications.sql` | Les requêtes de contrôle entre les 2 sessions et à la fin |

Import d'un CSV dans Google Sheets : sheets.new, puis Fichier › Importer › Importer, choisir le fichier, « Remplacer la feuille de calcul ».

## Les 3 sites (formulaires différents, c'est voulu)

| Site | Adresse | Ce qu'il faut remplir |
|---|---|---|
| A | ghost-portail-a.vercel.app/deposer | titre, prix, surface, ville, description · bouton **Publier** |
| B | ghost-portail-b.vercel.app/nouvelle | commune (menu), intitulé, superficie, montant, texte · bouton **Enregistrer l'annonce** |
| C | ghost-portail-c.vercel.app/publier | étape 1 : accroche, localisation (menu), surface · étape 2 : prix, descriptif, **photo**, **case à cocher** · **Suivant** puis **Mettre en ligne** |

Les menus de B et C ne proposent que certaines villes : les 6 mandats choisis y sont tous (Massy, Palaiseau, Orsay, Igny, Longjumeau).

## Avant 9h (Henriquet + Alejandro, 15 min)

1. **Purger les exemples du kit** dans Supabase : `henriquet-cdo/supabase/purger_exemples.sql` (ne touche qu'aux identifiants d'exemple).
2. **Recorder lancé**, icône visible et active. Applications autorisées : **Google Chrome** seulement.
3. **Sites autorisés** (déjà en base) : les 3 portails Vercel et `docs.google.com`.
4. **Onglets ouverts dans Chrome, dans cet ordre** : ImmoGest - Mandats · Portail A · Portail B · Portail C · Suivi des publications.
5. **Une messagerie ouverte dans une autre fenêtre** (Gmail ou autre), **non autorisée** : elle doit produire des événements `hors_perimetre`.
6. **Le chronomètre** : Assel ou Vladimir chronomètre sur un téléphone et remplit le tableau en bas. Henriquet ne regarde pas le chrono.
7. Désactiver les notifications de l'ordinateur pendant 1 heure.

## Session 1 · 9h00-9h15 · les 3 mandats de démo

| Minute | Action | Chrono |
|---|---|---|
| 0:00 | Ouvrir ImmoGest, ligne **M-0142** (T3, Massy) | **top départ M-0142** |
| ~0:30 | Portail A : copier titre, prix, surface, ville, description, puis Publier | |
| | Portail B : mêmes infos, menu Commune = Massy, puis Enregistrer l'annonce | |
| | Portail C : étape 1, Suivant, étape 2, photo `M-0142.jpg`, cocher, Mettre en ligne | |
| | Suivi des publications : cocher A, B, C pour M-0142, date et heure | **stop M-0142** |
| | Ouvrir la messagerie 20 secondes, la refermer | (hors chrono) |
| | Recommencer avec **M-0143** (maison, Palaiseau) | **départ / stop M-0143** |
| | Recommencer avec **M-0144** (studio, Orsay) | **départ / stop M-0144** |
| | Ouvrir la messagerie une 2e fois, 20 secondes | (hors chrono) |
| 15:00 | Mettre le Recorder en **pause** | |

Rythme naturel, sans se presser ni traîner : on mesure le vrai temps de travail. Si on n'a pas fini à 15:00, on finit l'annonce en cours et on le note.

## Pause · 9h15-9h30 · contrôle

Lancer `verifications.sql` (ou demander à Claude) : on doit voir des événements sur les 3 portails, sur ImmoGest et sur le suivi, au moins 2 `hors_perimetre`, et des `duree_s` remplies. Les 3 annonces doivent apparaître dans `annonces_portails`. Si quelque chose manque, on prévient Alejandro avant la session 2.

## Session 2 · 9h30-9h45 · 3 autres mandats

Même déroulé, avec **M-0145** (T2, Massy), **M-0146** (pavillon, Igny), **M-0148** (T3, Longjumeau), et la messagerie ouverte 2 fois.

## À la fin · 9h45-10h

1. Recorder en pause, puis `verifications.sql`.
2. Remplir le tableau du chrono ci-dessous et l'envoyer dans le groupe.
3. Omar lance sa détection sur les vraies sessions (branchement de 14h).
4. Henriquet calcule le score avec la vraie durée : `python henriquet-cdo/scoring/ecrire_score_en_base.py --tache-id <id> --minutes-gagnees <valeur>`.

## Tableau du chrono (à remplir)

| Session | Mandat | Début | Fin | Durée (min:s) | Remarque (erreur, hésitation, champ difficile) |
|---|---|---|---|---|---|
| 1 | M-0142 | | | | |
| 1 | M-0143 | | | | |
| 1 | M-0144 | | | | |
| 2 | M-0145 | | | | |
| 2 | M-0146 | | | | |
| 2 | M-0148 | | | | |
| | **Moyenne** | | | | |

## Point d'attention : le chiffre des 12 minutes

Les slides disent « 12 min à la main » et les calculs supposent 10 min gagnées par annonce. Ce sont des **hypothèses**. Si le chrono donne nettement moins (par exemple 5 ou 6 min par annonce sur les 3 sites), le gain de la tâche de démo baisse, et donc le total. On garde le vrai chiffre, et on décide avec Assel :
- soit on garde 205 h sur les slides comme **hypothèse déclarée** et on montre la mesure à côté ;
- soit on recalcule avec la mesure.

C'est exactement ce que demande la méthode du professeur : le point de départ déclaré est souvent surestimé, il faut le chronométrer.
