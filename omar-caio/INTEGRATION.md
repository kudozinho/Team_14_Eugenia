# Intégration CAIO ↔ autres membres — Ghost Team 14

## 1. Alejandro — Recorder → filtres → événements §1

Le Recorder **exclut les domaines et applications non autorisés avant de lire l'écran**. Le module de nettoyage n'est qu'une protection supplémentaire, non la décision d'autorisation.

```python
import json
from pathlib import Path
from filtres.nettoyage import nettoyer_evenement

profiles = json.loads(Path('commun/donnees/profils-metier.json').read_text(encoding='utf-8'))
profil = next(p for p in profiles if p['id'] == 'immobilier')

evenement_nettoye = nettoyer_evenement(
    evenement_brut,
    profil,
    domaines_autorises={'immogest.example', 'portail-a.example', 'portail-b.example', 'portail-c.example'},
)
# Envoyer seulement evenement_nettoye à Supabase, JAMAIS evenement_brut.
# Ne pas stocker de screenshot brut / miniature ici.
```

Validation au branchement : **10 événements réellement capturés**, aucun nom/numéro/contact brut ; événement `hors_perimetre` sans contenu.

## 2. Vladimir + Henriquet — Formulaire → prompt §9

```python
import json
from pathlib import Path
from detection.prompts import assembler_prompt

base=Path('commun/donnees')
profil=next(x for x in json.loads((base/'profils-metier.json').read_text()) if x['id']=='immobilier')
contexte=json.loads((base/'contexte-entreprise-exemple.json').read_text())
poste=next(x for x in json.loads((base/'postes-exemple.json').read_text()) if x['id']=='poste_assistante')

prompt = assembler_prompt(profil, contexte, poste)
# prompt contient exactement les champs §9 : id, organisation_id, poste_id, version, empreinte, contenu.
# Relire et approuver le prompt avant de le stocker dans prompts_systeme.
```

Le résumé d'entreprise doit correspondre au contrat §7 ; le poste au §8. Le poste et le contexte doivent être associés à la même organisation.

## 3. Henriquet + Alejandro — événements → tâches §2

```python
from detection.detection import detecter_taches

taches = detecter_taches(
    evenements_depuis_supabase,
    prompt_empreinte=prompt['empreinte'],
    frequence_semaine=None,  # fournir une fréquence réelle vérifiée, sinon gain inconnu
)
# Tâches au format §2, `score` et `fiche` = null jusqu'au calcul du CDO.
```

Les événements viennent **d'un seul audit** par appel. La durée d'une séquence est la somme des `duree_s` connus, sans compter `hors_perimetre`. Une durée manquante exclut le cycle de la moyenne, sans écarter la répétition observée. L'exécution H Company nécessite ensuite un appel distinct au CTO.

## 4. Omar — tâches candidates → analyse LLM §2

```python
from detection.analyse_llm import analyser_candidates, simulateur_local

# SIMULATION uniquement, pour tester le contrat :
taches_test = analyser_candidates(taches, prompt, simulateur_local)

# En production, injecter un callable qui appelle réellement le modèle choisi :
# taches_reelles = analyser_candidates(taches, prompt, appel_modele_avec_cle_env)
```

Le valideur rejette les réponses qui modifient les occurrences, durées, empreintes et autres champs produits par le code. Ne pas envoyer les textes bruts des collaborateurs à l'API.

## 5. Binta — interface vocale §5

```python
from vocal.prompts_vocaux import prompt_reformulation, prompt_solutions

premier_appel = prompt_reformulation(texte_deja_nettoye)
# Afficher la reformulation et demander explicitement la confirmation.

transcription['valide'] = True  # uniquement après le clic explicite de l'utilisateur
second_appel = prompt_solutions(transcription, contexte)
```

Les suggestions vocales utilisent un schéma de travail intermédiaire, puis doivent être converties/validées en tâches §2 par l'orchestrateur. Aucune automatisation sensible sans validation humaine.

## 6. Conditions bloquantes pour la démo réelle

- [ ] Les accès H Company fonctionnent et le CTO a exécuté un agent sur les portails de test.
- [ ] Supabase contient les événements §1 réellement collectés (sans PII).
- [ ] n8n peut récupérer le contexte §7 et déclencher l'alerte J2.
- [ ] Le CDO fournit score et gains §10 issus d'hypothèses explicites.
- [ ] Le résultat de l'agent est confirmé **en lisant les annonces réellement créées**.
- [ ] L'ensemble a été testé trois fois de suite, sans modification des prompts après vendredi 11h.

## Analyse du Recorder avec Holo

Depuis la racine, sur un export d'un seul audit dont le floutage a été vérifié :

```sh
python3 omar-caio/analyser_audit.py commun/donnees/evenements-exemple.json --simulation
python3 omar-caio/analyser_audit.py chemin/vers/export-nettoye.json --modele ID_HOLO_VERIFIE
```

Le mode Holo attend `HAI_API_KEY` dans l'environnement. Seuls le contexte
fictif et les candidates structurées sont transmis au modèle. Vérifier la tâche
§2 et ses consignes avant le transfert à l'agent H. Le script écrit le JSON
sur la sortie standard et ne lance aucune session agent.
