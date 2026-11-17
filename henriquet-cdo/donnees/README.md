# Agence Belvédère (FICTIVE) : données de démo

Tout est inventé. Régénérer : `python henriquet-cdo/donnees/generer_agence.py` (tirage figé, mêmes chiffres à chaque fois).

| Fichier | Contenu | En base ? | Pour qui |
|---|---|---|---|
| `agence-belvedere.json` | L'agence, **10 collaborateurs** désignés par leur poste (1 gérante, 6 négociateurs, 2 assistantes, 1 gestionnaire locatif), **12 mandats** dans l'Essonne (3 de démo : M-0142, M-0143, M-0144 ; 2 pièges : M-T01, M-T02) | Oui : `utilisateurs`, `postes`, `mandats` | Tous |
| `stats-portails-semaine.json` | Vues, contacts et favoris par bien et par portail, semaines 2026-S46 et 2026-S47 (60 lignes). **S47 = semaine du rapport aux vendeurs de la démo.** | Oui : `stats_portails` | Piste « à confirmer pendant l'audit » seulement (pas la démo) |
| `prospects-fictifs.json` | 20 prospects inventés et cohérents avec les mandats (budget, villes, type de bien, financement, apport, délai, source, étape). Noms courants, numéros 06 00 00 00 xx, e-mails @example.com | **Non, jamais** (contrainte : ne pas stocker les coordonnées des prospects) | Vladimir (n8n, relances) |

| `base-connaissances-immobilier.json` | Doc 07, partie 20, au format commun : 8 process, 11 termes, 8 catégories de logiciels, 10 tâches répétitives (durées [H]), 6 obligations, 6 données sensibles, 7 choses déjà automatisées. Régénérer : `generer_base_connaissances.py` | Oui : `profils_metier.config.base_connaissances` (profil `immobilier`) | Omar (couche métier du prompt, nommage des tâches, réponse « outil existant ») |

## Statut après la décision d'Assel (17/11, 13h35) : démo figée sur la recopie d'annonces

- **Démo live** : l'assistante recopie une annonce sur 3 sites sans passerelle, et l'agent H le fait à sa place. Les **3 mandats de démo** (M-0142, M-0143, M-0144) fournissent le contenu des annonces.
- **Mandats pièges** (demande d'Assel du 17/11) : `M-T01` n'a pas de classe énergie, `M-T02` est un T3 de 680 m² à 329 000 € (484 €/m², hors de la fourchette de 1 500 à 6 000 €/m² fixée dans la base de connaissances). Le champ `piege` décrit la règle et le comportement attendu : l'agent ne publie sur aucun portail et répond `statut = "signale"` avec la raison. Les 10 autres mandats ont `piege` à `null`. Un `assert` dans `generer_agence.py` vérifie que seuls les 2 pièges sortent des règles.
- **`stats_portails` et `stats-portails-semaine.json`** : préparés pendant la piste « rapport aux vendeurs », qui est **annulée pour la démo**. On les garde comme matière pour la piste « à confirmer pendant l'audit ». Ils ne servent ni à la démo live ni au chiffre des slides.
- **Chiffre des slides** : 205 h/an (les 3 tâches de la matrice). Source unique : `commun/donnees/taches-semaine-agence.json`.

## Hypothèses [H]

- Prix : ordres de grandeur plausibles pour l'Essonne fin 2026 (de 2 400 à 5 800 €/m2 selon la ville), non vérifiés.
- Honoraires : barème fictif dégressif (5 % sous 200 000 €, 4,5 % jusqu'à 400 000 €, 4 % au delà), charge vendeur.
- Vues et contacts : tirés au hasard autour de 260 vues par semaine sur le portail A, avec un taux de contact de 1,2 à 3 %. À recaler si un gérant nous donne de vrais ordres de grandeur.
