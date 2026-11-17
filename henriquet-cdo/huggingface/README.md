---
license: cc-by-4.0
language:
- fr
pretty_name: Ghost · Agence immobilière fictive (Agence Belvédère)
size_categories:
- n<1K
task_categories:
- text-classification
- token-classification
tags:
- synthetic
- fictional-data
- process-mining
- task-mining
- real-estate
- french
- pii-masking
configs:
- config_name: mandats
  data_files: data/mandats.jsonl
- config_name: prospects
  data_files: data/prospects.jsonl
- config_name: collaborateurs
  data_files: data/collaborateurs.jsonl
- config_name: taches_semaine_agence
  data_files: data/taches_semaine_agence.jsonl
- config_name: scores
  data_files: data/scores.jsonl
- config_name: evenements_exemple
  data_files: data/evenements_exemple.jsonl
- config_name: phrases_pieges
  data_files: data/phrases_pieges.jsonl
- config_name: profils_metier
  data_files: data/profils_metier.jsonl
---

# Ghost · Agence immobilière fictive (Agence Belvédère)

> **Toutes les données sont fictives, aucune donnée réelle.** Aucune personne, aucun bien et aucune agence de ce jeu de données n'existe. Les noms sont inventés, les numéros sont de la forme `06 00 00 00 xx` ou dans la plage `06 39 98 xx xx` réservée à la fiction, les e-mails sont en `@example.com` ou `@example.org`, les IBAN commencent par `FR00` (clé invalide) et les adresses sont fictives.

Jeu de données de démonstration de **Ghost** (« See the work. Ghost the task. »), projet de la Team 14 au hackathon **Build The Future** (Eugenia School × H Company, 16 au 20 novembre 2026).

Ghost observe le travail sur écran, uniquement dans les logiciels et les sites que le salarié autorise, repère les tâches répétitives, les note, fait exécuter l'une d'elles par un agent computer use de H Company pour chronométrer le gain, puis livre un plan d'automatisation.

Code source : https://github.com/kudozinho/Team_14_Eugenia

## Le cas de démonstration

L'**Agence Belvédère**, agence immobilière fictive de Massy (Essonne), 10 personnes : 1 gérante, 6 négociateurs, 2 assistantes, 1 gestionnaire locatif. Tâche de démo : une assistante recopie chaque annonce sur 3 sites d'annonces qui n'ont pas de passerelle avec son logiciel.

## Contenu

| Sous-ensemble | Lignes | Contenu | Sert à |
|---|---|---|---|
| `mandats` | 10 | Biens à vendre : titre, type, ville, surface, pièces, prix, classe énergie, honoraires, description. 3 servent à la démo | Remplir les annonces recopiées, par l'humain puis par l'agent |
| `prospects` | 20 | Acheteurs fictifs : projet, recherche, budget, financement, délai, source, étape, biens suivis | Workflows de relance (n8n) |
| `collaborateurs` | 10 | Les postes de l'agence, sans nom de personne | Rattacher les sessions observées à un poste |
| `taches_semaine_agence` | 11 | Semaine type : fréquence, durée, minutes gagnées, adoption, part récupérée, méthode (agent H, n8n, rien) et statut (`justifie`, `a_confirmer`, `hors_gain`) | Calcul du gain |
| `scores` | 3 | Score sur 100, quadrant et gain net des 3 tâches retenues (205 h/an au total), avec les hypothèses | Rapport et matrice gain / effort |
| `evenements_exemple` | 17 | Événements captés par le Recorder, déjà floutés (`[NOM]`, `[TELEPHONE]`, `[MONTANT]`) | Tester la détection des tâches répétées |
| `phrases_pieges` | 20 | Phrases pour tester le floutage, avec la sortie attendue après floutage (profil immobilier). Fournies par Omar | Tester les filtres de confidentialité |
| `profils_metier` | 3 | Profils immobilier, comptable, avocat : contexte, motifs à flouter, prompt, base de connaissances (immobilier) | Couche « métier » des prompts |

## Méthode de calcul du gain

Gain net (heures par an) = personnes × opérations par an et par personne × minutes gagnées ÷ 60 × adoption × part récupérée.
Score sur 100 = (0,35 × gain + 0,20 × facilité + 0,20 × (6 − effort) + 0,15 × (6 − risque) + 0,10 × confiance) × 20, chaque critère noté de 1 à 5.

**Toutes les fréquences et durées sont des hypothèses** : elles doivent être chronométrées pendant un vrai audit avant toute décision.

## Utilisation

```python
from datasets import load_dataset

mandats = load_dataset("Kudozin/ghost-agence-immobiliere-fictive", "mandats", split="train")
pieges = load_dataset("Kudozin/ghost-agence-immobiliere-fictive", "phrases_pieges", split="train")
```

## Limites

- Données inventées pour une démonstration de 4 jours : elles ne décrivent pas le marché immobilier réel.
- Les prix suivent des ordres de grandeur plausibles pour l'Essonne fin 2026, sans vérification.
- Les phrases pièges utilisent des numéros de la plage 06 39 98 xx xx, réservée par l'ARCEP aux œuvres de fiction, des noms inventés et des e-mails en example.com ou example.org.

## Licence

CC-BY-4.0. Team 14, Eugenia School, novembre 2026.
