# Score et gain (chantier D, Henriquet)

Source unique des chiffres : `commun/donnees/taches-semaine-agence.json`. Données FICTIVES (Agence Belvédère, 10 personnes).

| Fichier | Rôle |
|---|---|
| `score.py` | Les formules : gain net (formule du professeur), note du gain, score sur 100, quadrant, garde-fous |
| `notes_criteres.json` | Notes facilité, effort, risque, confiance des 3 tâches de la matrice (doc 07, 18 b) |
| `calcul_gain.py` | Calcule les 3 tâches et écrit `resultats_scores.json` |
| `resultats_scores.json` | Résultat pour le rapport (Binta) et les slides (Assel) |
| `ecrire_score_en_base.py` | Mercredi 14h : écrit le score de la tâche détectée dans `taches_detectees` |
| `test_score.py` | Vérifie qu'on retrouve les chiffres du doc 07 |

## Résultat

| Tâche | Score | Gain net | Quadrant | Outil |
|---|---|---|---|---|
| Recopier une annonce sur 3 sites sans passerelle (démo) | 73 / 100 | 49 h/an | gain rapide | Agent H |
| Relance des acquéreurs après la visite | 85 / 100 | 84 h/an | gain rapide | n8n |
| Compte rendu de visite envoyé au vendeur | 71 / 100 | 72 h/an | gain rapide | n8n |
| **Total des slides** | | **205 h/an** | | |

Pistes à confirmer pendant l'audit (jamais additionnées aux 205 h) : 155 h/an.

## Les formules

- **Gain net (heures par an)** = personnes × opérations par an et par personne × minutes gagnées ÷ 60 × adoption × part récupérée. Adoption et part récupérée ne sont jamais à 100 %.
- **Note du gain** : moins de 10 h = 1 ; 10 à 24 = 2 ; 25 à 59 = 3 ; 60 à 149 = 4 ; 150 et plus = 5.
- **Score sur 100** = (0,35 × gain + 0,20 × facilité + 0,20 × (6 − effort) + 0,15 × (6 − risque) + 0,10 × confiance) × 20.
- **Quadrant** : gain ≥ 3 et effort ≤ 2 = gain rapide ; gain ≥ 3 et effort ≥ 3 = projet ; gain < 3 et effort ≤ 2 = à regrouper ; sinon à écarter.
- **Garde-fous** : risque à 5 = « à ne pas automatiser », hors classement ; confiance à 1 ou 2 = « à mesurer ».

Chaque hypothèse est écrite dans le champ `hypotheses` du score, avec la personne à qui la vérifier.

## Commandes

```
python -m pytest henriquet-cdo/scoring -q
python henriquet-cdo/scoring/calcul_gain.py
python henriquet-cdo/scoring/ecrire_score_en_base.py --tache-id <id>                     # affichage seulement
python henriquet-cdo/scoring/ecrire_score_en_base.py --tache-id <id> --minutes-gagnees 9 --ecrire
```

## Mercredi 14h (bout en bout n°1)

1. Omar a écrit la tâche détectée dans `taches_detectees` : récupérer son `id`.
2. Lancer `ecrire_score_en_base.py --tache-id <id>` sans `--ecrire` et relire le score.
3. Si les sessions jouées ont donné une vraie durée, ajouter `--minutes-gagnees <valeur>`.
4. Relancer avec `--ecrire`. Binta lit le champ `score` pour le rapport.
