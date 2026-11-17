# Ghost — Preuves et limites techniques (CAIO)

Généré à partir du kit de données fictives. **Aucun test H Company, Supabase, n8n ou Claude réel dans ce rapport.**

## Détection automatique
- Tâches indépendantes détectées : 2.
- Process principal : Recopier une annonce sur 3 sites sans passerelle.
- Séquence : ImmoGest / fiche mandat → Portail A / formulaire → Portail B / formulaire → Portail C / formulaire.
- Occurrences : 3.
- Durée moyenne observée sur les **cycles complets** : 745 s.
- L'exemple de référence du kit annonce 720 s ; les événements complets permettent de calculer 745 s. La durée du portail C du second cycle est manquante : nous ne l'avons ni inventée ni remplacée par 0.
- La ligne de suivi Excel apparaît 3 fois dans les événements, alors que le fichier cible mentionne 2 occurrences. Écart à clarifier avec l'équipe.
- Aucun temps hebdomadaire ou gain net fiable calculable sans fréquence et temps de l'agent observés.

## Confidentialité
- Exemple : « Appelez M. Dupont au 06 12 34 56 78 » → « Appelez [NOM] au [TELEPHONE] ».
- Motifs locaux, modèle NER français optionnel non installé dans cet environnement ; repli à règles limitées.
- À considérer comme **pseudonymisation heuristique**, pas comme anonymisation garantie.
- Les fichiers non autorisés doivent être exclus **avant la capture**, et non seulement masqués ensuite.

## Reproductibilité
- Banc de test : 10 cas synthétiques, 5 relances chacun.
- Résultats dans `benchmark_SIMULATION_10x5.json` : **simulation de format, non performance IA**.
- Aucun score Haiku/Sonnet ni coût API réel disponible en l'absence de clés et de modèles effectivement configurés.
- `evaluation_benchmark.py` et `provider_anthropic.py` permettent les essais réels (identifiant modèle et clé à fournir).

## Bloquants / intégrations
1. Alejandro : injection de `nettoyer_evenement()` en amont de la base et test 10 événements, plus voie tâche §2 → agent H.
2. Henriquet : fournir événements réels anonymisés via Supabase et mesurer la fréquence.
3. Vladimir : vérifier qu'il n'existe pas d'API adaptée aux portails tests, puis connecter le bon workflow n8n.
4. Binta : relier le tableau de bord aux objets §2 et demander validation humaine avant action sensible.
5. Assel : valider les prompts métier et les règles de conservation et de consentement.

## Limites à mentionner au jury
- Les noms, adresses atypiques et documents libres peuvent échapper aux motifs ; le filtrage est probabiliste/heuristique.
- La détection repère des séquences identiques d'interfaces, pas des intentions métier.
- Le temps d'écran n'est pas le temps total de travail ni une mesure de performance du salarié.
- Aucune automatisation de paiement, signature, changement de prix ou e-mail sans accord humain.
- Une démo en environnement fictif ne démontre ni disponibilité sur les plateformes de production ni conformité juridique complète.
