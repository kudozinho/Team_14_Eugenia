# Ghost — Livrables CAIO (Team 14)

## Statut et vérifications

Le nettoyage local et la détection sont couverts par 72 tests. Assel a validé le floutage sur le Mac de démonstration. Le branchement Supabase est fusionné dans la PR #48.

Le 18 novembre, la session Windows a permis de repérer trois passages A → B → C. Après accord d’Assel, la qualification Holo a utilisé la moyenne des trois chronos humains, soit 244 s. La tâche `tache_a1a0c7545c805f328eba1e25` a été insérée et relue dans Supabase. [Preuves et limites de cette session](preuves/2026-11-18-session1/README.md)

Les deux prompts vocaux sont disponibles. La transcription Whisper sur un audio fictif d’une minute, l’extraction et la validation des règles restent à valider de bout en bout. Le benchmark de deux modèles en appels réels reste à produire selon la priorité donnée par Assel.

### Dossiers

| Fichier | Rôle | Qui l'utilise |
|---|---|---|
| `filtres/nettoyage.py` | `nettoyer(texte, profil)`, `nettoyer_evenement(...)` | Alejandro |
| `detection/detection.py` | Actions, répétitions ≥ 3, durées et tâches §2 | Henriquet / Alejandro |
| `detection/prompts.py` | `assembler_prompt(profil, contexte, poste)` → §9 | Vladimir / Henriquet |
| `detection/analyse_llm.py` | Prompt d'analyse et validation JSON §2 | Alejandro / Henriquet |
| `detection/provider_anthropic.py` | Connecteur Claude facultatif | Omar |
| `vocal/prompts_vocaux.py` | Prompts reformulation et solutions | Binta |
| `evaluation_benchmark.py` | Protocole 10 cas × 5 appels | Omar |
| `lancer_benchmark_reel.py` | Comparaison de deux modèles Claude réels | Omar |
| `generer_livrables.py` | Génère les exemples synthétiques, sans réseau | Omar |
| `tests/` | Tests automatiques | Tous |
| `exemples/` | JSON et éléments CP2/CP4 | Équipe |
| `INTEGRATION.md` | Contrat de branchement | CTO/CAO/CDO/CPO |

### Mise en route (depuis la racine du ZIP)

Python 3.10+ est nécessaire. Le projet utilise **la bibliothèque standard** pour son fonctionnement de base, et `pytest` pour les tests.

```bash
python -m pip install -r omar-caio/requirements-test.txt
PYTHONPATH=omar-caio python -m pytest omar-caio/tests -q
PYTHONPATH=omar-caio python omar-caio/generer_livrables.py
```

Le moteur local de reconnaissance des entités nommées est facultatif. S'il est disponible, il est utilisé ; sinon, les motifs du profil métier et des règles limitées de détection des noms fonctionnent sans téléchargement. Pour l'ajouter :

```bash
python -m pip install spacy
python -m spacy download fr_core_news_sm
```

Cela **n'élimine pas** toutes les fuites potentielles. Utiliser des données fictives pour la démo et ne pas autoriser la capture d'informations sensibles.

### Benchmark réel Claude (identifiants de modèles à vérifier)

Le plan mentionne « Haiku 5.5 » et « Sonnet 5.5 » ; on ne suppose pas ici leurs identifiants exacts ni leur disponibilité. Utiliser les IDs vérifiés dans le compte de l'équipe. Aucune clé ne doit entrer dans Git.

```bash
export ANTHROPIC_API_KEY='...'
PYTHONPATH=omar-caio python omar-caio/lancer_benchmark_reel.py \
  --modele-a ID_MODELE_HAIKU --modele-b ID_MODELE_SONNET
```

Le protocole réalise 50 appels **par modèle**, donc consomme des crédits réels. Sans prix entrés par argument, le coût en dollars reste `null`. Le taux d'accord mesure la stabilité des décisions et non la justesse ; la précision métier exige des vérités terrain annotées.

### Critères de validation

- **Floutage :** 20 phrases pièges vérifiées automatiquement ; vérifier ensuite sur 10 événements réellement enregistrés et sans texte brut en base.
- **Détection :** `evenements-exemple.json` doit produire « ImmoGest → Portail A → B → C », occurrences 3. La deuxième séquence Excel doit rester indépendante.
- **LLM :** JSON §2 strict, valeurs fermées et mesures immuables ; 10 cas × 5 relances avec modèle réel.
- **H Company :** seule une vraie session H et un contrôle des annonces publiées peuvent prouver l'exécution, pas les résultats du détecteur.

### Écarts par rapport aux chiffres du kit

Le fichier `tache-detectee-exemple.json` contient une **durée prévue de 720 s** ; les événements observés contiennent 730 s, une session incomplète, puis 760 s. La moyenne des deux sessions complètes est **745 s**. Aucune valeur manquante n'est inventée. Le fichier cible indique aussi 2 occurrences Excel, alors que les événements en présentent 3. Ce sont des incohérences entre exemples, pas des bugs à « corriger » artificiellement.

### Sécurité et limitations

Ce module masque des motifs, mais **ne garantit pas l'anonymat**. Le contrôle des sites autorisés doit intervenir **avant** la capture. Les miniatures ne sont jamais conservées dans la fonction d'intégration fournie. Le moteur de détection compte des séquences de fenêtres, il n'infère pas automatiquement le but du salarié. Aucun classement des employés, aucune mesure individuelle de productivité. La conservation, l'information des salariés et les droits d'accès sont à valider avant tout usage réel.
