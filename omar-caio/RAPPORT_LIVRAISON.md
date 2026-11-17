# Ghost — livraison du module CAIO — Team 14

## 17 novembre 2026 — état vérifié

Code et fichiers de démonstration générés à partir de `ghost-team14.zip` sans modifier les dossiers des autres membres ni les contrats communs.

**Test automatisé : 35 / 35 tests réussis.** Cela vérifie les scénarios programmés, pas la conformité à des données réelles ni la robustesse production.

### Livrables locaux vérifiés

1. Filtrage local `nettoyer()` : noms courants/avec civilité, téléphones, emails, IBAN, adresses et montants ; profils métier appliqués. 20/20 tests de phrases pièges passent sur le jeu fourni dans le code. Une vraie NER française nécessite `fr_core_news_sm` (facultatif). Des entités peuvent échapper au filtrage.
2. Fonction `assembler_prompt()` : couche métier, entreprise, poste, empreinte SHA-256 et objet §9.
3. Détecteur sans LLM : 3 occurrences de la publication immobilière multiportails et un suivi Excel distinct. La moyenne vérifiable de la publication est 745 secondes sur 2 cycles complets. Le fichier cible affiche 720 secondes, mais manque une durée dans les événements sources. Fréquence hebdomadaire et gain net inconnus sans mesure complémentaire.
4. Analyse LLM : messages pour jusqu'à 5 candidates, JSON §2 strict avec refus de modifier les mesures calculées par le code. Validé localement uniquement avec simulateur, pas avec Claude réel.
5. Deux prompts vocaux : reformulation à confirmer avant recommandations.
6. Harnais de benchmark 10 cas × 5 relances, exemple SIMULATION clairement marqué, script pour deux modèles réels à paramétrer lorsque les accès Claude et IDs exacts seront disponibles.
7. Documentation d'intégration et sections CP2 / CP4 / limites.

### Dépendances non validées par cette livraison

- Recorder macOS et politique de capture **avant lecture** : Alejandro.
- Connexion Supabase : Henriquet et Alejandro.
- Exécution de l'Agent API H Company et vérification des annonces créées : Alejandro / Vladimir.
- Connexions n8n et formulaire : Vladimir.
- Interface, validation vocale et pitch : Binta / Assel.
- Tests comparatifs Claude réels : clé API / crédits / choix des modèles nécessaires.

### Commandes

```bash
python -m pip install -r omar-caio/requirements-test.txt
PYTHONPATH=omar-caio python -m pytest omar-caio/tests -q
PYTHONPATH=omar-caio python omar-caio/generer_livrables.py
```

La racine de travail est le dossier où se trouve `README.md` du projet Ghost. Sur Windows, configurer `PYTHONPATH` avec la syntaxe de l'interpréteur de commandes ou ajouter le répertoire `omar-caio` au `sys.path`.

### À présenter vendredi uniquement après validation en réel

- Démonstration Agent H sur les trois portails ; nombre de publications réellement créées.
- Temps moyen de l'agent, taux de réussite et coût H réellement mesurés.
- Précision métier et stabilité comparée des deux modèles avec annotations de référence.
- Gains annuels calculés par Henriquet à partir de volumes explicitement documentés.

**Attention** : aucune capture réelle, aucun appel Claude, aucun accès à H Company n'a été exécuté dans cet environnement. Les résultats en JSON de la simulation ne sont pas des mesures LLM.
