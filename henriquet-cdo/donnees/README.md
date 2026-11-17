# Agence Belvédère (FICTIVE) : données de démo

Tout est inventé. Régénérer : `python henriquet-cdo/donnees/generer_agence.py` (tirage figé, mêmes chiffres à chaque fois).

| Fichier | Contenu | En base ? | Pour qui |
|---|---|---|---|
| `agence-belvedere.json` | L'agence, **10 collaborateurs** désignés par leur poste (1 gérante, 6 négociateurs, 2 assistantes, 1 gestionnaire locatif), **10 mandats** dans l'Essonne (3 de démo : M-0142, M-0143, M-0144) | Oui : `utilisateurs`, `postes`, `mandats` | Tous |
| `stats-portails-semaine.json` | Vues, contacts et favoris par bien et par portail, semaines 2026-S46 et 2026-S47 (60 lignes). **S47 = semaine du rapport aux vendeurs de la démo.** | Oui : `stats_portails` | Vladimir (back-offices des 3 sites), Alejandro (vérifier ce que l'agent H relève), Binta (rapport) |
| `prospects-fictifs.json` | 20 prospects inventés (06 00 00 00 xx, @example.com) | **Non, jamais** (contrainte : ne pas stocker les coordonnées des prospects) | Vladimir (n8n, relances) |

## Pourquoi ce format (changement de démo du 17/11, mail d'Assel)

La recopie d'annonces sur 3 sites est déjà faite par la passerelle du logiciel d'agence : Ghost doit répondre « rien à construire ».
La tâche exécutée en direct par l'agent H devient **le rapport hebdomadaire aux vendeurs** : relever, sur le back-office de chaque portail, les vues et les contacts de chaque bien.

- Les 3 back-offices affichent les lignes de `stats_portails` de leur portail pour la semaine 2026-S47.
- La réussite de l'agent se vérifie **par le code** : les chiffres qu'il rapporte doivent être égaux à ceux de `stats_portails`.
- Les 3 biens de démo (`demo = true`) suffisent pour la démo live ; les 7 autres donnent de la matière au tableau de bord.

## Hypothèses [H]

- Prix : ordres de grandeur plausibles pour l'Essonne fin 2026 (de 2 400 à 5 800 €/m2 selon la ville), non vérifiés.
- Honoraires : barème fictif dégressif (5 % sous 200 000 €, 4,5 % jusqu'à 400 000 €, 4 % au delà), charge vendeur.
- Vues et contacts : tirés au hasard autour de 260 vues par semaine sur le portail A, avec un taux de contact de 1,2 à 3 %. À recaler si un gérant nous donne de vrais ordres de grandeur.
